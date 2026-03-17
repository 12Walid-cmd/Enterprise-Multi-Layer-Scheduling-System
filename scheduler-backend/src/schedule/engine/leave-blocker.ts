import { Injectable } from '@nestjs/common';
import { LeaveService } from '../../leave/leave.service';
import { RotationMembersService } from '../../rotations/members/rotation-members.service';

import { AssignedDay } from './rotation-engine';

export interface LeaveProcessedDay extends AssignedDay {
  unavailable: string[]; 
  conflicts: string[];   
}

@Injectable()
export class LeaveBlocker {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly rotationMembersService: RotationMembersService,
  ) {}


  async apply(days: AssignedDay[]): Promise<LeaveProcessedDay[]> {
    const result: LeaveProcessedDay[] = [];

    for (const day of days) {
      const unavailable: string[] = [];
      const conflicts: string[] = [];

   
      const allMembers = await this.rotationMembersService.getMembers(
        day.rotationId,
      );

      const sortedMembers = allMembers
        .filter((m) => m.user_id)
        .sort((a, b) => a.order_index - b.order_index)
        .map((m) => m.user_id);

      const finalAssignees: string[] = [];

      for (const userId of day.assignees) {
        const isOnLeave = await this.leaveService.isUserOnLeave(
          userId,
          day.date,
        );

        if (!isOnLeave) {
          finalAssignees.push(userId);
          continue;
        }

       
        unavailable.push(userId);

  
        const fallback = await this.findFallback(
          sortedMembers,
          finalAssignees,
          day.date,
        );

        if (fallback) {
          finalAssignees.push(fallback);
        }
      }


      if (!finalAssignees.length) {
        conflicts.push('NO_AVAILABLE_MEMBER');
      }

      result.push({
        ...day,
        assignees: finalAssignees,
        unavailable,
        conflicts,
      });
    }

    return result;
  }


  private async findFallback(
    sortedMembers: string[],
    alreadyAssigned: string[],
    date: Date,
  ): Promise<string | null> {
    for (const userId of sortedMembers) {
      if (alreadyAssigned.includes(userId)) continue;

      const isOnLeave = await this.leaveService.isUserOnLeave(userId, date);
      if (!isOnLeave) return userId;
    }

    return null;
  }
}