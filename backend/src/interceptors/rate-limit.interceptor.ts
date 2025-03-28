import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private requests = new Map<string, number[]>();
  private readonly limit = 100; // requests per minute
  private readonly windowMs = 60 * 1000; // 1 minute

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;

    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this IP
    const timestamps = this.requests.get(ip) || [];

    // Remove old timestamps
    const recentRequests = timestamps.filter(timestamp => timestamp > windowStart);

    // Check if rate limit is exceeded
    if (recentRequests.length >= this.limit) {
      return throwError(
        () =>
          new HttpException(
            'Too Many Requests',
            HttpStatus.TOO_MANY_REQUESTS,
          ),
      );
    }

    // Add current request timestamp
    recentRequests.push(now);
    this.requests.set(ip, recentRequests);

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    return next.handle().pipe(
      tap(() => {
        // Remove the request timestamp after successful response
        const timestamps = this.requests.get(ip) || [];
        const index = timestamps.indexOf(now);
        if (index > -1) {
          timestamps.splice(index, 1);
          this.requests.set(ip, timestamps);
        }
      }),
    );
  }

  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [ip, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(timestamp => timestamp > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, recentRequests);
      }
    }
  }
} 