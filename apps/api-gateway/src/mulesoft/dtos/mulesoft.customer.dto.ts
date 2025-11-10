import { IsDateString, IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

export class AniParamDto {
  @Length(10, 10, { message: 'El ANI debe tener exactamente 10 dígitos' })
  @IsNumberString({}, { message: 'El ANI debe contener solo números' })
  ani: string;
}

export class DniParamDto {
  @Length(6, 11, { message: 'El DNI debe tener entre 6 y 11 dígitos' })
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

export class CbsProductInventoryDto {
  @Length(10, 10, { message: 'El ANI debe tener exactamente 10 dígitos' })
  @IsNumberString({}, { message: 'El ANI debe contener solo números' })

  ani: string;

  @IsOptional()
  'x-correlation-id'?: string;
}

export class ContactDto {
  @Length(10, 10, { message: 'El ANI debe tener exactamente 10 dígitos' })
  @IsNumberString({}, { message: 'El ANI debe contener solo números' })
  ani: string;
}

export class CancellationDto {  
  @IsOptional()
  xcorrelationid?: string;
    
  @IsOptional()  
  @IsIn(['accept', 'reject'])
  action?: 'accept' | 'reject';
}

export class LoansOfferringDto {
  @IsOptional()
  xcorrelationid?: string;
}

export class YoizenDto {
  @Length(10, 10, { message: 'El ANI debe tener exactamente 10 dígitos' })
  @IsNumberString({}, { message: 'El ANI debe contener solo números' })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  elementName: string;
}

export class DigitalBillingDto {
  @IsOptional()
  xcorrelationid?: string;
}

export class AdditionalOrderingDto {
  @IsOptional()
  xcorrelationid?: string;
}

export class CustumerCorpoDto {
  @Length(11, 11, { message: 'El CUIT debe tener exactamente 11 dígitos' })
  @IsNumberString({}, { message: 'El CUIT debe contener solo números' })
  cuit: string;
  
}
