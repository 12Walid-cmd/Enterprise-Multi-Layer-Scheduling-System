import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SubTeamService } from './sub-team.service';
import { CreateSubTeamDto } from './dto/create-sub-team.dto';
import { UpdateSubTeamDto } from './dto/update-sub-team.dto';

@Controller('teams')
export class SubTeamController {
  constructor(private readonly subTeamService: SubTeamService) {}

  @Get(':teamId/sub-teams')
  getSubTeams(@Param('teamId') teamId: string) {
    return this.subTeamService.getSubTeams(teamId);
  }

  @Post(':teamId/sub-teams')
  createSubTeam(
    @Param('teamId') teamId: string,
    @Body() dto: CreateSubTeamDto,
  ) {
    return this.subTeamService.createSubTeam(teamId, dto);
  }

  @Get('sub-teams/:id')
  getSubTeam(@Param('id') id: string) {
    return this.subTeamService.getSubTeam(id);
  }

  @Put('sub-teams/:id')
  updateSubTeam(
    @Param('id') id: string,
    @Body() dto: UpdateSubTeamDto,
  ) {
    return this.subTeamService.updateSubTeam(id, dto);
  }

  @Delete('sub-teams/:id')
  deleteSubTeam(@Param('id') id: string) {
    return this.subTeamService.deleteSubTeam(id);
  }

}