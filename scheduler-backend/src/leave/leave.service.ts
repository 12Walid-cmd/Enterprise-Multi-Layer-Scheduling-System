import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/crate-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { FilterLeaveRequestsDto } from './dto/filter-leave-requests.dto';
import { $Enums } from '@prisma/client';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) { }

  async create(userId: string, dto: CreateLeaveRequestDto) {
    if (new Date(dto.start_date) > new Date(dto.end_date)) {
      throw new BadRequestException(
        'start_date must be before or equal to end_date',
      );
    }

    return this.prisma.leave_requests.create({
      data: {
        user_id: userId,
        type: dto.type as $Enums.LeaveType,
        start_date: new Date(dto.start_date),
        end_date: new Date(dto.end_date),
        is_full_day: dto.is_full_day ?? true,
        reason: dto.reason,
        affects_schedule: dto.affects_schedule ?? true,
      },
    });
  }

  async findMyLeaves(userId: string, filter: FilterLeaveRequestsDto) {
    return this.prisma.leave_requests.findMany({
      where: {
        user_id: userId,
        status: filter.status as $Enums.LeaveStatus | undefined,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async cancelMyLeave(userId: string, leaveId: string) {
    const leave = await this.prisma.leave_requests.findUnique({
      where: { id: leaveId },
    });

    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.user_id !== userId)
      throw new ForbiddenException('Not your leave');

    if (leave.status !== $Enums.LeaveStatus.PENDING) {
      throw new BadRequestException('Only PENDING leaves can be cancelled');
    }

    return this.prisma.leave_requests.update({
      where: { id: leaveId },
      data: {
        status: $Enums.LeaveStatus.CANCELLED,
        synced_to_schedule: false,
      },
    });
  }

  async findPendingForApprover(approverId: string) {
    return this.prisma.leave_requests.findMany({
      where: { status: $Enums.LeaveStatus.PENDING },
      include: { users: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async approveOrReject(
    approverId: string,
    leaveId: string,
    dto: UpdateLeaveStatusDto,
  ) {
    const leave = await this.prisma.leave_requests.findUnique({
      where: { id: leaveId },
    });

    if (!leave) throw new NotFoundException('Leave not found');

    if (
      leave.status !== $Enums.LeaveStatus.PENDING &&
      leave.status !== $Enums.LeaveStatus.PARTIALLY_APPROVED
    ) {
      throw new BadRequestException('Leave cannot be decided in current status');
    }

    if (dto.decision === $Enums.LeaveStatus.CANCELLED) {
      throw new BadRequestException('Approver cannot set CANCELLED');
    }

    return this.prisma.$transaction(async (tx) => {
      const approval = await tx.leave_approvals.create({
        data: {
          leave_id: leaveId,
          approved_by: approverId,
          decision: dto.decision as $Enums.LeaveStatus,
          notes: dto.notes,
        },
      });

      const updatedLeave = await tx.leave_requests.update({
        where: { id: leaveId },
        data: {
          status: dto.decision as $Enums.LeaveStatus,
          synced_to_schedule: false,
        },
      });

      return { leave: updatedLeave, approval };
    });
  }

  async findLeavesToSync() {
    return this.prisma.leave_requests.findMany({
      where: {
        status: {
          in: [
            $Enums.LeaveStatus.APPROVED,
            $Enums.LeaveStatus.CANCELLED,
          ],
        },
        affects_schedule: true,
        synced_to_schedule: false,
      },
    });
  }

  async markSynced(leaveId: string) {
    return this.prisma.leave_requests.update({
      where: { id: leaveId },
      data: { synced_to_schedule: true },
    });
  }
}