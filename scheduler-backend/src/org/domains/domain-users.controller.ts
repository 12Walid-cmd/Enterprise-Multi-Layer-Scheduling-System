import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';


import { DomainUsersService } from './domain-users.service';
import { AddUserToDomainTeamDto } from './dto/add-user-to-domain-team.dto';

@Controller('domains/:domainId/users')
export class DomainUsersController {
  constructor(private readonly service: DomainUsersService) {}

  @Get()
  getUsers(@Param('domainId') domainId: string) {
    return this.service.getUsers(domainId);
  }

  @Post()
  add(
    @Param('domainId') domainId: string,
    @Body() dto: AddUserToDomainTeamDto,
  ) {
    return this.service.addUser(domainId, dto);
  }

  @Delete(':userId')
  remove(
    @Param('domainId') domainId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.removeUser(domainId, userId);
  }
}