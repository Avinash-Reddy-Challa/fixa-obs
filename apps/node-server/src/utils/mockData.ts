// apps/node-server/src/utils/mockData.ts
export function createMockCallData(callId: string, ownerId: string, agentId: string) {
    const now = new Date();

    return {
        id: callId,
        customerCallId: callId,
        agentId: agentId,
        orgId: ownerId,
        recordingUrl: "https://example.com/mock-recording.mp4",
        status: "completed",
        createdAt: now,
        startedAt: now,
        updatedAt: now,
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
        metadata: { test: "false" },
        messages: [
            { role: "user", text: "Hello, I'd like to book a flight", start: 0, end: 3.5 },
            { role: "agent", text: "I'd be happy to help you book a flight. Where would you like to go?", start: 4.3, end: 8.7 }
        ]
    };
}

export function createMockCallEntry(callId: string, ownerId: string, agentId: string, stereoRecordingUrl: string, metadata: any = {}) {
    const now = new Date();

    // Ensure metadata.test is set to "false"
    const processedMetadata = {
        ...metadata,
        test: metadata.test !== undefined ? metadata.test : "false"
    };

    return {
        id: callId,
        customerCallId: callId,
        // Use agent relation instead of agentId
        agent: {
            connect: { id: agentId }
        },
        ownerId: ownerId,
        stereoRecordingUrl: stereoRecordingUrl,
        status: "completed",
        startedAt: now.toISOString(),
        deleted: false,
        timeToFirstWord: 800,
        latencyP50: 200,
        latencyP90: 350,
        latencyP95: 450,
        numInterruptions: 1,
        duration: 120,
        metadata: processedMetadata,
        evalSetToSuccess: "{}",
        // Create messages through the proper relation
        messages: {
            create: [
                {
                    id: `${callId}-msg-1`,
                    role: "user",
                    message: "Hello, I'd like to book a flight",
                    secondsFromStart: 0,
                    duration: 3.5,
                    time: 0,
                    endTime: 3.5,
                    name: "",
                    result: "",
                    toolCalls: "[]"
                },
                {
                    id: `${callId}-msg-2`,
                    role: "bot",
                    message: "I'd be happy to help you book a flight. Where would you like to go?",
                    secondsFromStart: 4.3,
                    duration: 4.4,
                    time: 4.3,
                    endTime: 8.7,
                    name: "",
                    result: "",
                    toolCalls: "[]"
                }
            ]
        },
        // Create latency blocks
        latencyBlocks: {
            create: [
                {
                    id: `${callId}-latency-1`,
                    secondsFromStart: 3.5,
                    duration: 0.8
                }
            ]
        },
        // Create interruptions
        interruptions: {
            create: [
                {
                    id: `${callId}-interruption-1`,
                    secondsFromStart: 15,
                    duration: 2.5,
                    text: "I need to-"
                }
            ]
        }
    };
}