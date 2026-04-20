import { Controller, Post } from '@nestjs/common';
import { PermissionSyncService } from './permission-sync.service';

@Controller('permissions')
export class PermissionSyncController {
  constructor(private syncService: PermissionSyncService) {}

  @Post('sync')
  async sync() {
    return this.syncService.sync();
  }
}
