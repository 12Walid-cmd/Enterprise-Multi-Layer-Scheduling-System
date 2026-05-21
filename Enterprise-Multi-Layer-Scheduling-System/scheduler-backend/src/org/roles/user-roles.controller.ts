import { Controller, Post, Delete, Get, Body, Param } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { AssignUserGlobalRoleDto } from './dto/assign-user-global-role.dto';

@Controller('roles/users')
export class UserRolesController {
  constructor(private readonly service: UserRolesService) {}

  @Post()
  assign(@Body() dto: AssignUserGlobalRoleDto) {
    return this.service.assign(dto);
  }

  @Delete(':userId/:globalRoleId')
  remove(
    @Param('userId') userId: string,
    @Param('globalRoleId') globalRoleId: string,
  ) {
    return this.service.remove(userId, globalRoleId);
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }
}