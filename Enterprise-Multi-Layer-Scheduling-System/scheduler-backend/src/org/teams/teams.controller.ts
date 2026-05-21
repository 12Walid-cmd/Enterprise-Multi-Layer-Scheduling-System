import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";

import { TeamsService } from "./teams.service";
import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { CurrentUser } from "src/auth/current-user.decorator";

@Controller("teams")
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  /* ================= CREATE ================= */
  @Post()
  create(
    @Body() dto: CreateTeamDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.teamsService.create(dto, userId);
  }

  /* ================= LIST (search) ================= */
  @Get()
  findAll(@Query("search") search?: string) {
    return this.teamsService.findAll(search);
  }

  /* ================= DETAIL ================= */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.teamsService.findOne(id);
  }

  /* ================= UPDATE ================= */
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.teamsService.update(id, dto, userId);
  }

  /* ================= DELETE ================= */
  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.teamsService.remove(id, userId);
  }
}