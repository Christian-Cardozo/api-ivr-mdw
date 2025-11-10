// src/common/interceptors/rpc-to-http.interceptor.ts
import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NonRetryableError } from './errors';

@Injectable()
export class RpcToHttpInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err: any) => {
        // ⛔️ No interceptar HttpException: re-lanzar intacta
        if (err instanceof HttpException) {
          return throwError(() => err);
        }

        if (err instanceof NonRetryableError) {
          const o = err.original;
          if (o instanceof HttpException) {
            return throwError(() => o);
          }
        }
        
        // Nest suele poner el payload de la RpcException en err.error
        const payload = err?.error ?? err;
        const status = payload?.statusCode ?? 502;
        return throwError(() => new HttpException(payload, status));
      }),
    );
  }
}
