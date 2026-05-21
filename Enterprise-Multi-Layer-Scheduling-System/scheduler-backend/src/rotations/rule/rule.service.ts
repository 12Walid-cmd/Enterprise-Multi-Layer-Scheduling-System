import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRotationRuleDto } from './dto/create-rule.dto';
import { UpdateRotationRuleDto } from './dto/update-rule.dto';

@Injectable()
export class RotationRulesService {
  constructor(private prisma: PrismaService) {}

  async getRules(rotationId: string) {
    return this.prisma.rotation_rules.findMany({
      where: { rotation_id: rotationId },
      orderBy: { created_at: 'asc' },
    });
  }

  async createRule(rotationId: string, dto: CreateRotationRuleDto) {
    return this.prisma.rotation_rules.create({
      data: {
        rotation_id: rotationId,
        rule_type: dto.ruleType,
        rule_payload: dto.rulePayload ?? {},
      },
    });
  }

  async updateRule(
    rotationId: string,
    ruleId: string,
    dto: UpdateRotationRuleDto,
  ) {
    const existing = await this.prisma.rotation_rules.findFirst({
      where: { id: ruleId, rotation_id: rotationId },
    });

    if (!existing) {
      throw new NotFoundException('Rule not found');
    }

    return this.prisma.rotation_rules.update({
      where: { id: ruleId },
      data: {
        rule_payload: dto.rulePayload ?? existing.rule_payload ?? {},
      },
    });
  }

  async deleteRule(rotationId: string, ruleId: string) {
    const existing = await this.prisma.rotation_rules.findFirst({
      where: { id: ruleId, rotation_id: rotationId },
    });

    if (!existing) {
      throw new NotFoundException('Rule not found');
    }

    return this.prisma.rotation_rules.delete({
      where: { id: ruleId },
    });
  }
}