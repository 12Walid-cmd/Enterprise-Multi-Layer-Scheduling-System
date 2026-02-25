export class CreateTeamDto {
  name: string;
  group_id?: string;
  parent_team_id?: string;
  description?: string;
  timezone?: string;
}