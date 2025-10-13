import {
  CallHandler, ExecutionContext, Injectable, NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

function shapeError(err: any) {
  const status = err?.status ?? err?.statusCode ?? err?.error?.statusCode ?? 500;
  const body = err?.response ?? err?.error ?? { message: err?.message ?? 'Internal error' };
  const statusText =
    (typeof body === 'object' && (body as any).statusText) || 'Error';
  return { status, body, statusText };
}

@Injectable()
export class XmlResponseInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const res = ctx.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        const xml =
          `<response>
            <info></info>
            <data><![CDATA[${JSON.stringify(data)}]]></data>
            <StatusCode>200</StatusCode>
            <StatusText>OK</StatusText>
          </response>`.replace(/^\s+/gm, '').trim();
        res.type('application/xml').status(200);
        return xml;
      }),
      catchError((err) => {
        const { status, body, statusText } = shapeError(err);
        const tmp = typeof body === 'string' ? body : JSON.stringify(body);  
        const info = tmp.replace(/\\n|\\/g, '').replace(/\s{2,}/g, '');          
        const xml =
          `<response>
            <info><![CDATA[${info}]]></info>
            <data></data>
            <StatusCode>${status}</StatusCode>
            <StatusText>${statusText}</StatusText>
          </response>`.replace(/^\s+/gm, '').trim();
        res.type('application/xml').status(status);
        return of(xml); // <- importantísimo
      }),
    );
  }
}
