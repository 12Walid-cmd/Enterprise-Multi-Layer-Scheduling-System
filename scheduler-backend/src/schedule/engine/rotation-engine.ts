import { Injectable } from '@nestjs/common';
import { RotationsService } from '../../rotations/rotations.service';
import { RotationMembersService } from '../../rotations/members/rotation-members.service';

export interface AssignedDay {
  date: Date;
  assignees: string[]; // user IDs
  rotationId: string;
}

@Injectable()
export class RotationEngine {
  constructor(
    private readonly rotationsService: RotationsService,
    private readonly rotationMembersService: RotationMembersService,
  ) {}


  async assign(rotationId: string, dates: Date[]): Promise<AssignedDay[]> {
    const rotation = await this.rotationsService.getOne(rotationId);
    if (!rotation) {
      throw new Error(`Rotation not found: ${rotationId}`);
    }

    const members = await this.rotationMembersService.getMembers(rotationId);
    if (!members.length) {
      throw new Error(`Rotation ${rotationId} has no members`);
    }


    const sortedMembers = members
      .filter((m) => m.user_id) 
      .sort((a, b) => a.order_index - b.order_index);

    if (!sortedMembers.length) {
      throw new Error(`Rotation ${rotationId} has no valid members`);
    }

    const minAssignees = rotation.min_assignees ?? 1;
    const allowOverlap = rotation.allow_overlap ?? false;

    const result: AssignedDay[] = [];

    // round-robin index
    let pointer = 0;

    for (const date of dates) {
      const assignees: string[] = [];

      for (let i = 0; i < minAssignees; i++) {
        const member = sortedMembers[pointer % sortedMembers.length];
        assignees.push(member.user_id);

        pointer++;
      }

      result.push({
        date,
        assignees,
        rotationId,
      });
    }

    return result;
  }
}