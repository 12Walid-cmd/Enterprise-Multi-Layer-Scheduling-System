import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { AddTeamToDomainDto } from './dto/add-team-to-domain.dto';
import { AddUserToDomainTeamDto } from './dto/add-user-to-domain-team.dto';
import { DomainUserDto } from './dto/domain-user.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainService: DomainsService) { }

  @Post()
  create(@Body() dto: CreateDomainDto, @CurrentUser('id') userId: string) {
    return this.domainService.create(dto, userId);
  }

  @Get()
  findAll() {
    return this.domainService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.domainService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDomainDto, @CurrentUser('id') userId: string) {
    return this.domainService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.domainService.remove(id, userId);
  }

  @Post(':domainId/users')
  addUserToDomain(
    @Param('domainId') domainId: string,
    @Body() dto: { user_id: string }
  ) {
    return this.domainService.addUserToDomain(domainId, dto.user_id);
  }

  @Delete(':domainId/users/:userId')
  removeUserFromDomain(
    @Param('domainId') domainId: string,
    @Param('userId') userId: string
  ) {
    return this.domainService.removeUserFromDomain(domainId, userId);
  }

  @Get(':domainId/users')
  getUsers(@Param('domainId') domainId: string): Promise<DomainUserDto[]> {
    return this.domainService.getUsers(domainId);
  }

}