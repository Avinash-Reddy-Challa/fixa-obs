// apps/node-server/src/utils/refreshDashboard.ts

import { db } from "../db";

/**
 * Utility to force-update dashboard data
 * This can be used to manually ensure call data appears in the dashboard
 */
export const refreshDashboardData = async () => {
    try {
        console.log("Refreshing dashboard data...");

        // Check if db is available
        if (!db) {
            console.log("Database not available");
            return false;
        }

        // Get all calls from the last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // If we have a proper database, this would get recent calls
        // For mock DB, this just logs what we're trying to do
        if (typeof db.call?.findMany === 'function') {
            const recentCalls = await db.call.findMany({
                where: {
                    createdAt: {
                        gte: last24Hours
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10
            });

            console.log(`Found ${recentCalls.length} recent calls`);
            recentCalls.forEach(call => {
                console.log(`- Call ID: ${call.id}, Agent: ${call.agentId}, Created: ${call.createdAt}`);
            });
        } else {
            console.log("Mock DB doesn't support findMany for verification");
        }

        // Touch the most recent call to update its timestamp
        // This can help trigger UI refreshes in some systems
        if (typeof db.call?.findFirst === 'function' && typeof db.call?.update === 'function') {
            const mostRecentCall = await db.call.findFirst({
                orderBy: {
                    createdAt: 'desc'
                }
            });

            if (mostRecentCall) {
                const updated = await db.call.update({
                    where: {
                        id: mostRecentCall.id
                    },
                    data: {
                        updatedAt: new Date()
                    }
                });

                console.log(`Updated call ${updated.id} timestamp to trigger refresh`);
            }
        }

        console.log("Dashboard data refresh complete");
        return true;
    } catch (error) {
        console.error("Error refreshing dashboard data:", error);
        return false;
    }
};

/**
 * Creates a dummy call record to ensure the dashboard has data
 */
export const createDummyCall = async () => {
    try {
        console.log("Creating dummy call record...");

        // Check if db is available
        if (!db || typeof db.call?.create !== 'function') {
            console.log("Database not available or missing required methods");
            return false;
        }

        // Create a timestamp within the last hour
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - (1 * 60 * 60 * 1000));

        // Basic mock data
        const callEntry = await db.call.create({
            data: {
                id: `dummy-${Date.now()}`,
                agentId: 'agent-1',
                orgId: 'dev-org-id',
                recordingUrl: 'https://example.com/dummy-recording.mp4',
                status: 'completed',
                createdAt: oneHourAgo,
                updatedAt: now,
                duration: 60,
                turnaroundTime: 500,
                latency: { p50: 200, p90: 300, p95: 400, ttfw: 500 },
                interruptions: 0,
                speakerTime: { agent: 30, user: 30 },
                metadata: { test: "false" } // Important! Default filter only shows calls with test=false
            }
        });

        console.log(`Successfully created dummy call: ${callEntry.id}`);
        return true;
    } catch (error) {
        console.error("Error creating dummy call:", error);
        return false;
    }
};