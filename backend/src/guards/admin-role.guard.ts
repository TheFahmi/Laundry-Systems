import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../modules/auth/decorators/public.decorator';

// Define allowed admin roles
const ADMIN_ROLES = ['admin', 'staff', 'manager', 'operator', 'cashier'];

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const path = request.path || 'unknown';

    // Check if the route is an admin route (more explicit URL matching)
    if (path.startsWith('/admin') || path.includes('/admin/')) {
      // If user is not defined or role is not in allowed admin roles, deny access
      if (!user || !ADMIN_ROLES.includes(user.role)) {
        console.log(`[AdminGuard] Access denied for ${user?.username || 'unknown'} (${user?.role || 'no role'}) to ${path}`);
        throw new ForbiddenException('You do not have permission to access this resource');
      }
      
      // Admin routes can only be accessed by allowed admin roles
      console.log(`[AdminGuard] Access granted for ${user.username} (${user.role}) to ${path}`);
    }

    // For non-admin routes, allow access
    return true;
  }
} 