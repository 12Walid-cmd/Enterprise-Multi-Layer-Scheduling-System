import { IsString, IsEnum, IsOptional, IsBoolean, IsInt } from "class-validator";
import { RotationType, RotationCadence, RotationScope } from "@prisma/client";

export class CreateRotationDto {
    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsEnum(RotationType)
    type: RotationType;

    @IsEnum(RotationCadence)
    cadence: RotationCadence;

    @IsInt()
    @IsOptional()
    cadence_interval?: number = 1;

    @IsBoolean()
    @IsOptional()
    allow_overlap?: boolean = false;

    @IsInt()
    @IsOptional()
    min_assignees?: number = 1;

    @IsEnum(RotationScope)
    scope_type: RotationScope;

    @IsString()
    @IsOptional()
    scope_ref_id?: string;


    @IsString()
    @IsOptional()
    owner_id?: string;


    @IsBoolean()
    @IsOptional()
    is_active?: boolean = true;

    @IsOptional()
    @IsString()
    description?: string | null;

}