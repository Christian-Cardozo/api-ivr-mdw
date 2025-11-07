import { IsIn, IsString } from "class-validator";

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