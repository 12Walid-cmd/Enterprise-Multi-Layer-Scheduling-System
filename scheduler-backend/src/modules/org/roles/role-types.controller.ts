import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { RoleTypesService } from './role-types.service';
import { CreateRoleTypeDto } from './dto/create-role-type.dto';
import { UpdateRoleTypeDto } from './dto/update-role-type.dto';

@Controller('roles/types')
export class RoleTypesController {
  constructor(private readonly roleTypesService: RoleTypesService) {}

  @Post()
  create(@Body() dto: CreateRoleTypeDto) {
    return this.roleTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.roleTypesService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleTypeDto) {
    return this.roleTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleTypesService.remove(id);
  }
}