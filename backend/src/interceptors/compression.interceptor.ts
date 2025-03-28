import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as compression from 'compression';

@Injectable()
export class CompressionInterceptor implements NestInterceptor {
  private compression = compression();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Observable(subscriber => {
      this.compression(request, response, () => {
        next.handle().subscribe({
          next: value => subscriber.next(value),
          error: error => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
} 