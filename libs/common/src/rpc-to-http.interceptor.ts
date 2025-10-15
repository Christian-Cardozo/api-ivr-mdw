// src/common/interceptors/rpc-to-http.interceptor.ts
import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class RpcToHttpInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err: any) => {
        // Nest suele poner el payload de la RpcException en err.error
        const payload = err?.error ?? err;
        const status = payload?.statusCode ?? 502;
        return throwError(() => new HttpException(payload, status));
      }),
    );
  }
}
