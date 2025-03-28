import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as cors from 'cors';

@Injectable()
export class CorsInterceptor implements NestInterceptor {
  private cors = cors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Observable(subscriber => {
      this.cors(request, response, () => {
        next.handle().subscribe({
          next: value => subscriber.next(value),
          error: error => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
} 