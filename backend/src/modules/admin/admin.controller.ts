import { Controller, Get, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../../guards/admin-role.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

// Define allowed admin roles
const ADMIN_ROLES = ['admin', 'staff', 'manager', 'operator', 'cashier'];

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AdminRoleGuard)
@Roles('admin', 'staff', 'manager', 'operator', 'cashier')
@Controller('admin')
export class AdminController {
  
  // Additional role verification helper
  private verifyAdminAccess(user: any) {
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException('Access denied: Customer accounts cannot access admin resources');
    }
  }
  
  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard data' })
  getDashboard(@Req() req) {
    // Double-check role at the controller level for extra security
    this.verifyAdminAccess(req.user);
    
    const user = req.user;
    
    return {
      message: 'Admin dashboard accessed successfully',
      user: {
        username: user.username,
        role: user.role
      },
      timestamp: new Date().toISOString()
    };
  }
  
  @Get('profile')
  @ApiOperation({ summary: 'Get admin profile' })
  getProfile(@Req() req) {
    // Double-check role at the controller level for extra security
    this.verifyAdminAccess(req.user);
    
    const user = req.user;
    
    return {
      message: 'Admin profile accessed successfully',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
} 