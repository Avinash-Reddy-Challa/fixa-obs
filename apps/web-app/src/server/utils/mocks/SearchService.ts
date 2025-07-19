// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/SearchService.ts
import { PrismaClient } from "@repo/db/src/index";

// /mnt/e/10xR/playground/fixa-observe/apps/web-app/src/server/utils/mocks/SearchService.ts

export class SearchService {
    private mockSavedSearches = [
        {
            id: "default-search",
            name: "Default Search",
            filter: {
                agentId: [],
                lookbackPeriod: { value: "24h", label: "Last 24 hours" },
                chartPeriod: 30,
                timeRange: undefined,
                metadata: {},
            },
            ownerId: "mock-owner-id",
            createdAt: new Date(),
            updatedAt: new Date(),
            isDefault: true,
            agentId: null,
            lookbackPeriod: "24h",
            timeRange: null,
            chartPeriod: 30,
            customerCallId: null,
            metadata: {}
        }
    ];

    constructor(private db: any) {
        console.log("Running SearchService in mock mode");
    }

    async save({ ownerId, filter, name }: { ownerId: string, filter: any, name: string }) {
        console.log("Mock SearchService.save called with:", { ownerId, filter, name });
        const newSearch = {
            id: "mock-saved-search-" + Date.now(),
            name,
            filter,
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDefault: false,
            agentId: filter.agentId?.[0] || null,
            lookbackPeriod: filter.lookbackPeriod?.value || "24h",
            timeRange: filter.timeRange || null,
            chartPeriod: filter.chartPeriod || 30,
            customerCallId: filter.customerCallId || null,
            metadata: filter.metadata || {}
        };

        this.mockSavedSearches.push(newSearch);
        return newSearch;
    }

    async update({ search, ownerId }: { search: any, ownerId: string }) {
        console.log("Mock SearchService.update called with:", { search, ownerId });
        const index = this.mockSavedSearches.findIndex(s => s.id === search.id);
        if (index !== -1) {
            this.mockSavedSearches[index] = {
                ...this.mockSavedSearches[index],
                ...search,
                updatedAt: new Date(),
            };
            return this.mockSavedSearches[index];
        }
        return search;
    }

    async delete({ id, ownerId }: { id: string, ownerId: string }) {
        console.log("Mock SearchService.delete called with:", { id, ownerId });
        const index = this.mockSavedSearches.findIndex(s => s.id === id);
        if (index !== -1) {
            this.mockSavedSearches.splice(index, 1);
        }
        return { success: true };
    }

    async getAll({ ownerId, includeDefault = true }: { ownerId: string, includeDefault?: boolean }) {
        console.log("Mock SearchService.getAll called with:", { ownerId, includeDefault });
        if (includeDefault) {
            return this.mockSavedSearches.filter(s => s.ownerId === ownerId || s.ownerId === "mock-owner-id");
        } else {
            return this.mockSavedSearches.filter(s => (s.ownerId === ownerId || s.ownerId === "mock-owner-id") && !s.isDefault);
        }
    }

    async getById({ id, ownerId }: { id: string, ownerId: string }) {
        console.log("Mock SearchService.getById called with:", { id, ownerId });
        const search = this.mockSavedSearches.find(s => s.id === id);
        if (search) return search;

        return {
            id,
            name: "Mock Search " + id,
            filter: {
                agentId: [],
                lookbackPeriod: { value: "24h", label: "Last 24 hours" },
                chartPeriod: 30,
            },
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDefault: false,
            agentId: null,
            lookbackPeriod: "24h",
            timeRange: null,
            chartPeriod: 30,
            customerCallId: null,
            metadata: {}
        };
    }

    async getDefault({ ownerId }: { ownerId: string }) {
        console.log("Mock SearchService.getDefault called with:", { ownerId });
        const defaultSearch = this.mockSavedSearches.find(s => s.isDefault);
        if (defaultSearch) {
            return {
                ...defaultSearch,
                ownerId // Override with the requested ownerId
            };
        }

        // Create a default search if none exists
        return {
            id: "default-search",
            name: "Default Search",
            filter: {
                agentId: [],
                lookbackPeriod: { value: "24h", label: "Last 24 hours" },
                chartPeriod: 30,
            },
            ownerId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDefault: true,
            agentId: null,
            lookbackPeriod: "24h",
            timeRange: null,
            chartPeriod: 30,
            customerCallId: null,
            metadata: {}
        };
    }
}