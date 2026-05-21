import { Constraint } from '../../schedule/schedule.types';

export class BlockLengthConstraint implements Constraint {
    name = "BLOCK_LENGTH";

  validate(userId, date, rotation, context, currentAssignments): boolean {
    const ruleEngine = context.ruleEngine;
    if (!ruleEngine.has("BLOCK_LENGTH")) return true;

    const block = ruleEngine.payload("BLOCK_LENGTH")?.days ?? 1;

    const recent = currentAssignments
      .filter(a => a.assigneeRefId === userId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const lastN = recent.slice(-block);

    return lastN.length < block;
  }
}