import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as csurf from 'csurf';
import * as cookieParser from 'cookie-parser';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private csrfProtection = csurf({
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    },
  });

  private cookieParser = cookieParser();

  use(req: Request, res: Response, next: NextFunction) {
    // Apply cookie parser first
    this.cookieParser(req, res, () => {
      // Exclude certain routes from CSRF protection if needed
      const excludedRoutes = ['/auth/login', '/auth/register', '/auth/csrf-token'];
      
      if (excludedRoutes.includes(req.path)) {
        return next();
      }

      // Apply CSRF protection
      this.csrfProtection(req, res, next);
    });
  }
} 