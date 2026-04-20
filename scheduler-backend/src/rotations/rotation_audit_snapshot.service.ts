import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class RotationSnapshotService {
    constructor(private prisma: PrismaService) { }

    async createSnapshot(rotation_id: string) {
        const rotation = await this.prisma.rotation_definitions.findUnique({
            where: { id: rotation_id },
            include: {
                //  Rotation owner
                owner: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },

                //  Members
                rotation_members: {
                    orderBy: { order_index: "asc" },
                },

                //  Tiers + Tier Members
                rotation_tiers: {
                    orderBy: { tier_level: "asc" },
                    include: {
                        rotation_tier_members: {
                            orderBy: { order_index: "asc" },
                        },
                    },
                },

                //  Rules
                rotationRules: true,

                //  Exceptions
                rotationExceptions: true,

                //  Fairness metrics
                fairnessMetrics: true,

                //  Schedule results
                scheduleResults: {
                    orderBy: { date: "asc" },
                },
            },
        });
        const jsonSafe = JSON.parse(JSON.stringify(rotation));

        return this.prisma.rotation_audit_snapshots.create({
            data: {
                rotation_id,
                snapshot_data: jsonSafe,
            },
        });
    }

    async getSnapshots(rotation_id: string) {
        return this.prisma.rotation_audit_snapshots.findMany({
            where: { rotation_id },
            orderBy: { snapshot_at: "desc" },
        });
    }
}