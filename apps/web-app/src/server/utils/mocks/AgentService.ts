// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/AgentService.ts
import { PrismaClient } from "@repo/db/src/index";

export class AgentService {
    constructor(private db: PrismaClient) { }

    async createAgent({ phoneNumber, name, customerAgentId, systemPrompt, ownerId }: any) {
        console.log("Mock AgentService.createAgent called with:", { phoneNumber, name, customerAgentId, ownerId });
        return {
            id: "mock-agent-id-" + Date.now(),
            phoneNumber,
            name,
            customerAgentId,
            systemPrompt,
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async getAgent(id: string, ownerId: string) {
        console.log("Mock AgentService.getAgent called with:", { id, ownerId });
        return {
            id,
            name: "Mock Agent " + id,
            phoneNumber: "+1234567890",
            systemPrompt: "Mock system prompt",
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async getAllAgents(ownerId: string) {
        console.log("Mock AgentService.getAllAgents called with:", { ownerId });
        return [
            {
                id: "mock-agent-1",
                name: "Mock Agent 1",
                phoneNumber: "+1234567890",
                systemPrompt: "Mock system prompt",
                ownerId,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
    }

    async updateAgentName(id: string, name: string, ownerId: string) {
        console.log("Mock AgentService.updateAgentName called with:", { id, name, ownerId });
        return {
            id,
            name,
            phoneNumber: "+1234567890",
            systemPrompt: "Mock system prompt",
            ownerId,
            updatedAt: new Date()
        };
    }

    async updateAgent({ id, agent, ownerId }: { id: string, agent: any, ownerId: string }) {
        console.log("Mock AgentService.updateAgent called with:", { id, agent, ownerId });
        return {
            id,
            ...agent,
            ownerId,
            updatedAt: new Date()
        };
    }

    async deleteAgent(id: string, ownerId: string) {
        console.log("Mock AgentService.deleteAgent called with:", { id, ownerId });
        return { id };
    }

    async getTestAgents(ownerId: string) {
        console.log("Mock AgentService.getTestAgents called with:", { ownerId });
        return [
            {
                id: "mock-test-agent-1",
                name: "Mock Test Agent 1",
                headshotUrl: "https://example.com/mock-headshot.jpg",
                description: "A mock test agent",
                prompt: "Mock prompt",
                voiceId: "mock-voice-id",
                enabled: true,
                defaultSelected: true,
                order: 1,
                ownerId
            }
        ];
    }

    async toggleTestAgentEnabled(agentId: string, testAgentId: string, enabled: boolean, ownerId: string) {
        console.log("Mock AgentService.toggleTestAgentEnabled called with:", { agentId, testAgentId, enabled, ownerId });
        return {
            id: "mock-agent-test-agent-id",
            agentId,
            testAgentId,
            enabled,
            ownerId
        };
    }

    async upsertAgent({ customerAgentId, ownerId }: { customerAgentId: string, ownerId: string }) {
        console.log("Mock AgentService.upsertAgent called with:", { customerAgentId, ownerId });
        return {
            id: "mock-agent-id-" + Date.now(),
            customerAgentId,
            name: "Mock Agent",
            phoneNumber: "+1234567890",
            systemPrompt: "Mock system prompt",
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
}