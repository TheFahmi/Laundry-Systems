import { Injectable } from '@nestjs/common';
import { Request } from 'express';

// Extended Express Request type with csrfToken method
interface CsrfRequest extends Request {
  csrfToken(): string;
}

@Injectable()
export class CsrfService {
  /**
   * Generate a CSRF token using the request object
   * @param req Express request object with CSRF functionality
   * @returns CSRF token
   */
  generateToken(req: CsrfRequest): string {
    return req.csrfToken();
  }

  /**
   * Get the CSRF token from the request header
   * @param req Express request object
   * @returns CSRF token from header
   */
  getTokenFromHeader(req: Request): string {
    return req.headers['x-csrf-token'] as string || 
           req.headers['x-xsrf-token'] as string;
  }
} 