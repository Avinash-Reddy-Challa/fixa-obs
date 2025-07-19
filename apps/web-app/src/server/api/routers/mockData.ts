// File: src/server/api/routers/mockData.ts

// Generate a series of mock messages
function generateMessages(startTime: Date, count: number) {
    const messages = [];
    let currentTime = startTime.getTime();

    for (let i = 0; i < count; i++) {
        const isAgent = i % 2 === 1; // Alternate between user and agent
        const duration = 2000 + Math.random() * 8000; // 2-10 seconds per message

        messages.push({
            id: `msg_${i}_${Date.now()}${Math.floor(Math.random() * 1000)}`,
            callId: "mock_call_id",
            role: isAgent ? "agent" : "user",
            text: isAgent
                ? "This is a sample response from the agent. How can I help you today?"
                : "This is a sample question from the user. Can you help me with something?",
            startTime: new Date(currentTime).toISOString(),
            endTime: new Date(currentTime + duration).toISOString(),
            createdAt: new Date(currentTime).toISOString(),
            updatedAt: new Date(currentTime).toISOString(),
        });

        currentTime += duration + (isAgent ? 1000 : 2000); // Add some thinking time
    }

    return messages;
}

// Generate latency blocks
function generateLatencyBlocks(count: number) {
    const blocks = [];

    for (let i = 0; i < count; i++) {
        blocks.push({
            id: `latency_${i}_${Date.now()}${Math.floor(Math.random() * 1000)}`,
            callId: "mock_call_id",
            secondsFromStart: 5 + i * 30 + Math.random() * 10,
            duration: 0.8 + Math.random() * 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }

    return blocks;
}

// Generate interruptions
function generateInterruptions(count: number) {
    const interruptions = [];

    for (let i = 0; i < count; i++) {
        interruptions.push({
            id: `interrupt_${i}_${Date.now()}${Math.floor(Math.random() * 1000)}`,
            callId: "mock_call_id",
            secondsFromStart: 15 + i * 45 + Math.random() * 20,
            duration: 0.2 + Math.random() * 1.5,
            text: "Sorry, I didn't mean to interrupt you.",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }

    return interruptions;
}

// Generate evaluation results
function generateEvaluationResults(callId: string, count: number) {
    const results = [];
    const evalTypes = ["greeting", "politeness", "understanding", "helpfulness", "closure"];

    for (let i = 0; i < count; i++) {
        const evalType = evalTypes[i % evalTypes.length];
        results.push({
            id: `eval_${i}_${Date.now()}${Math.floor(Math.random() * 1000)}`,
            callId: callId,
            evaluationId: `evaluation_${evalType}`,
            result: Math.random() > 0.2 ? "success" : "failure",
            explanation: `The agent ${Math.random() > 0.2 ? "successfully" : "failed to"} demonstrate ${evalType}.`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            evaluationGroupId: `evalgroup_${Math.floor(Math.random() * 3)}`,
            evaluation: {
                id: `evaluation_${evalType}`,
                name: `${evalType.charAt(0).toUpperCase() + evalType.slice(1)} Check`,
                description: `Checks if the agent properly demonstrates ${evalType}`,
                prompt: `Evaluate if the agent demonstrates proper ${evalType}...`,
                ownerId: "org_mock123456",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        });
    }

    return results;
}

// Create a properly structured mock call
export const createMockCall = (id: string, index: number): any => {
    const now = new Date();
    const startTime = new Date(now.getTime() - 15 * 60000); // 15 minutes ago
    const endTime = new Date(now.getTime() - 5 * 60000);    // 5 minutes ago

    return {
        id,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        ownerId: "org_mock123456",
        deleted: false,
        agentId: `agent_mock${index % 3}`,
        vapiCallId: `vapi_${id}`,
        customerCallId: id,
        ofOneDeviceId: `device_${id}`,
        status: "completed",
        result: Math.random() > 0.2 ? "success" : "failure", // 80% success rate
        failureReason: "",
        stereoRecordingUrl: `calls/${id}/recording.wav`,
        monoRecordingUrl: `https://storage.example.com/recordings/${id}_mono.wav`,
        startedAt: startTime.toISOString(),
        endedAt: endTime.toISOString(),
        regionId: "us-east-1",
        metadata: { test: "false" }, // Empty object for metadata
        timeToFirstWord: 0.8 + Math.random() * 2,
        latencyP50: 1.2 + Math.random() * 1.5,
        latencyP90: 2.5 + Math.random() * 2,
        latencyP95: 3.0 + Math.random() * 2.5,
        interruptionP50: 0.1 + Math.random() * 0.3,
        interruptionP90: 0.3 + Math.random() * 0.5,
        interruptionP95: 0.5 + Math.random() * 0.7,
        numInterruptions: Math.floor(Math.random() * 5),
        duration: 300 + Math.floor(Math.random() * 300), // 5-10 minute calls
        notes: "",
        isRead: Math.random() > 0.5,
        readBy: "user_mock123",
        testId: `test_${id}`,
        testAgentId: `testagent_${Math.floor(Math.random() * 5)}`,
        scenarioId: `scenario_${Math.floor(Math.random() * 3)}`,
        evalSetToSuccess: null,

        // Include required array fields
        messages: generateMessages(startTime, 5 + Math.floor(Math.random() * 10)),
        latencyBlocks: generateLatencyBlocks(3 + Math.floor(Math.random() * 5)),
        interruptions: generateInterruptions(Math.floor(Math.random() * 5)),
        evaluationResults: generateEvaluationResults(id, 2 + Math.floor(Math.random() * 3)),

        // Include required object relationships
        scenario: {
            id: `scenario_${Math.floor(Math.random() * 3)}`,
            name: `Test Scenario ${Math.floor(Math.random() * 3)}`,
            description: "A test scenario for the mock data",
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        testAgent: {
            id: `testagent_${Math.floor(Math.random() * 5)}`,
            name: ["Lily", "Steve", "Marge", "Daryl", "Maria"][Math.floor(Math.random() * 5)],
            description: "Test agent persona",
            prompt: "You are a test agent with a specific personality...",
            voiceId: `voice_${Math.floor(Math.random() * 10)}`,
            headshotUrl: `https://storage.example.com/headshots/agent_${Math.floor(Math.random() * 5)}.jpg`,
            enabled: true,
            defaultSelected: Math.random() > 0.7,
            order: Math.floor(Math.random() * 5),
            ownerId: "org_mock123456",
            createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
    };
};

// Generate a list of mock calls
// In apps/web-app/src/server/api/routers/mockData.ts

// When generating mock calls, ensure they have the correct metadata
export const generateMockCalls = (count: number) => {
    const calls = [];
    for (let i = 0; i < count; i++) {
        // Create a call with test: "false" in metadata
        const call = createMockCall(`mock-call-${i}`, i);

        // Ensure metadata contains test: "false"
        if (!call.metadata) {
            call.metadata = {};
        }
        call.metadata.test = "false";

        calls.push(call);
    }
    return calls;
};

// In your apps/web-app/src/server/api/routers/mockData.ts file

// Update the filterMockCalls function
export const filterMockCalls = (calls: any[], filter: any) => {
    if (!filter) return calls;

    console.log("Filtering calls with:", filter);

    return calls.filter(call => {
        // Filter by agentId if specified
        if (filter.agentId && filter.agentId.length > 0) {
            if (!filter.agentId.includes(call.agentId)) {
                return false;
            }
        }

        // Filter by time range (lookbackPeriod or explicit timeRange)
        if (filter.timeRange) {
            const callTime = new Date(call.startedAt).getTime();
            if (callTime < filter.timeRange.start || callTime > filter.timeRange.end) {
                return false;
            }
        } else if (filter.lookbackPeriod) {
            const now = Date.now();
            const lookbackTime = now - filter.lookbackPeriod.value;
            const callTime = new Date(call.startedAt).getTime();
            if (callTime < lookbackTime) {
                return false;
            }
        }

        // Filter by metadata if specified
        if (filter.metadata && Object.keys(filter.metadata).length > 0) {
            for (const [key, value] of Object.entries(filter.metadata)) {
                console.log(`Checking metadata ${key}=${value} against`, call.metadata);

                // Handle special case for test flag
                if (key === 'test') {
                    // Handle both string comparison and test/testId check
                    if (value === 'false') {
                        // If filter wants test=false, reject calls with testId
                        if (call.testId) {
                            console.log(`Rejecting call ${call.id} because it has testId while filter requires test=false`);
                            return false;
                        }
                        // Also reject if metadata.test is not false
                        if (call.metadata && call.metadata.test !== 'false') {
                            console.log(`Rejecting call ${call.id} because metadata.test is not 'false'`);
                            return false;
                        }
                    } else if (value === 'true') {
                        // If filter wants test=true, reject calls without testId
                        if (!call.testId && (!call.metadata || call.metadata.test !== 'true')) {
                            console.log(`Rejecting call ${call.id} because it has no testId while filter requires test=true`);
                            return false;
                        }
                    }
                }
                // Handle regular metadata fields
                else if (!call.metadata ||
                    (typeof value === 'string' && call.metadata[key] !== value) ||
                    (Array.isArray(value) && !value.includes(call.metadata[key]))) {
                    console.log(`Rejecting call ${call.id} because metadata.${key} doesn't match filter value`);
                    return false;
                }
            }
        }

        // Filter by customerCallId if specified
        if (filter.customerCallId && (!call.customerCallId || !call.customerCallId.includes(filter.customerCallId))) {
            return false;
        }

        // Call passed all filters
        return true;
    });
};