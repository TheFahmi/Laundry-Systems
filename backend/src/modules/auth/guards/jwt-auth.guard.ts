import { Injectable, ExecutionContext, UnauthorizedException, Optional } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CsrfService } from '../services/csrf.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Optional() private csrfService: CsrfService,
    private reflector: Reflector
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Perform JWT validation
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized: Invalid or missing JWT token');
    }

    // Get the request from the context
    const request = context.switchToHttp().getRequest();
    
    // Skip CSRF validation for auth endpoints
    const excludedRoutes = ['/auth/login', '/auth/register', '/auth/csrf-token'];
    if (excludedRoutes.includes(request.path)) {
      return user;
    }

    // Skip CSRF validation if CsrfService is not available
    if (!this.csrfService) {
      console.warn('CsrfService is not available. Skipping CSRF token validation.');
      return user;
    }

    // Get the CSRF token from the header
    const csrfToken = this.csrfService.getTokenFromHeader(request);
    
    // If no CSRF token is provided, throw an error
    if (!csrfToken) {
      throw new UnauthorizedException('Unauthorized: Missing CSRF token');
    }

    // CSRF validation is handled by the middleware, so if we got here, it's valid
    return user;
  }
} 