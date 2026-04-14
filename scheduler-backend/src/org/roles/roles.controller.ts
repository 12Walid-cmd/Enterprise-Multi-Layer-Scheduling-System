import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';

@Controller('admin/roles')
export class RolesController {
  constructor(private readonly service: RolesService) { }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateRoleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/permissions')
  addPermission(
    @Param('id') id: string,
    @Body() dto: AssignPermissionDto,
  ) {
    return this.service.addPermission(id, dto);
  }

  @Delete(':id/permissions/:permission')
  removePermission(
    @Param('id') id: string,
    @Param('permission') permission: string,
  ) {
    return this.service.removePermission(id, permission);
  }
}