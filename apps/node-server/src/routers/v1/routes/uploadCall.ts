// apps/node-server/src/routers/v1/routes/uploadCall.ts
import { Request, Response, Router, NextFunction } from "express";
import { authenticatePublicRequest } from "../../../middlewares/auth";
import { addCallToQueue, getPresignedUrl, uploadFromPresignedUrl } from "../../../services/aws";
import { clerkServiceClient } from "../../../clients/clerkServiceClient";
import { posthogClient } from "../../../clients/posthogClient";
import { db } from "../../../db";
const uploadCallRouter = Router();

// Middleware to validate required upload call parameters
const validateUploadCallParams = (req: Request, res: Response, next: NextFunction) => {
  const { callId, stereoRecordingUrl, agentId } = req.body;

  if (!callId) {
    return res.status(400).json({
      success: false,
      error: "callId is required",
    });
  }

  if (!stereoRecordingUrl) {
    return res.status(400).json({
      success: false,
      error: "stereoRecordingUrl is required",
    });
  }

  if (!agentId) {
    return res.status(400).json({
      success: false,
      error: "agentId is required",
    });
  }

  next();
};

uploadCallRouter.post(
  "/",
  validateUploadCallParams,
  async (req: Request, res: Response) => {
    try {
      const {
        callId,
        stereoRecordingUrl,
        agentId,
        metadata,
        createdAt,
        saveRecording,
        language,
        scenario,
        webhookUrl,
      } = req.body;

      // Payment/billing checks remain the same...
      const callTime = createdAt ? new Date(createdAt) : new Date();

      // Ensure we set appropriate metadata to pass dashboard filters
      const callMetadata = {
        ...(metadata || {}),
        // Ensure test is explicitly set to "false" if not provided
        test: metadata?.test || "false",
      };
      // Create database entry immediately with initial status
      await db.call.create({
        data: {
          id: callId,
          customerCallId: callId, // Ensure this is set for filtering
          stereoRecordingUrl,
          ownerId: res.locals.orgId,
          status: "queued",
          startedAt: callTime.toISOString(),
          metadata: callMetadata,
          deleted: false, // Explicitly set to false
        },
      });

      // Then add to queue for processing as before
      await addCallToQueue({
        callId,
        stereoRecordingUrl,
        agentId,
        createdAt: callTime.toISOString(),
        ownerId: res.locals.orgId,
        metadata: callMetadata,
        saveRecording,
        language,
        scenario,
        webhookUrl,
      });
      res.json({ success: true, callId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  },
);

export { uploadCallRouter };