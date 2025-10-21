import { IsNumberString, IsString, Length } from 'class-validator';

export class AniParamDto {
    @Length(10, 10, { message: 'El ANI debe tener exactamente 10 dígitos' })
    @IsNumberString({}, { message: 'El ANI debe contener solo números' })
    ani: string;
}

export class DniParamDto {
    @Length(7, 8, { message: 'El DNI debe tener entre 7 y 8 dígitos' })
    @IsNumberString({}, { message: 'El DNI debe contener solo números' })
    dni: string;

    @IsString()
    type: string;
}