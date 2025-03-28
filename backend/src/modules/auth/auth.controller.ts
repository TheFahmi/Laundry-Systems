import { Controller, Post, Body, Get, Headers, UnauthorizedException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CsrfService } from './services/csrf.service';
import { Request } from 'express';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Autentikasi pengguna dan dapatkan token JWT' })
  @ApiResponse({ status: 200, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Username atau password salah' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Daftar pengguna baru' })
  @ApiResponse({ status: 201, description: 'Registrasi berhasil' })
  @ApiResponse({ status: 409, description: 'Username atau email sudah digunakan' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validasi token JWT' })
  @ApiResponse({ status: 200, description: 'Token valid' })
  @ApiResponse({ status: 401, description: 'Token tidak valid' })
  async validateToken(@Headers('authorization') auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token tidak valid');
    }
    
    const token = auth.split(' ')[1];
    const isValid = await this.authService.validateToken(token);
    
    if (!isValid) {
      throw new UnauthorizedException('Token tidak valid');
    }
    
    return { valid: true };
  }

  @Public()
  @Get('csrf-token')
  @ApiOperation({ summary: 'Mendapatkan CSRF token' })
  @ApiResponse({ status: 200, description: 'CSRF token berhasil didapatkan' })
  getCsrfToken(@Req() req: Request) {
    // The CsrfRequest type is used internally in the service
    return { csrfToken: this.csrfService.generateToken(req as any) };
  }

  @Post('test-csrf')
  @ApiOperation({ summary: 'Test endpoint for CSRF validation' })
  @ApiResponse({ status: 200, description: 'CSRF validation successful' })
  testCsrf(@Body() body: any) {
    return { 
      success: true, 
      message: 'CSRF validation successful',
      received: body 
    };
  }
} 