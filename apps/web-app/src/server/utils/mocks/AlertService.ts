// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/AlertService.ts
import { PrismaClient } from "@repo/db/src/index";

export class AlertService {
    constructor(private db: PrismaClient) { }

    async create({ alert, ownerId }: { alert: any, ownerId: string }) {
        console.log("Mock AlertService.create called with:", { alert, ownerId });
        return {
            ...alert,
            id: alert.id || "mock-alert-id-" + Date.now(),
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async update({ alert, ownerId }: { alert: any, ownerId: string }) {
        console.log("Mock AlertService.update called with:", { alert, ownerId });
        return {
            ...alert,
            ownerId,
            updatedAt: new Date()
        };
    }

    async delete({ id, ownerId }: { id: string, ownerId: string }) {
        console.log("Mock AlertService.delete called with:", { id, ownerId });
        return { id };
    }
}