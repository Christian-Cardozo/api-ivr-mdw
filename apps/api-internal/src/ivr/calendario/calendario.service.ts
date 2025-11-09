import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CalendarioServicio } from '../../entities/calendario-servicio.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CalendarioService {

    constructor(
        @InjectRepository(CalendarioServicio)
        private readonly calendarioRepository: Repository<CalendarioServicio>
    ) { }

    async getCalendario(nombre: string) {
        const now = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
        //Y/m/d H:i:s
        //console.log(now)
        const arr = now.split(',')[0].split('/')
        const format = `${arr[2]}/${arr[1]}/${arr[0]} ${now.split(',')[1]}`
        
        //console.log(format)
        return this.calendarioRepository.query('CALL OBTENER_CALENDARIO(?,?)', [nombre, format]);
    }
}
