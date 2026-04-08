import { SetMetadata } from '@nestjs/common';

export const SCOPE_KEY = 'scope';

export const Scope = (type: 'group' | 'domain' | 'team' | 'rotation', idParam: string) =>
  SetMetadata(SCOPE_KEY, { type, idParam });