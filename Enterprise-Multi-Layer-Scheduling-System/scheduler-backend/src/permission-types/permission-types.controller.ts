import { Controller, Get, Post, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { PermissionTypesService } from './permission-types.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('admin/permissions')
export class PermissionTypesController {
  constructor(private readonly service: PermissionTypesService) { }

  /* LIST + SEARCH */
  @Get()
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  /* CHECK CODE */
  @Get('check-code')
  checkCode(@Query('code') code: string, @Query('exclude') exclude?: string) {
    return this.service.checkCode(code, exclude);
  }

  /* GET ONE */
  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.service.findOne(code);
  }

  /* CREATE */
  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.service.create(dto);
  }

  /* UPDATE */
  @Patch(':code')
  update(@Param('code') code: string, @Body() dto: UpdatePermissionDto) {
    return this.service.update(code, dto);
  }

  /* DELETE */
  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.service.delete(code);
  }


}