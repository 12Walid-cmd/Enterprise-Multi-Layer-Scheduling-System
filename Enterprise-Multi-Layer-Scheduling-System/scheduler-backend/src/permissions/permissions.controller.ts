import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('permissions')
export class PermissionsController {
  
  @Get('registry')
  getPermissionRegistry() {
    const filePath = path.join(process.cwd(), 'permissions.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  @Get('scope-registry')
  getScopeRegistry() {
    const filePath = path.join(process.cwd(), 'scope-registry.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}
