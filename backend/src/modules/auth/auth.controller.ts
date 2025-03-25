import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autentikasi pengguna dan dapatkan token JWT' })
  @ApiResponse({ status: 200, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Username atau password salah' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

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
} 