import { IsArray, IsIn, IsNumber, IsNumberString, IsString } from "class-validator";

export class MatrizRuteoDto {
    @IsString()
    rama: string;

    @IsString()
    producto: string;

    @IsString()
    segmento: string;

    @IsString()
    prefijo: string;

    @IsString()
    @IsIn(['DEV', 'PREPROD', 'PROD'])
    ambiente?: 'DEV' | 'PREPROD' | 'PROD';
}

export class CalendarioDto {
    @IsString()
    nombre: string
}

export class DiscaMatrizDto {
    @IsString()
    nvof41: string;

    @IsString()
    nvof17: string;
}

export class EscenariosDto {
    @IsNumberString()
    ani: string;

    @IsNumberString()
    dnis: string;
}

export class FlagsDto {
    @IsString()
    region: string;
    
    @IsString()
    flags: string[];
}