import { Router, Request, Response } from "express";
import { db } from "../../../db";
import { SearchService } from '../../../utils/mocks/SearchService';
import { mockPrisma } from '../../../utils/mocks/PrismaClient';

const searchRouter = Router();
const searchService = new SearchService(mockPrisma);
searchRouter.get("/", async (req: Request, res: Response) => {
  try {
    const ownerId = res.locals.orgId;
    const includeDefault = req.query.includeDefault !== "false";
    const searches = await searchService.getAll({ ownerId, includeDefault });
    res.json({ success: true, searches });
  } catch (error) {
    console.error("Error getting searches", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Debug endpoints for call data visibility
// In apps/node-server/src/routers/v1/routes/search.ts

// Debug endpoint to show storage state
searchRouter.get("/debug-storage", async (req: Request, res: Response) => {
  try {
    // Get all calls with minimal includes
    const calls = await db.call.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerCallId: true,
        createdAt: true,
        startedAt: true,
        status: true,
        metadata: true,
        agentId: true,
        ownerId: true,
      }
    });
    res.json({ count: calls.length, calls });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Test endpoint that simulates the dashboard query
searchRouter.get("/dashboard-calls", async (req: Request, res: Response) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // This query should match what the dashboard uses
    const calls = await db.call.findMany({
      where: {
        createdAt: {
          gte: yesterday,
        },
        customerCallId: {
          not: null, // This could be filtering out calls
        },
        deleted: false,
        metadata: {
          path: ["test"],
          equals: "false", // Use string comparison for test field
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerCallId: true,
        createdAt: true,
        startedAt: true,
        status: true,
        metadata: true,
        agentId: true,
        ownerId: true,
      }
    });

    console.log(`Dashboard query found ${calls.length} calls`);
    res.json({ success: true, count: calls.length, calls });
  } catch (error) {
    console.error("Error in dashboard-calls endpoint:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Create a test call
searchRouter.post("/create-test-call", async (req: Request, res: Response) => {
  try {
    const callId = `test-${Date.now()}`;
    const call = await db.call.create({
      data: {
        id: callId,
        customerCallId: callId,
        stereoRecordingUrl: "https://example.com/audio.wav",
        agentId: "mock-agent-id",
        ownerId: req.body.orgId || "mock-org-id",
        status: "completed",
        createdAt: new Date(),
        startedAt: new Date(),
        metadata: { test: "false" }, // Explicitly set test to false
        deleted: false,
      },
    });

    console.log(`Created test call ${callId}`);
    res.json({ success: true, call });
  } catch (error) {
    console.error("Error creating test call:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// List all calls without filtering
searchRouter.get("/list-all-calls", async (req: Request, res: Response) => {
  try {
    const calls = await db.call.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerCallId: true,
        createdAt: true,
        startedAt: true,
        status: true,
        metadata: true,
        agentId: true,
        ownerId: true,
      }
    });
    res.json({ count: calls.length, calls });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Populate test data
searchRouter.post("/populate-test-data", async (req: Request, res: Response) => {
  try {
    const count = req.body.count || 5;
    const ownerId = req.body.orgId || "mock-org-id";
    const calls = [];

    for (let i = 0; i < count; i++) {
      const callId = `test-${Date.now()}-${i}`;
      const call = await db.call.create({
        data: {
          id: callId,
          customerCallId: callId,
          stereoRecordingUrl: "https://example.com/audio.wav",
          agentId: "mock-agent-id",
          ownerId,
          status: "completed",
          createdAt: new Date(),
          startedAt: new Date(),
          metadata: { test: "false" },
          deleted: false,
        },
      });
      calls.push(call);
    }

    res.json({ success: true, count, calls });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

searchRouter.post("/refresh-dashboard", async (req: Request, res: Response) => {
  try {
    // Create a unique call ID based on timestamp
    const testCallId = `test-call-${Date.now()}`;

    // Get organization ID from request if available
    const orgId = res.locals.orgId || "dev-org-id";

    // Create a dashboard-compatible call with test:false metadata
    const mockData = {
      id: testCallId,
      customerCallId: testCallId,
      agentId: "agent-avi",
      orgId: orgId,
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
      metadata: { test: "false" }, // Important: Setting test:false so it shows in dashboard
      messages: [
        { role: "user", text: "Hello, I'd like to book a flight", start: 0, end: 3.5 },
        { role: "agent", text: "I'd be happy to help you book a flight. Where would you like to go?", start: 4.3, end: 8.7 }
      ]
    };

    console.log(`Creating dashboard call: ${testCallId}`);

    // Create the call in the database
    await db.call.create({
      data: mockData
    });

    console.log(`Successfully created dashboard call: ${testCallId}`);

    return res.status(200).json({
      success: true,
      message: "Dashboard data refreshed with new test call",
      callId: testCallId
    });
  } catch (error) {
    console.error("Error refreshing dashboard data:", error);
    return res.status(500).json({
      success: false,
      message: "Error refreshing dashboard data",
      error: (error instanceof Error) ? error.message : String(error)
    });
  }
});



searchRouter.get("/default", async (req: any, res: { locals: { orgId: any; }; json: (arg0: { success: boolean; search: { ownerId: string; id: string; name: string; filter: { agentId: never[]; lookbackPeriod: { value: string; label: string; }; chartPeriod: number; timeRange: undefined; metadata: {}; }; createdAt: Date; updatedAt: Date; isDefault: boolean; agentId: null; lookbackPeriod: string; timeRange: null; chartPeriod: number; customerCallId: null; metadata: {}; } | { id: string; name: string; filter: { agentId: never[]; lookbackPeriod: { value: string; label: string; }; chartPeriod: number; }; ownerId: string; createdAt: Date; updatedAt: Date; isDefault: boolean; agentId: null; lookbackPeriod: string; timeRange: null; chartPeriod: number; customerCallId: null; metadata: {}; }; }) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; error: string; }): void; new(): any; }; }; }) => {
  try {
    const ownerId = res.locals.orgId;
    const search = await searchService.getDefault({ ownerId });
    res.json({ success: true, search });
  } catch (error) {
    console.error("Error getting default search", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

searchRouter.get("/debug-calls", async (req: Request, res: Response) => {
  try {
    // Get all calls
    const allCalls = await db.call.findMany();

    // Get calls with test:false in metadata
    const testFalseCalls = await db.call.findMany({
      where: {
        metadata: { test: "false" }
      }
    });

    // Get calls from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCalls = await db.call.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });

    // Get calls from the last 24 hours with test:false
    const recentTestFalseCalls = await db.call.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo
        },
        metadata: { test: "false" }
      }
    });

    // Return all the results
    return res.json({
      allCallsCount: allCalls.length,
      testFalseCallsCount: testFalseCalls.length,
      recentCallsCount: recentCalls.length,
      recentTestFalseCallsCount: recentTestFalseCalls.length,
      allCalls: allCalls.map(call => ({
        id: call.id,
        createdAt: call.createdAt,
        metadata: call.metadata,
        agentId: call.agentId,
        orgId: call.orgId
      })),
      testFalseCalls: testFalseCalls.map(call => ({
        id: call.id,
        createdAt: call.createdAt,
        metadata: call.metadata
      })),
      recentCalls: recentCalls.map(call => ({
        id: call.id,
        createdAt: call.createdAt,
        metadata: call.metadata
      })),
      recentTestFalseCalls: recentTestFalseCalls.map(call => ({
        id: call.id,
        createdAt: call.createdAt,
        metadata: call.metadata
      }))
    });
  } catch (error) {
    console.error("Error in debug-calls endpoint:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add an endpoint to create a test call
searchRouter.post("/create-test-call", async (req: Request, res: Response) => {
  try {
    const testCallId = `test-call-${Date.now()}`;

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

    return res.status(200).json({
      success: true,
      message: "Test call created successfully",
      call: {
        id: call.id,
        createdAt: call.createdAt,
        metadata: call.metadata
      }
    });
  } catch (error) {
    console.error("Error creating test call:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

searchRouter.get("/:id", async (req: { params: { id: any; }; }, res: { locals: { orgId: any; }; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; error: string; }): void; new(): any; }; }; json: (arg0: { success: boolean; search: { id: string; name: string; filter: { agentId: never[]; lookbackPeriod: { value: string; label: string; }; chartPeriod: number; timeRange: undefined; metadata: {}; }; ownerId: string; createdAt: Date; updatedAt: Date; isDefault: boolean; agentId: null; lookbackPeriod: string; timeRange: null; chartPeriod: number; customerCallId: null; metadata: {}; } | { id: string; name: string; filter: { agentId: never[]; lookbackPeriod: { value: string; label: string; }; chartPeriod: number; }; ownerId: string; createdAt: Date; updatedAt: Date; isDefault: boolean; agentId: null; lookbackPeriod: string; timeRange: null; chartPeriod: number; customerCallId: null; metadata: {}; }; }) => void; }) => {
  try {
    const { id } = req.params;
    const ownerId = res.locals.orgId;
    const search = await searchService.getById({ id, ownerId });
    if (!search) {
      return res
        .status(404)
        .json({ success: false, error: "Search not found" });
    }
    res.json({ success: true, search });
  } catch (error) {
    console.error("Error getting search", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

searchRouter.post("/", async (req: { body: { name: any; filter: any; }; }, res: { locals: { orgId: any; }; json: (arg0: { success: boolean; search: { id: string; name: string; filter: any; ownerId: string; createdAt: Date; updatedAt: Date; isDefault: boolean; agentId: any; lookbackPeriod: any; timeRange: any; chartPeriod: any; customerCallId: any; metadata: any; }; }) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; error: string; }): void; new(): any; }; }; }) => {
  try {
    const ownerId = res.locals.orgId;
    const { name, filter } = req.body;
    const search = await searchService.save({ name, filter, ownerId });
    res.json({ success: true, search });
  } catch (error) {
    console.error("Error creating search", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});


searchRouter.delete("/:id", async (req: { params: { id: any; }; }, res: { locals: { orgId: any; }; json: (arg0: { success: boolean; }) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; error: string; }): void; new(): any; }; }; }) => {
  try {
    const { id } = req.params;
    const ownerId = res.locals.orgId;
    await searchService.delete({ id, ownerId });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting search", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export { searchRouter };
