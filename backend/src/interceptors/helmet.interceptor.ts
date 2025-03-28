import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import helmet from 'helmet';

@Injectable()
export class HelmetInterceptor implements NestInterceptor {
  private helmetMiddleware = helmet();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Observable(subscriber => {
      this.helmetMiddleware(request, response, () => {
        next.handle().subscribe({
          next: value => subscriber.next(value),
          error: error => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
} 