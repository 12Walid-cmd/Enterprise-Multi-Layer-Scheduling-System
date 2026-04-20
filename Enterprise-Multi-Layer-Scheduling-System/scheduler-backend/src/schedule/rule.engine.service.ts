import { LoadedRotationRule } from './schedule.types';

export class RuleEngineService {
  constructor(private readonly rules: LoadedRotationRule[]) {}

  has(type: string): boolean {
    return this.rules.some(r => r.type === type && r.enabled !== false);
  }

  payload<T = any>(type: string): T | undefined {
    return this.rules.find(r => r.type === type)?.payload as T;
  }
}