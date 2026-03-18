import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { DomainsService } from './domains.service';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  // Get all domains
  @Get()
  async findAll() {
    return this.domainsService.findAll();
  }

  // Get one domain by id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.domainsService.findOne(id);
  }

  // Create a new domain
  @Post()
  async create(
    @Body()
    body: {
      name: string;
      description?: string;
      exclusive?: boolean;
    },
  ) {
    return this.domainsService.create(body);
  }

  // Update an existing domain
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.domainsService.update(id, body);
  }

  // Delete a domain
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.domainsService.delete(id);
  }
}