import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { SubTeamService } from './sub-team.service';
import { CreateSubTeamDto } from './dto/create-sub-team.dto';
import { UpdateSubTeamDto } from './dto/update-sub-team.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('sub-teams')
export class SubTeamController {
  constructor(private readonly subTeamService: SubTeamService) { }

  // ===============================
  // 1. parent team dropdown
  // ===============================
  @Get('parent-teams')
  getParentTeams() {
    return this.subTeamService.listRootTeams();
  }

  // ===============================
  // 2. GET ALL subteams (with search)
  // ===============================
  @Get()
  getAll(@Query('search') search?: string) {
    return this.subTeamService.getSubTeams(search);
  }

  // ===============================
  // 3. CREATE subteam
  // ===============================
  @Post()
  createSubTeam(
    @Body() dto: CreateSubTeamDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.subTeamService.createSubTeam(dto, userId);
  }

  // ===============================
  // 4. DETAIL
  // ===============================
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.subTeamService.getSubTeam(id);
  }

  // ===============================
  // 5. UPDATE
  // ===============================
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSubTeamDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.subTeamService.updateSubTeam(id, dto, userId);
  }

  // ===============================
  // 6. DELETE
  // ===============================
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.subTeamService.deleteSubTeam(id, userId);
  }
}