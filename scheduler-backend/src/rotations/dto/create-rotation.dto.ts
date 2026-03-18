import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsInt,
    Min,
    IsEnum,
    IsUUID,
    IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
    RotationType,
    RotationCadence,
    RotationScope,
} from '@prisma/client';

export class CreateRotationDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsEnum(RotationType)
    type: RotationType;

    @IsEnum(RotationCadence)
    cadence: RotationCadence;

    @IsOptional()
    @IsInt()
    @Min(1)
    cadence_interval?: number = 1;

    @IsOptional()
    @IsBoolean()
    allow_overlap?: boolean = false;

    @IsOptional()
    @IsInt()
    @Min(1)
    min_assignees?: number = 1;

    @IsEnum(RotationScope)
    scope_type: RotationScope;

    @IsOptional()
    @IsString()
    scope_ref_id?: string;

    @IsDate()
    @Type(() => Date)
    start_date: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    end_date?: Date;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    owner_id?: string;


    @IsBoolean()
    @IsOptional()
    is_active?: boolean = true;

}