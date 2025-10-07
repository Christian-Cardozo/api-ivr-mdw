import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    HttpException,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class XmlResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const res = context.switchToHttp().getResponse();

        return from(next.handle()).pipe(
            map(async (data) => {
                const resolved = await Promise.resolve(data);
                const json = JSON.stringify(resolved);

                const xml = `
                    <response>
                      <info></info>
                      <data><![CDATA[${json}]]></data>
                      <StatusCode>200</StatusCode>
                      <StatusText>OK</StatusText>
                    </response>`.replace(/^\s+/gm, '').trim();

                res.type('application/xml').status(200);
                return xml.trim();
            }),
            catchError(async (err) => {
                const status = err instanceof HttpException ? err.getStatus() : 500;
                const msg =
                    err instanceof HttpException
                        ? err.getResponse()
                        : err.message || 'Internal Error';
                const statusText =
                    (typeof msg === 'object' && (msg as any).statusText) ||
                    'Error';

                const xml = `
                    <response>
                      <info><![CDATA[${typeof msg === 'string' ? msg : JSON.stringify(msg)}]]></info>
                      <data></data>
                      <StatusCode>${status}</StatusCode>
                      <StatusText>${statusText}</StatusText>
                    </response>`.replace(/^\s+/gm, '').trim();

                res.type('application/xml').status(status);
                return xml.trim();
            }),
        );
    }
}
