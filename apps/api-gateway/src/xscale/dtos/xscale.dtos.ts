import { IsNumberString, IsString, isString, Length } from "class-validator";

export class PaymentCouponsDto {
    @IsNumberString({},{ message: 'type debe ser numerico' })
    type: string;

    @Length(6, 11, { message: 'El DNI debe tener entre 6 y 11 dígitos' })
    @IsNumberString({},{ message: 'DNI debe ser numerico' })
    dni: string;
}

export class BillingInvoicesDto {
    @IsNumberString({},{ message: 'subscriptionId debe ser numerico' })
    subscriptionId: string;
}

export class CustomerSubscribersDto {
    @IsNumberString({},{ message: 'type debe ser numerico' })
    type: string;

    @Length(6, 11, { message: 'El CUIT debe tener entre 6 y 11 dígitos' })
    @IsNumberString({},{ message: 'CUIT debe ser numerico' })
    cuic: string;
}

export class PaymentDto {
    @IsString()
    EBMID: string;

    @IsNumberString({},{ message: 'SubscriberID debe ser numerico' })
    SubscriberID: string;

    @IsNumberString({},{ message: 'Contract debe ser numerico' })
    Contract: string;
     
    @IsString()
    Company: string;

    @IsNumberString({},{ message: 'IdentificationType debe ser numerico' })
    IdentificationType: string;

    @IsNumberString({},{ message: 'IdentificationNumber debe ser numerico' })
    IdentificationNumber: string;
    
    @IsNumberString({},{ message: 'Amount debe ser numerico' })
    Amount: string;
    
    @IsNumberString({},{ message: 'Amount debe ser numerico' })
    CreditCardNumber: string;

    @IsString()
    CreditCardExpirationDate: string;
    
    @IsNumberString({},{ message: 'CreditCardSecurityCode debe ser numerico' })
    CreditCardSecurityCode: string;
    
}

export class TranBDto {
    @IsNumberString({},{ message: 'ani debe ser numerico' })
    ani: string;
}