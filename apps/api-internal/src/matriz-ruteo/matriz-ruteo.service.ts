import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IvrappsMatrizRuteo } from '../entities/ivrapps-matriz-ruteo.entity';
import { CalendarioServicio } from '../entities/calendario-servicio.entity';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class MatrizRuteoService {
    constructor(
        @InjectRepository(IvrappsMatrizRuteo)
        private readonly repositoryMatriz: Repository<IvrappsMatrizRuteo>,
        @InjectRepository(CalendarioServicio)
        private readonly repositoryCalendario: Repository<CalendarioServicio>,
    ) { }

    async resolverDerivacion(body: any): Promise<{ derivacion: string } | null | any> {

        const { rama, producto, segmento, prefijo, ambiente } = body;

        const registros = await this.repositoryMatriz.findBy({ ambiente });
        if (!registros.length) throw new NotFoundException('No hay reglas de derivacion cargadas para el ambiente');

        const candidatos = registros.filter(r =>
            this.coincideCampo(r.rama, rama) &&
            this.coincideCampo(r.producto, producto) &&
            this.coincideCampo(r.segmento, segmento) &&
            this.coincideCampo(r.prefijo, prefijo)
        );
        if (!candidatos.length) throw new NotFoundException('No se encontro derivación que aplique a los parámetros');

        // Elegir el de mayor peso (y menor id en caso de empate)
        const match = candidatos.reduce((a, b) =>
            a.peso === b.peso ? (a.id < b.id ? a : b) : (a.peso > b.peso ? a : b)
        );

        const calendario = await this.repositoryCalendario.findOneBy({ calendario: match.calendario });
        if (!calendario) throw new NotFoundException('Sin calendario asociado a la regla');

        if (!await this.estaDentroDeHorario(calendario!)) throw new NotFoundException('Fuera de horario de atencion');

        return {
            status: 'OK',
            message: 'Derivacion encontrada',
            derivacion: match.derivacion
        }
    }

    private coincideCampo(campoDb: string, valor: string): boolean {
        if (!campoDb) return false;
        const valores = campoDb.split(',').map(v => v.trim());

        if (valores.includes('*')) {
            //Coincide por *
            return true;
        }

        if (valores.includes('!' + valor)) {
            //No coincide por exclusion de !
            return false;
        }

        if (!valores.includes(valor)) {
            //No coincide por no estar en la lista
            return false;
        }

        //Coincide por estar en la lista
        return true;
    }

    private async estaDentroDeHorario(calendario: CalendarioServicio): Promise<boolean> {

        const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const now = new Date(new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }));

        // Hora actual en AR → "HH:MM:SS"
        const todayTime = new Date().toLocaleTimeString('es-AR', {
            hour12: false, timeZone: 'America/Argentina/Buenos_Aires',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const dayOfWeek = days[now.getDay()]; // 0 (Domingo) a 6 (Sábado)
        const ini = (calendario as any)[`${dayOfWeek}Inicio`] as string; // p.ej. '09:00:00'
        const fin = (calendario as any)[`${dayOfWeek}Fin`] as string;

        // Cerrado explícito
        if (!ini || !fin) return false;
        if (ini === '00:00:00' && fin === '00:00:00') return false;

        const feriados = await this.getFeriados(calendario.feriados);
        if (feriados.some(f => now >= f.inicio && now <= f.fin)) return false;

        return todayTime >= ini && todayTime <= fin;
    }

    async getFeriados(xml?: string): Promise<{ inicio: Date; fin: Date }[]> {
        if (!xml) return [];

        const parsed = await parseStringPromise(xml, { explicitArray: false });
        const rows = parsed?.Campos?.row;
        if (!rows) return [];

        const arr = Array.isArray(rows) ? rows : [rows];
        const year = new Date().getFullYear();

        return arr.map(r => {
            const cols = Array.isArray(r.col) ? r.col : [r.col];
            const get = (name: string) => cols.find((c: any) => c.$.name === name)?._ || null;

            const F = get('F');
            const FF = get('FF');
            const HI = get('HI');
            const HF = get('HF');

            const [dI, mI] = (F || '01/01').split('/').map(Number);
            const [dF, mF] = (FF || F || '01/01').split('/').map(Number);
            const [hI, miI] = (HI || '00:00').split(':').map(Number);
            const [hF, miF] = (HF || '23:59').split(':').map(Number);

            const inicio = new Date(year, mI - 1, dI, hI, miI);
            const fin = new Date(year, mF - 1, dF, hF, miF);

            return { inicio, fin };
        });
    }
}
