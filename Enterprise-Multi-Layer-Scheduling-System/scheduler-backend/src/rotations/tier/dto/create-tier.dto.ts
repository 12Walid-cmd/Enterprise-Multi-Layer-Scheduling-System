import { IsInt, IsString, Min } from 'class-validator';

export class CreateTierDto {
  @IsInt()
  @Min(1)
  tier_level: number;

  @IsString()
  name: string;
}