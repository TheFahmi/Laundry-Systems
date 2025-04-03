import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    const path = context.switchToHttp().getRequest().path || 'unknown';
    
    // If no user or no role, deny access
    if (!user || !user.role) {
      console.log(`[RolesGuard] Access denied for unauthenticated user to ${path}`);
      throw new ForbiddenException('Authentication required to access this resource');
    }
    
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      console.log(`[RolesGuard] Access denied for ${user.username} (${user.role}) to ${path}. Required roles: ${requiredRoles.join(', ')}`);
      throw new ForbiddenException(`Access denied: Your role (${user.role}) does not have permission to access this resource`);
    }
    
    console.log(`[RolesGuard] Access granted for ${user.username} (${user.role}) to ${path}`);
    return true;
  }
} 