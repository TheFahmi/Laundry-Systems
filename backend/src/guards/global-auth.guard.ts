import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../modules/auth/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log(`[AUTH] Checking auth for route: ${request.method} ${request.url}`);
    
    try {
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        // Log the headers and cookies for debugging
        console.error('Authorization token is missing or invalid.');
        console.error('Headers:', JSON.stringify(request.headers));
        console.error('Cookies:', request.cookies);
        throw new UnauthorizedException('No JWT token provided');
      }

      // Verify the JWT token
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        console.error('JWT_SECRET is not defined in environment variables');
        throw new UnauthorizedException('Server configuration error');
      }
      
      try {
        const payload = await this.jwtService.verifyAsync(token, { secret });
        console.log(`[AUTH] Successfully authenticated user: ${payload.username} (${payload.role})`);
        
        // Attach the user to the request object
        request['user'] = payload;
        
        return true;
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError.message);
        throw new UnauthorizedException('Invalid JWT token');
      }
    } catch (error) {
      console.error('Auth error:', error.message);
      throw error;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    try {
      // First, check if token exists in cookies
      if (request.cookies && request.cookies.token) {
        console.log('Found token in cookies');
        return request.cookies.token;
      }
      
      // Then check if authorization header exists
      if (!request.headers.authorization) {
        console.warn('No authorization header found in request');
        console.log('Request cookies:', request.cookies);
        console.log('Request headers:', request.headers);
        return undefined;
      }
      
      const [type, token] = request.headers.authorization.split(' ');
      
      if (type !== 'Bearer') {
        console.warn(`Invalid authorization type: ${type}. Expected 'Bearer'`);
        return undefined;
      }
      
      if (!token) {
        console.warn('Bearer token is empty in authorization header');
        return undefined;
      }
      
      return token;
    } catch (error) {
      console.error('Error extracting token from header or cookies:', error);
      return undefined;
    }
  }
} 