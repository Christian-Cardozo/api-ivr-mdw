import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { IvrflagsRegionActual } from "../../entities/ivrflags-region-actual";

@Injectable()
export class FlagsService {

    constructor(
        @InjectRepository(IvrflagsRegionActual)
        private readonly flagsRepository: Repository<IvrflagsRegionActual>
    ) { }

    async getFlags(params: any) {
        const {region, flags } = params
        const flagArr = flags.split(/[\s, -]+/).filter(Boolean)        

        const data = await this.flagsRepository.find({where: { flag: In(flagArr), region}})
        const res: Record<string,string> = {}

        for (const d of data){
            res[`Flags.${d.flag}.Nivel`] = `${d.nivel}`
            res[`Flags.${d.flag}.Motivo`] = `${d.motivo}`
        }

        return res
    }
}