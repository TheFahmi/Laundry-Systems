import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    
    // Default timeout (30 seconds)
    let timeoutDuration = 30000;
    
    // Extend timeout for specific routes that might need more processing time
    if (request && request.path) {
      // Order creation/update endpoints get 60 seconds
      if (
        (request.path.includes('/orders') && (request.method === 'POST' || request.method === 'PUT')) ||
        (request.path.includes('/api/orders') && (request.method === 'POST' || request.method === 'PUT'))
      ) {
        timeoutDuration = 60000; // 60 seconds for order operations
        
        // Check if this is a large order based on items count or request body size
        if (request.body) {
          try {
            // If order has many items or items with large weights, increase timeout
            if (request.body.items && Array.isArray(request.body.items) && request.body.items.length > 5) {
              // Add 5 seconds per item beyond 5 items
              const additionalTime = (request.body.items.length - 5) * 5000;
              timeoutDuration += Math.min(additionalTime, 60000); // Add up to 60 more seconds
            }
            
            // For large request bodies (potentially containing heavy weight items)
            const requestBodySize = JSON.stringify(request.body).length;
            if (requestBodySize > 5000) { // If request body is larger than ~5KB
              timeoutDuration = 120000; // 2 minutes for very large orders
            }
          } catch (e) {
            // In case of error parsing the body, use the default timeout for this route
            console.warn('Error checking request body size in TimeoutInterceptor:', e);
          }
        }
      }
      
      // Payment processing endpoints also get 60 seconds
      if (
        (request.path.includes('/payments') && request.method === 'POST') ||
        (request.path.includes('/api/payments') && request.method === 'POST')
      ) {
        timeoutDuration = 60000; // 60 seconds for payment processing
      }
    }
    
    console.log(`[TimeoutInterceptor] Setting timeout of ${timeoutDuration/1000}s for ${request.method} ${request.path}`);
    
    return next.handle().pipe(
      timeout(timeoutDuration),
      catchError(err => {
        if (err instanceof TimeoutError) {
          console.error(`[TimeoutInterceptor] Request timed out after ${timeoutDuration/1000}s: ${request.method} ${request.path}`);
          return throwError(() => new RequestTimeoutException(`Request timeout after ${timeoutDuration/1000} seconds. Try reducing the number of items or the size of the request.`));
        }
        return throwError(() => err);
      }),
    );
  }
} 