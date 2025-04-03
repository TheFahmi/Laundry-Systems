import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GlobalAuthGuard } from './global-auth.guard';
import { AdminRoleGuard } from './admin-role.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GlobalAuthGuard, AdminRoleGuard, RolesGuard],
  exports: [GlobalAuthGuard, AdminRoleGuard, RolesGuard, JwtModule],
})
export class GlobalAuthModule {} 