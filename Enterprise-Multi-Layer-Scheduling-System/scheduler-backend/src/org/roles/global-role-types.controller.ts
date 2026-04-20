import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { GlobalRoleTypesService } from './global-role-types.service';
import { CreateGlobalRoleTypeDto } from './dto/create-global-role-type.dto';
import { UpdateGlobalRoleTypeDto } from './dto/update-global-role-type.dto';

@Controller('roles/global-types')
export class GlobalRoleTypesController {
    constructor(private readonly service: GlobalRoleTypesService) { }

   
    @Post()
    create(@Body() dto: CreateGlobalRoleTypeDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll(@Query("search") search?: string) {
        return this.service.findAll(search);
    }

     @Get("check-code")
    checkCode(
        @Query("code") code: string,
        @Query("excludeId") excludeId?: string,
    ) {
        return this.service.checkCode(code, excludeId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateGlobalRoleTypeDto) {
        return this.service.update(id, dto);
    }


    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

}