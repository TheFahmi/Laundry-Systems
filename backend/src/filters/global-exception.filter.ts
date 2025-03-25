import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || 'Error';
      } else {
        message = exception.message;
      }
    } else if (exception instanceof QueryFailedError) {
      // Handle database errors
      status = HttpStatus.BAD_REQUEST;
      
      // Handle UUID validation errors
      if (exception.message.includes('invalid input syntax for type uuid')) {
        message = 'Invalid UUID format';
        error = 'Bad Request';
      } else {
        message = exception.message;
        error = 'Database Error';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    console.error(`[Exception] ${request.method} ${request.url}:`, exception);

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
} 