import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CustomerCareService } from './customer-care.service';
import { CSPFrontAniDto, CSPFrontDniDto, IvrCobranzaDto, IvrJuridicalDto, IvrJuridicalInfoDto, IvrPacksDto, IvrSohoDto } from './dtos/customer-care.dto';

@Controller('customer-care')
export class CustomerCareController {
  constructor(private readonly customerCareService: CustomerCareService) { }

  @Post('service-adapter/:code')
  getServiceAdapter(
    @Param() { code }: any,
    @Body() body: any,
  ) {
    return this.customerCareService.getServiceAdapter(body, code)
  }

  @Get('cc-ivr-cobranzas/:dni')
  getIvrCobranzas(
    @Param() { dni }: IvrCobranzaDto,
  ) {
    return this.customerCareService.getIvrCobranzas(dni)
  }

  @Get('cc-ivr-delivery/:dni')
  getIvrDelivery(
    @Param() { dni }: IvrCobranzaDto,
  ) {
    return this.customerCareService.getIvrDelivery(dni)
  }

  @Get('cc-ivr-juridical/:personId')
  getIvrJuridical(
    @Param() { personId }: IvrJuridicalDto,
    @Query() params: any
  ) {
    return this.customerCareService.getIvrJuridical(personId, params)
  }

  @Get('cc-ivr-juridical/cliente/:cuit')
  getIvrJuridicalInfo(
    @Param() { cuit }: IvrJuridicalInfoDto,
  ) {
    return this.customerCareService.getIvrJuridicalInfo(cuit)
  }

  @Get('cc-ivr-packs/:dni')
  getIvrPacks(
    @Param() { dni }: IvrPacksDto,
  ) {
    return this.customerCareService.getIvrPacks(dni)
  }

  @Get('ccc-ivr-soho/:num')
  getIvrSoho(
    @Param() { num }: IvrSohoDto,
  ) {
    return this.customerCareService.getIvrSoho(num)
  }

  @Post('ccc-csp-persistencia')
  getCSCPersistencia(
    @Body() body: any,
  ) {
    return this.customerCareService.getCSCPersistencia(body)
  }

  @Get('ccc-csp-front/:dni')
  getCSPFront(
    @Param('dni') dni?: CSPFrontDniDto,
    @Query('ani') ani?: CSPFrontAniDto
  ) {
    return this.customerCareService.getCSPFront(dni?.dni, ani?.ani)
  }
}
