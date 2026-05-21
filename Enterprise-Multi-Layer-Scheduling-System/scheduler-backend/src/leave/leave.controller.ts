import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/crate-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { FilterLeaveRequestsDto } from './dto/filter-leave-requests.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('leave')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  /**
   * Create a leave request for the current user
   */
  @Post()
  createLeave(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.leaveService.create(userId, dto);
  }

  /**
   * Get all leave requests of the current user
   */
  @Get('me')
  getMyLeaves(
    @CurrentUser('id') userId: string,
    @Query() filter: FilterLeaveRequestsDto,
  ) {
    return this.leaveService.findMyLeaves(userId, filter);
  }

  /**
   * Cancel a leave request created by the current user
   */
  @Patch('me/:id/cancel')
  cancelMyLeave(
    @CurrentUser('id') userId: string,
    @Param('id') leaveId: string,
  ) {
    return this.leaveService.cancelMyLeave(userId, leaveId);
  }

  /**
   * Get all pending leaves that the current user can approve
   */
  @Get('pending/for-approval')
  getPending(@CurrentUser('id') approverId: string) {
    return this.leaveService.findPendingForApprover(approverId);
  }

  /**
   * Approve or reject a leave request
   */
  @Patch(':id/decision')
  decideLeave(
    @CurrentUser('id') approverId: string,
    @Param('id') leaveId: string,
    @Body() dto: UpdateLeaveStatusDto,
  ) {
    return this.leaveService.approveOrReject(approverId, leaveId, dto);
  }
}