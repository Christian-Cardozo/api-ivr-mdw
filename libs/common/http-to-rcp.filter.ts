import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(HttpException)
export class HttpToRpcFilter implements ExceptionFilter {
  catch(exception: HttpException, _host: ArgumentsHost): Observable<never> {
    const res = exception.getResponse();
    const status = exception.getStatus();
    const payload = typeof res === 'string'
      ? { message: res, statusCode: status }
      : { ...res, statusCode: status };

    // IMPORTANTE: devolver un Observable, no "throw"
    return throwError(() => new RpcException(payload));
  }
}
