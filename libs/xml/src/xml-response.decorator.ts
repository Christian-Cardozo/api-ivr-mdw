// src/common/decorators/xml-response.decorator.ts
import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { XmlResponseInterceptor } from './xml-response.interceptor';

export function XmlResponse() {
  return applyDecorators(UseInterceptors(XmlResponseInterceptor));
}
