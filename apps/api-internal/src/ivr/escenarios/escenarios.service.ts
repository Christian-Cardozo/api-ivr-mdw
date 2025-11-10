import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IvrtoolsEscenarios } from "../../entities/ivrtools-escenarios.entity";
import { Repository } from "typeorm";
import { parseStringPromise } from "xml2js";

@Injectable()
export class EscenariosService {

    constructor(
        @InjectRepository(IvrtoolsEscenarios)
        private readonly escenariosRepository: Repository<IvrtoolsEscenarios>
    ) { }

    async getEscenarios(params: any) {
        const { ani, dnis } = params
        const data = await this.escenariosRepository.findOneBy({ ani, dnis, habilitado: 1 })

        const parsed = await parseStringPromise(data?.variables!, {
            explicitArray: false,
            attrkey: 'attr',
            charkey: 'text',
        })

        const rows = parsed?.Variables?.row;
        if (!rows) return [];

        const arr = Array.isArray(rows) ? rows : [rows];
        const array: Record<string,string> = {}

        for (let i = 0; i < arr.length; i++) {
            const r = arr[i];
            const cols = Array.isArray(r.col) ? r.col : [r.col];            
            array[`${cols[1].text}`] = cols[2].text
        }
        
        return array;
    }
}