import { Controller, Post, Delete, Get, Body, Param } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';

@Controller('roles/users')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  assign(@Body() dto: AssignUserRoleDto) {
    return this.userRolesService.assign(dto);
  }

  @Delete(':userId/:roleTypeId')
  remove(
    @Param('userId') userId: string,
    @Param('roleTypeId') roleTypeId: string,
  ) {
    return this.userRolesService.remove(userId, roleTypeId);
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.userRolesService.findByUser(userId);
  }
}