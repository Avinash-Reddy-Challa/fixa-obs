// Create a file at apps/node-server/src/testDashboard.ts

import { db } from "./src/db";

async function createDashboardTestCall() {
  console.log("Creating dashboard-compatible test call...");

  // Create a call ID with current timestamp to ensure uniqueness
  const callId = `test-call-${Date.now()}`;

  // Create a timestamp within the last hour (recent enough for filter)
  const now = new Date();

  try {
    const mockCall = {
      id: callId,
      agentId: 'agent-avi',
      orgId: 'dev-org-id',
      customerCallId: callId,
      recordingUrl: 'https://example.com/mock-recording.mp4',
      status: 'completed',
      createdAt: now,
      startedAt: now,
      updatedAt: now,
      duration: 120,
      turnaroundTime: 800,
      latency: { p50: 200, p90: 350, p95: 450, ttfw: 800 },
      interruptions: 1,
      interruptionDetails: [{ secondsFromStart: 30, duration: 2, text: "Let me explain..." }],
      speakerTime: { agent: 65, user: 55 },
      transcriptUrl: '',
      transcript: { turns: [] },
      metadata: { test: 'false' }, // Critical for dashboard visibility
      messages: [{
        role: 'user',
        message: 'Hello, I need some help',
        secondsFromStart: 0,
        duration: 2
      }, {
        role: 'bot',
        message: 'I\'m here to help you. What do you need?',
        secondsFromStart: 3,
        duration: 3
      }]
    };

    console.log("Creating call:", callId);
    const result = await db.call.create({ data: mockCall });
    console.log(`Successfully created test call: ${result.id}`);
    return true;
  } catch (error) {
    console.error("Error creating test call:", error);
    return false;
  }
}

// Run the test immediately when this script is executed
createDashboardTestCall()
  .then(() => console.log("Test complete"))
  .catch(console.error);

export { };