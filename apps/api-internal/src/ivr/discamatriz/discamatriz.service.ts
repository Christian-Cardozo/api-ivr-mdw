import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MrProdXml } from "../../entities/mr-prod-xml.entity";
import { parseStringPromise } from "xml2js";

@Injectable()
export class DiscaMatrizService {

    constructor(
        @InjectRepository(MrProdXml)
        private readonly discaMatrizRepository: Repository<MrProdXml>
    ) { }

    async getDiscaMatriz(params: any) {
        const { nvof17, nvof41 } = params
        const data = await this.discaMatrizRepository.findOneBy({ categoria: nvof17, ivr: nvof41 })
        const parsed = await parseStringPromise(data?.xmlData!, { explicitArray: false });
        const of93 = parsed?.Categoria?.of93["$"]["value"]
        const of10 = parsed?.Categoria?.of10["$"]["value"]
        
        return { of93, of10 }
    }
}