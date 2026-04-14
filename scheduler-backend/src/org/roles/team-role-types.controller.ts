import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { TeamRoleTypesService } from './team-role-types.service';
import { CreateTeamRoleTypeDto } from './dto/create-team-role-type.dto';
import { UpdateTeamRoleTypeDto } from './dto/update-team-role-type.dto';

@Controller('roles/team-types')
export class TeamRoleTypesController {
    constructor(private readonly service: TeamRoleTypesService) { }

    @Post()
    create(@Body() dto: CreateTeamRoleTypeDto) {
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

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTeamRoleTypeDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}