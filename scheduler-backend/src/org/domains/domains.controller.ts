import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';

import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainService: DomainsService) {}

  /* ================= CREATE ================= */
  @Post()
  create(
    @Body() dto: CreateDomainDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.domainService.create(dto, userId);
  }

  /* ================= LIST  ================= */
  @Get()
  findAll(@Query('search') search?: string) {
    return this.domainService.findAll(search);
  }

  /* ================= DETAIL ================= */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.domainService.findOne(id);
  }

  /* ================= UPDATE ================= */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDomainDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.domainService.update(id, dto, userId);
  }

  /* ================= DELETE ================= */
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.domainService.remove(id, userId);
  }
}