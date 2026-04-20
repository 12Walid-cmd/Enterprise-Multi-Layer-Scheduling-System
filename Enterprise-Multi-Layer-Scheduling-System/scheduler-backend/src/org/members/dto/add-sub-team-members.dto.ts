import { IsString } from "class-validator";

export class AddSubTeamMemberDto {
  @IsString()
  userId: string;
}