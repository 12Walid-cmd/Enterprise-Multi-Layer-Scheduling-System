import { Controller, Get, Param, Post, Body, Query } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";
import { CreateAuditLogDto } from "./dto/audit-log.dto";

@Controller("audit-logs")
export class AuditLogController {
    constructor(private readonly service: AuditLogService) { }

    @Post()
    create(@Body() dto: CreateAuditLogDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get("action/:action")
    findByAction(@Param("action") action: string) {
        return this.service.findByAction(action);
    }

    @Get(":entity_type/:entity_id")
    findByEntity(
        @Param("entity_type") entity_type: string,
        @Param("entity_id") entity_id: string
    ) {
        return this.service.findByEntity(entity_type, entity_id);
    }

    @Get("filter")
    filter(@Query() query: any) {
        return this.service.filter(query);
    }
}