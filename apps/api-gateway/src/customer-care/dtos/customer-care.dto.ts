import { IsNumberString, IsOptional, Length } from "class-validator";

export class IvrCobranzaDto {
    @IsNumberString()
    @Length(6,11, { message: `DNI debe tener entre 6 y 11 digitos`})
    dni: string
}

export class IvrJuridicalDto {
    @IsNumberString()    
    personId: string
}

export class IvrJuridicalInfoDto {
    @IsNumberString()
    @Length(6,11, { message: `DNI debe tener entre 6 y 11 digitos`})
    cuit: string
}

export class IvrPacksDto {
    @IsNumberString()
    @Length(6,11, { message: `DNI debe tener entre 6 y 11 digitos`})
    dni: string
}

export class IvrSohoDto {
    @IsNumberString()    
    num: string
}

export class CSPFrontDniDto {
    @IsNumberString()
    @IsOptional()
    @Length(6,11, { message: `DNI debe tener entre 6 y 11 digitos`})
    dni?: string
}

export class CSPFrontAniDto {
    @IsNumberString()        
    ani?: string
}