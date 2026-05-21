
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';


export enum DomainType {
  CAPABILITY = "CAPABILITY",
  POOL = "POOL",
}

export class CreateDomainDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DomainType)
  @IsOptional()
  type?: DomainType = DomainType.CAPABILITY;


  @IsBoolean()
  @IsOptional()
  exclusive?: boolean;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsUUID()
  owner_user_id?: string;
}


