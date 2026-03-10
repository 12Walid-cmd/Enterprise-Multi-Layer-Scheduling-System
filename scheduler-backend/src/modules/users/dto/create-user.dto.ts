import { IsEmail, IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { working_mode_enum } from '@prisma/client';

export class CreateUserDto {
    @IsString()
    first_name: string;

    @IsString()
    last_name: string;

    @IsEmail()
    email: string;

    @IsString()
    phone: string;

    @IsString()
    timezone: string;

    @IsBoolean()
    is_active: boolean;

    @IsOptional()
    @IsEnum(working_mode_enum)
    working_mode?: working_mode_enum;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    province?: string;

    @IsOptional()
    @IsString()
    country?: string;
}