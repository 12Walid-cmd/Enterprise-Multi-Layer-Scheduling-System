import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { UserPermissionsService } from './user-permissions.service';

@Controller('admin/users/:userId/permissions')
export class UserPermissionsController {
  constructor(private readonly service: UserPermissionsService) {}

  @Get()
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @Post()
  assign(
    @Param('userId') userId: string,
    @Body() body: { permission: string },
  ) {
    return this.service.assign({
      userId,
      permission: body.permission,
    });
  }

  @Delete(':permission')
  remove(
    @Param('userId') userId: string,
    @Param('permission') permission: string,
  ) {
    return this.service.remove(userId, permission);
  }
}