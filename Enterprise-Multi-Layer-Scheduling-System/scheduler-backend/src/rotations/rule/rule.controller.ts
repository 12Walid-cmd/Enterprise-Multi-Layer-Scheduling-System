import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RotationRulesService } from './rule.service';
import { CreateRotationRuleDto } from './dto/create-rule.dto';
import { UpdateRotationRuleDto } from './dto/update-rule.dto';

@Controller('rotations/:rotationId/rules')
export class RotationRulesController {
  constructor(private readonly rulesService: RotationRulesService) {}

  @Get()
  getRules(@Param('rotationId') rotationId: string) {
    return this.rulesService.getRules(rotationId);
  }

  @Post()
  createRule(
    @Param('rotationId') rotationId: string,
    @Body() dto: CreateRotationRuleDto,
  ) {
    return this.rulesService.createRule(rotationId, dto);
  }

  @Patch(':ruleId')
  updateRule(
    @Param('rotationId') rotationId: string,
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateRotationRuleDto,
  ) {
    return this.rulesService.updateRule(rotationId, ruleId, dto);
  }

  @Delete(':ruleId')
  deleteRule(
    @Param('rotationId') rotationId: string,
    @Param('ruleId') ruleId: string,
  ) {
    return this.rulesService.deleteRule(rotationId, ruleId);
  }
}