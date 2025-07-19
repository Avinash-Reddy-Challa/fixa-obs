// apps/node-server/fixMockData.ts
import { db } from "./src/db"; // Import the existing db instance that's already configured for mock/real

async function fixDashboardData() {
    console.log("Using existing database connection");

    try {
        console.log("Fixing dashboard data...");

        // Create multiple calls to ensure visibility
        for (let i = 0; i < 5; i++) {
            const testCallId = `test-call-${Date.now()}-${i}`;

            console.log(`Creating dashboard call: ${testCallId}`);

            // Create a dashboard-compatible call
            const mockData = {
                id: testCallId,
                customerCallId: testCallId,
                agentId: "agent-avi",
                orgId: "dev-org-id",
                recordingUrl: "https://example.com/mock-recording.mp4",
                status: "completed",
                createdAt: new Date(),
                startedAt: new Date(),
                updatedAt: new Date(),
                duration: 120,
                turnaroundTime: 800,
                latency: { p50: 200, p90: 350, p95: 450, ttfw: 800 },
                interruptions: 1,
                interruptionDetails: [
                    { secondsFromStart: 15, duration: 2.5, text: "I need to-" }
                ],
                speakerTime: { agent: 65, user: 55 },
                transcriptUrl: "",
                transcript: { turns: [] },
                metadata: { test: "false" }, // Critical: Setting test:false for dashboard visibility
                messages: [
                    { role: "user", text: "Hello, I'd like to book a flight", start: 0, end: 3.5 },
                    { role: "agent", text: "I'd be happy to help you book a flight. Where would you like to go?", start: 4.3, end: 8.7 }
                ]
            };

            // Create the call in the database
            const call = await db.call.create({
                data: mockData
            });

            console.log(`Successfully created dashboard call: ${testCallId}`);

            // Wait a bit between calls to spread out timestamps
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log("Dashboard data fix complete!");
    } catch (error) {
        console.error("Error fixing dashboard data:", error);
    }
}

fixDashboardData();