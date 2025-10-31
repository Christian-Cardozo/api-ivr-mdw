import { IsDateString, IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

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

export class CustomerBillDto {  
  @IsNotEmpty()
  @IsDateString() // ✅ valida que sea formato fecha ISO (ej: 2025-10-30T00:00:00Z)
  startTime?: string;
  
  @IsNotEmpty()
  @IsDateString()
  endTime?: string;
  
  @IsNotEmpty()
  @IsString()
  qoi?: string;
  
  @IsNotEmpty()
  @IsString()
  accountId!: string;
}