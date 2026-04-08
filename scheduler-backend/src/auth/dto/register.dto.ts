// auth/dto/register.dto.ts

import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  phone!: string;

  @IsString()
  timezone!: string;
}

// auth/dto/login.dto.ts
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}