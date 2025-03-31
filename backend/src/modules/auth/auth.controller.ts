import { Controller, Post, Body, Get, Headers, UnauthorizedException, Req, Res, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { Public } from './decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res() res: Response) {
    try {
      console.log(`[Auth] Login attempt for user: ${loginDto.username}`);
      console.log(`[Auth] Headers:`, JSON.stringify(req.headers));
      console.log(`[Auth] Cookies:`, JSON.stringify(req.cookies));
      
      // Set CORS headers to allow requests from any origin (in development)
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      const result = await this.authService.login(loginDto);
      console.log(`[Auth] Login successful for user: ${loginDto.username}`);
      
      if (!result.token) {
        console.error(`[Auth] Login for ${loginDto.username} successful but no token generated`);
        throw new Error('Token generation failed');
      }
      
      // Set JWT token in cookies with various options for maximum compatibility
      
      // HttpOnly cookie for security
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Add a non-HttpOnly cookie too for client-side access
      res.cookie('auth_token', result.token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      console.log(`[Auth] Cookies set for user ${loginDto.username}`);

      // Return response with user data
      console.log(`[Auth] Returning login response for ${loginDto.username}`);
      res.json(result);
    } catch (error) {
      console.error(`[Auth] Login error for ${loginDto.username}:`, error.message);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async register(@Body() registerDto: RegisterDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.authService.register(registerDto);
    
    // Set JWT token in cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return response with user data
    res.json(result);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid' })
  async validateToken(@Headers('authorization') auth: string) {
    if (!auth) {
      throw new UnauthorizedException('No token provided');
    }

    const token = auth.split(' ')[1];
    const isValid = await this.authService.validateToken(token);

    return { valid: isValid };
  }

  @Public()
  @Post('fix-token/:username')
  @ApiOperation({ summary: 'Force reset a user token issue' })
  @ApiResponse({ status: 200, description: 'User token reset successfully' })
  async fixToken(@Param('username') username: string, @Res() res: Response) {
    try {
      console.log(`[Auth] Attempting to fix token for user: ${username}`);
      
      // Find the user
      const user = await this.authService.findUserByUsername(username);
      
      if (!user) {
        console.log(`[Auth] Token fix failed: No user found with username: ${username}`);
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      console.log(`[Auth] Found user for token fix: ${username} (ID: ${user.id})`);
      
      // Generate a fresh token for this user
      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role
      };
      
      const token = this.jwtService.sign(payload);
      console.log(`[Auth] Generated new token for ${username} (first 15 chars): ${token.substring(0, 15)}...`);
      
      // Set the token in cookies
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Also add a non-HttpOnly cookie for client-side access
      res.cookie('auth_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      return res.json({
        success: true,
        token,
        message: 'Token fixed successfully'
      });
    } catch (error) {
      console.error(`[Auth] Token fix error for ${username}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fix token'
      });
    }
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      console.log('[Auth] Logout request received');
      
      // Clear auth cookies
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      res.clearCookie('auth_token', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      console.log('[Auth] Cookies cleared successfully');
      
      return res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }
  }

  @Public()
  @Post('clear-cookies')
  @ApiOperation({ summary: 'Clear all auth cookies' })
  @ApiResponse({ status: 200, description: 'Cookies cleared successfully' })
  async clearCookies(@Req() req: Request, @Res() res: Response) {
    try {
      console.log('[Auth] Clear cookies request received');
      
      // Clear all authentication-related cookies
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      res.clearCookie('auth_token', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      console.log('[Auth] All cookies cleared successfully');
      
      return res.json({
        success: true,
        message: 'All authentication cookies cleared'
      });
    } catch (error) {
      console.error('Error clearing cookies:', error);
      return res.status(500).json({
        success: false,
        message: 'Error clearing cookies'
      });
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async refreshToken(@Headers('authorization') auth: string, @Res() res: Response) {
    if (!auth) {
      throw new UnauthorizedException('No token provided');
    }

    const token = auth.split(' ')[1];
    try {
      // Verify the token without checking expiration
      const payload = this.jwtService.verify(token, { ignoreExpiration: true });
      
      // Check if user still exists
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate a new token
      const newToken = this.jwtService.sign({
        sub: user.id,
        username: user.username,
        role: user.role
      });

      // Set the new token in cookies
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.json({
        success: true,
        token: newToken,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 