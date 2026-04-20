import { Controller, Post, Get, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Query } from '@nestjs/common';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) { }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGroupDto,
  ) {
    return this.groupsService.create(dto, userId);
  }

  // =========================
  // LIST (with search + stats)
  // =========================
  @Get()
  findAll(@Query('search') search?: string) {
    return this.groupsService.findAll(search);
  }

  // =========================
  // DETAIL
  // =========================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  // =========================
  // UPDATE
  // =========================
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupsService.update(id, dto, userId);
  }

  // =========================
  // DELETE
  // =========================
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupsService.remove(id, userId);
  }
}