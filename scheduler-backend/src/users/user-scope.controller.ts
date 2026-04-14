import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { UserScopeService } from './user-scope.service';
import { AddScopeDto } from './dto/add-scope.dto';

@Controller('admin/users/:userId/scope')
export class UserScopeController {
  constructor(private readonly service: UserScopeService) {}

  @Get()
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @Post('domain')
  addDomain(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'DOMAIN', dto.resourceId);
  }

  @Delete('domain/:resourceId')
  removeDomain(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'DOMAIN', resourceId);
  }

  @Post('team')
  addTeam(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'TEAM', dto.resourceId);
  }

  @Delete('team/:resourceId')
  removeTeam(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'TEAM', resourceId);
  }

  @Post('group')
  addGroup(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'GROUP', dto.resourceId);
  }

  @Delete('group/:resourceId')
  removeGroup(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'GROUP', resourceId);
  }

  @Post('rotation')
  addRotation(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'ROTATION', dto.resourceId);
  }

  @Delete('rotation/:resourceId')
  removeRotation(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'ROTATION', resourceId);
  }
}