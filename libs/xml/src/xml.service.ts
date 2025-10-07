// src/servicio/xml.service.ts
import { Injectable } from '@nestjs/common';
import * as xml2js from 'xml2js';

@Injectable()
export class XmlService {
  private builder = new xml2js.Builder({ rootName: 'response' });

  public objectToXml(data: any): string {

    let xmlString = "";
    if (data.status === 200) {

      const dataObj = {
        info: {},
        data: `${data.data}`,
        StatusCode: data.status,
        StatusText: data.statusText
      }

      xmlString = this.builder.buildObject(dataObj);

    }
    else {
      const dataObj = {
        info: `${data.error}`,
        data: `${data.data}`,
        StatusCode: data.status,
        StatusText: data.statusText
      }

      xmlString = this.builder.buildObject(dataObj);
    }

    // Convierte el objeto JavaScript a una cadena XML
    return xmlString;
  }
}