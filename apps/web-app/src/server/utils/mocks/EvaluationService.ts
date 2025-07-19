// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/EvaluationService.ts
import { PrismaClient } from "@repo/db/src/index";

export class EvaluationService {
    constructor(private db: PrismaClient) { }

    async createTemplates({ templates, ownerId }: { templates: any[], ownerId: string }) {
        console.log("Mock EvaluationService.createTemplates called with:", { templates, ownerId });
        return templates.map(template => ({
            ...template,
            id: template.id || `mock-template-id-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
    }
    async updateGeneralEvaluations({ agentId, generalEvaluations, ownerId }: { agentId: string, generalEvaluations: any[], ownerId: string }) {
        console.log("Mock EvaluationService.updateGeneralEvaluations called with:", { agentId, generalEvaluations, ownerId });
        return generalEvaluations.map(evaluation => ({
            ...evaluation,
            id: evaluation.id || "mock-eval-id-" + Date.now(),
            agentId,
            ownerId,
            updatedAt: new Date()
        }));
    }

    async getTemplates({ ownerId }: { ownerId: string }) {
        console.log("Mock EvaluationService.getTemplates called with:", { ownerId });
        return [
            {
                id: "template-1",
                name: "Basic Template",
                description: "A basic evaluation template",
                ownerId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];
    }

    async createTemplate({ template, ownerId }: { template: any, ownerId: string }) {
        console.log("Mock EvaluationService.createTemplate called with:", { template, ownerId });
        return {
            ...template,
            id: template.id || "mock-template-id-" + Date.now(),
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async updateTemplate({ template, ownerId }: { template: any, ownerId: string }) {
        console.log("Mock EvaluationService.updateTemplate called with:", { template, ownerId });
        return {
            ...template,
            ownerId,
            updatedAt: new Date()
        };
    }

    async deleteTemplate({ id, ownerId }: { id: string, ownerId: string }) {
        console.log("Mock EvaluationService.deleteTemplate called with:", { id, ownerId });
        return { id };
    }

    async update({ evaluation, ownerId }: { evaluation: any, ownerId: string }) {
        console.log("Mock EvaluationService.update called with:", { evaluation, ownerId });
        return {
            ...evaluation,
            ownerId,
            updatedAt: new Date()
        };
    }

    async toggleEnabled({ id, agentId, enabled, ownerId }: { id: string, agentId: string, enabled: boolean, ownerId: string }) {
        console.log("Mock EvaluationService.toggleEnabled called with:", { id, agentId, enabled, ownerId });
        return {
            id,
            agentId,
            enabled,
            ownerId,
            updatedAt: new Date()
        };
    }

    async delete({ id, ownerId }: { id: string, ownerId: string }) {
        console.log("Mock EvaluationService.delete called with:", { id, ownerId });
        return { id };
    }

    async getGroups({ ownerId }: { ownerId: string }) {
        console.log("Mock EvaluationService.getGroups called with:", { ownerId });
        return [
            {
                id: "group-1",
                name: "Basic Group",
                description: "A basic evaluation group",
                ownerId,
                createdAt: new Date(),
                updatedAt: new Date(),
                evaluations: []
            }
        ];
    }

    async createGroup({ group, ownerId }: { group: any, ownerId: string }) {
        console.log("Mock EvaluationService.createGroup called with:", { group, ownerId });
        return {
            ...group,
            id: group.id || "mock-group-id-" + Date.now(),
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async updateGroup({ group, ownerId }: { group: any, ownerId: string }) {
        console.log("Mock EvaluationService.updateGroup called with:", { group, ownerId });
        return {
            ...group,
            ownerId,
            updatedAt: new Date()
        };
    }

    async deleteGroup({ id, ownerId }: { id: string, ownerId: string }) {
        console.log("Mock EvaluationService.deleteGroup called with:", { id, ownerId });
        return { id };
    }
}