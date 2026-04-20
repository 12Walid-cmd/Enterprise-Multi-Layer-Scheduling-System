import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditWriter } from 'src/audit/audit-writer.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PermissionSyncService {
    private readonly logger = new Logger(PermissionSyncService.name);

    constructor(
        private prisma: PrismaService,
        private audit: AuditWriter,
    ) {}

    async sync() {
        const filePath = path.join(process.cwd(), 'permissions.json');
        const registry: string[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const dbPermissions = await this.prisma.permission_types.findMany();
        const dbCodes = dbPermissions.map(p => p.code);

        const newPermissions = registry.filter(code => !dbCodes.includes(code));
        const removedPermissions = dbCodes.filter(code => !registry.includes(code));

        // -----------------------------
        // INSERT NEW PERMISSIONS
        // -----------------------------
        for (const code of newPermissions) {
            const created = await this.prisma.permission_types.create({
                data: {
                    code,
                    name: code, // default name = code
                    description: '',
                },
            });

            await this.audit.permission.created("system", code, created);
            this.logger.log(`Inserted new permission: ${code}`);
        }

        // -----------------------------
        // MARK REMOVED PERMISSIONS
        // -----------------------------
        for (const code of removedPermissions) {
            const before = dbPermissions.find(p => p.code === code);

            const updated = await this.prisma.permission_types.update({
                where: { code },
                data: {
                    description: '[DEPRECATED] ' + (before?.description ?? ''),
                },
            });

            await this.audit.permission.deprecated("system", code, before, updated);
            this.logger.warn(`Marked deprecated permission: ${code}`);
        }
    }
}
