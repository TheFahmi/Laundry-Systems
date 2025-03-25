import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username untuk login',
  })
  @IsNotEmpty({ message: 'Username harus diisi' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Password untuk login',
  })
  @IsNotEmpty({ message: 'Password harus diisi' })
  @IsString()
  password: string;
} 