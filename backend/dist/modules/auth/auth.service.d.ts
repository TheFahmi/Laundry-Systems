import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            username: string;
            email: string;
            name: string;
            role: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        username: string;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validateToken(token: string): Promise<boolean>;
    findUserByUsername(username: string): Promise<User>;
}
