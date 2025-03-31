import { Injectable, ExecutionContext, UnauthorizedException, Optional } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
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
    // Get the request from the context for logging
    const request = context.switchToHttp().getRequest();
    const path = request.path || 'unknown path';
    
    // Enhanced error handling
    if (err) {
      console.error(`[JwtAuthGuard] Error at ${path}:`, err.message);
      throw err;
    }
    
    if (!user) {
      const message = info?.message || 'Invalid or missing JWT token';
      console.error(`[JwtAuthGuard] Authentication failed at ${path}: ${message}`);
      throw new UnauthorizedException(`Unauthorized: ${message}`);
    }
    
    console.log(`[JwtAuthGuard] User ${user.username} authorized for ${path}`);
    
    return user;
  }
} 