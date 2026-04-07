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
import { CurrentUser } from 'src/auth/current-user.decorator';

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
    @CurrentUser('id') userId: string
  ) {
    return this.subTeamService.createSubTeam(teamId, dto, userId);
  }

  @Get('sub-teams/:id')
  getSubTeam(@Param('id') id: string) {
    return this.subTeamService.getSubTeam(id);
  }

  @Put('sub-teams/:id')
  updateSubTeam(
    @Param('id') id: string,
    @Body() dto: UpdateSubTeamDto,
    @CurrentUser('id') userId: string
  ) {
    return this.subTeamService.updateSubTeam(id, dto, userId);
  }

  @Delete('sub-teams/:id')
  deleteSubTeam(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.subTeamService.deleteSubTeam(id, userId);
  }

}