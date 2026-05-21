import { IsUUID } from 'class-validator';

export class AddUserToDomainTeamDto {
  @IsUUID()
  user_id: string;
}