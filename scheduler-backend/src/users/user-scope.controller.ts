import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { UserScopeService } from './user-scope.service';
import { AddScopeDto } from './dto/add-scope.dto';

@Controller('admin/users/:userId/scope')
export class UserScopeController {
  constructor(private readonly service: UserScopeService) { }

  @Get()
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  // -------------------------
  // GROUP
  // -------------------------
  @Post('group')
  addGroup(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'GROUP', dto.resourceId);
  }

  @Delete('group/:resourceId')
  removeGroup(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'GROUP', resourceId);
  }

  // -------------------------
  // TEAM
  // -------------------------
  @Post('team')
  addTeam(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'TEAM', dto.resourceId);
  }

  @Delete('team/:resourceId')
  removeTeam(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'TEAM', resourceId);
  }

  // -------------------------
  // SUBTEAM
  // -------------------------
  @Post('subteam')
  addSubteam(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'SUBTEAM', dto.resourceId);
  }

  @Delete('subteam/:resourceId')
  removeSubteam(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'SUBTEAM', resourceId);
  }

  // -------------------------
  // DOMAIN
  // -------------------------
  @Post('domain')
  addDomain(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'DOMAIN', dto.resourceId);
  }

  @Delete('domain/:resourceId')
  removeDomain(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'DOMAIN', resourceId);
  }

  // -------------------------
  // ROTATION
  // -------------------------
  @Post('rotation')
  addRotation(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'ROTATION', dto.resourceId);
  }

  @Delete('rotation/:resourceId')
  removeRotation(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'ROTATION', resourceId);
  }

  // -------------------------
  // LEAVE APPROVAL (TEAM)
  // -------------------------
  @Post('leave-team')
  addLeaveTeam(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'LEAVE_TEAM', dto.resourceId);
  }

  @Delete('leave-team/:resourceId')
  removeLeaveTeam(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'LEAVE_TEAM', resourceId);
  }

  // -------------------------
  // LEAVE APPROVAL (GROUP)
  // -------------------------
  @Post('leave-group')
  addLeaveGroup(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'LEAVE_GROUP', dto.resourceId);
  }

  @Delete('leave-group/:resourceId')
  removeLeaveGroup(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'LEAVE_GROUP', resourceId);
  }

  // -------------------------
  // HOLIDAY GROUP
  // -------------------------
  @Post('holiday-group')
  addHolidayGroup(@Param('userId') userId: string, @Body() dto: AddScopeDto) {
    return this.service.addScope(userId, 'HOLIDAY_GROUP', dto.resourceId);
  }

  @Delete('holiday-group/:resourceId')
  removeHolidayGroup(@Param('userId') userId: string, @Param('resourceId') resourceId: string) {
    return this.service.removeScope(userId, 'HOLIDAY_GROUP', resourceId);
  }

  // -------------------------
  // HOLIDAY GLOBAL
  // -------------------------
  @Post('holiday-global')
  addHolidayGlobal(@Param('userId') userId: string) {
    return this.service.addScope(userId, 'HOLIDAY_GLOBAL', null);
  }

  @Delete('holiday-global')
  removeHolidayGlobal(@Param('userId') userId: string) {
    return this.service.removeScope(userId, 'HOLIDAY_GLOBAL', null);
  }
}