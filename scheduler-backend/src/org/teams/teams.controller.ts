import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() dto: CreateTeamDto, @CurrentUser('id') userId: string) {
    return this.teamsService.create(dto, userId);
  }

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto, @CurrentUser('id') userId: string) {
    return this.teamsService.update(id, dto, userId);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.teamsService.remove(id, userId);
  }
}