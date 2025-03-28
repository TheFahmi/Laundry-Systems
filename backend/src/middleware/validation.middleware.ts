import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Check only for POST requests
    if (req.method === 'POST') {
      const body = req.body;
      
      // Check if all values in the body are null
      if (body && typeof body === 'object' && Object.keys(body).length > 0) {
        const allNull = Object.values(body).every(value => value === null);
        
        if (allNull) {
          throw new BadRequestException('Request contains only null values. Please provide valid data.');
        }
      }
    }
    
    next();
  }
} 