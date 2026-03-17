import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
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
    findAll() {
        return this.service.findAll();
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