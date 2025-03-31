import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        // Try all possible token sources
        
        // 1. Check Authorization header (Bearer token)
        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
          console.log('[JWT] Found token in Authorization header');
        }
        
        // 2. Check cookies if header token not found
        if (!token && req.cookies) {
          token = req.cookies['token'];
          if (token) {
            console.log('[JWT] Found token in cookies');
          }
        }
        
        // 3. Last resort - try to parse cookies manually if cookie-parser middleware didn't run
        if (!token && req.headers.cookie) {
          const cookies = req.headers.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'token') {
              token = value;
              console.log('[JWT] Found token in manually parsed cookies');
              break;
            }
          }
        }
        
        if (!token) {
          console.log('[JWT] No token found in request', { 
            headers: Object.keys(req.headers),
            hasCookies: !!req.cookies,
            path: req.path
          });
        } else {
          // Log just the first few characters of the token for debugging
          console.log(`[JWT] Token found (starts with): ${token.substring(0, 15)}...`);
        }
        
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    try {
      // Add debugging to see what we're looking for
      console.log('[JWT] Validating token payload:', {
        sub: payload.sub, 
        username: payload.username,
        role: payload.role
      });
      
      // Safeguard against malformed payload
      if (!payload || !payload.sub) {
        console.error('[JWT] Invalid payload structure, missing sub claim');
        throw new UnauthorizedException('Invalid token structure');
      }
      
      // Try to find the user - with error logging
      console.log(`[JWT] Looking for user with ID: "${payload.sub}"`);
      
      const user = await this.userRepository.findOne({ 
        where: { id: payload.sub } 
      });

      if (!user) {
        console.error(`[JWT] User not found with ID: "${payload.sub}"`);
        
        // Check if any user with that username exists 
        // (this helps diagnose if the user exists but the ID is wrong)
        if (payload.username) {
          const userByUsername = await this.userRepository.findOne({
            where: { username: payload.username }
          });
          
          if (userByUsername) {
            console.log(`[JWT] Found user with username "${payload.username}" but ID doesn't match. Token ID: "${payload.sub}", User ID: "${userByUsername.id}"`);
          } else {
            console.log(`[JWT] No user found with username "${payload.username}" either`);
          }
        }
        
        throw new UnauthorizedException('User not found');
      }

      console.log(`[JWT] User found: ${user.username} (ID: ${user.id})`);
      
      // Remove password from user object before returning
      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.error('[JWT] Error during validation:', error.message);
      throw error instanceof UnauthorizedException 
        ? error 
        : new UnauthorizedException('Token validation failed');
    }
  }
} 