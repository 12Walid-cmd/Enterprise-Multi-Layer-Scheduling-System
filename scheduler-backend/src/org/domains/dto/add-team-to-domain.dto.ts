import { IsUUID } from 'class-validator';

export class AddTeamToDomainDto {
  @IsUUID()
  team_id: string;
}