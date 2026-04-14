import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { GlobalRolePermissionsService } from './global-role-permissions.service';

@Controller('admin/global-roles')
export class GlobalRolePermissionsController {
  constructor(private service: GlobalRolePermissionsService) {}

  @Get(':roleId/permissions')
  find(@Param('roleId') roleId: string) {
    return this.service.findByRole(roleId);
  }

  @Post(':roleId/permissions')
  add(
    @Param('roleId') roleId: string,
    @Body() body: { permission: string },
  ) {
    return this.service.addPermission(roleId, body.permission);
  }

  @Delete(':roleId/permissions/:permission')
  remove(
    @Param('roleId') roleId: string,
    @Param('permission') permission: string,
  ) {
    return this.service.removePermission(roleId, permission);
  }
}