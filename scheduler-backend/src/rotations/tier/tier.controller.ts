import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { TierService } from './tier.service';
import { CreateTierDto } from './dto/create-tier.dto';
import { AddTierMemberDto } from './dto/add-tier-member.dto';

@Controller('rotations')
export class TierController {
  constructor(private readonly tierService: TierService) {}

  @Post(':id/tiers')
  createTier(@Param('id') rotationId: string, @Body() dto: CreateTierDto) {
    return this.tierService.createTier(rotationId, dto);
  }

  @Get(':id/tiers')
  getTiers(@Param('id') rotationId: string) {
    return this.tierService.getTiers(rotationId);
  }

  @Post('tiers/:tierId/members')
  addMember(@Param('tierId') tierId: string, @Body() dto: AddTierMemberDto) {
    return this.tierService.addMember(tierId, dto);
  }

  @Get('tiers/:tierId/members')
  getMembers(@Param('tierId') tierId: string) {
    return this.tierService.getMembers(tierId);
  }

  @Delete('tiers/:tierId')
  deleteTier(@Param('tierId') tierId: string) {
    return this.tierService.deleteTier(tierId);
  }

  @Delete('tiers/:tierId/members/:memberId')
  removeMember(@Param('memberId') memberId: string) {
    return this.tierService.removeMember(memberId);
  }
}