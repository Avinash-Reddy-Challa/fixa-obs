// apps/node-server/src/services/aws.ts

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SQS } from "@aws-sdk/client-sqs";
import { env } from "../env";
import { UploadCallParams } from "@repo/types/src/types";
import * as fs from "fs/promises";
import * as path from "path";
import { spawn } from "child_process";
import { createMockCallEntry } from "../utils/mockData";
import { db } from "../db";

// Configure S3 client for DigitalOcean Spaces
export const s3 = new S3Client({
  region: env.AWS_REGION || "us-east-1",
  endpoint: env.AWS_ENDPOINT || "https://nyc3.digitaloceanspaces.com",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || "DO801EPR3XNGGHCM39VQ",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "cM9AGNODa3LEzw8et/GA9y1JLnl6YpxjK8/8/Px4fOs"
  },
  forcePathStyle: false // DigitalOcean Spaces uses subdomain-style URLs
});

// Configure SQS client
export const sqs = new SQS({
  region: "us-east-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || "DO801EPR3XNGGHCM39VQ",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "cM9AGNODa3LEzw8et/GA9y1JLnl6YpxjK8/8/Px4fOs"
  },
});

// Function to get a pre-signed URL for a recording
export async function getPresignedUrl(key: string) {
  try {
    const bucketName = env.AWS_BUCKET_NAME || "tenxrvoiceairecordings";
    console.log(`Original input URL/key: ${key}`);

    // Handle various URL formats
    let cleanKey;

    // Case 1: Full URL with domain
    if (key.includes("digitaloceanspaces.com")) {
      const urlObj = new URL(key);
      let path = urlObj.pathname;
      path = path.startsWith('/') ? path.substring(1) : path;
      cleanKey = path;
    }
    // Case 2: Path that might include bucket name prefix(es)
    else {
      cleanKey = key;

      // Remove leading bucket name if present
      if (cleanKey.startsWith(`${bucketName}/`)) {
        cleanKey = cleanKey.substring(bucketName.length + 1);
      }

      // Check if we need to ADD the bucket name prefix for internal paths
      // This is the key fix: add the bucket name prefix if the path starts with 'livekit'
      if (cleanKey.startsWith('livekit/')) {
        cleanKey = `${bucketName}/${cleanKey}`;
      }
    }

    console.log(`Processed key for S3 operation: ${cleanKey}`);

    // Generate a pre-signed URL
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: cleanKey
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    console.log(`Generated pre-signed URL: ${signedUrl}`);
    return signedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return key; // Return original key if operation fails
  }
}

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(process.cwd(), "uploads", "calls");
  try {
    await fs.access(uploadsDir);
  } catch (error) {
    // Directory doesn't exist, create it recursively
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

// Function to serve a local test file for development
export async function getLocalTestFileUrl(filename: string): Promise<string> {
  const serverUrl = env.NODE_SERVER_URL || 'http://localhost:3000';
  const fileUrl = `${serverUrl}/files/calls/${filename}`;

  console.log("Using local test file URL:", fileUrl);
  return fileUrl;
}

// Updates to your aws.ts file - addCallToQueue function
export const addCallToQueue = async (input: UploadCallParams): Promise<{ success: boolean; callId?: string; error?: string }> => {
  try {
    // For local development, instead of using SQS, process the call directly
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode: Processing call directly without SQS");
      let urlToProcess = input.stereoRecordingUrl;
      // Check if we should use a local test file
      const useTestFile = process.env.USE_TEST_FILE === 'true';
      const testFileName = 'recording_stereo.wav'; // Your test file name

      if (useTestFile) {
        console.log(`Using local test file: ${testFileName}`);
        input.stereoRecordingUrl = await getLocalTestFileUrl(testFileName);
      } else {
        // Try to get a pre-signed URL for the recording
        if (input.stereoRecordingUrl) {
          try {
            const signedUrl = await getPresignedUrl(input.stereoRecordingUrl);
            input.stereoRecordingUrl = signedUrl;
            console.log("Using pre-signed URL for direct processing:", input.stereoRecordingUrl);
          } catch (error) {
            console.error("Error getting pre-signed URL:", error);
            // Continue with the original URL if there's an error
          }
        }
      }

      const metadata = {
        ...input.metadata,
        test: input.metadata?.test !== undefined ? input.metadata.test : "false"
      };

      // If SKIP_PROCESSING is true, create mock data instead of real processing
      if (process.env.SKIP_PROCESSING === 'true') {
        console.log("SKIP_PROCESSING=true: Updating existing call with mock data");

        try {
          // Check if agent exists, if not create it
          const existingAgent = await db.agent.findUnique({
            where: { id: input.agentId }
          });

          if (!existingAgent) {
            console.log(`Creating test agent with ID ${input.agentId}`);
            await db.agent.create({
              data: {
                id: input.agentId,
                name: `Test Agent ${input.agentId}`,
                ownerId: input.ownerId || "dev-org-id",
                customerAgentId: input.agentId,
                phoneNumber: "+1234567890",
                updatedAt: new Date(),
                systemPrompt: "",
                extraProperties: "{}",
                enableSlackNotifications: true
              }
            });
          }

          // Find the call record that was already created
          const existingCall = await db.call.findUnique({
            where: { id: input.callId }
          });

          if (!existingCall) {
            console.log(`Call record with ID ${input.callId} not found, skipping mock data update`);
            return { success: true, callId: input.callId };
          }

          // Update the call with more detailed mock data and link it to the agent
          const updatedCall = await db.call.update({
            where: { id: input.callId },
            data: {
              agentId: input.agentId, // Now that we know the agent exists, we can link to it
              status: "completed",
              timeToFirstWord: 800,
              latencyP50: 200,
              latencyP90: 350,
              latencyP95: 450,
              numInterruptions: 1,
              duration: 120
            }
          });

          console.log(`Successfully updated call entry with mock data: ${updatedCall.id}`);
          return { success: true, callId: input.callId };
        } catch (error) {
          console.error("Error updating call with mock data:", error);
          // Don't throw, just log and continue
          console.log("Continuing despite error to preserve call flow");
          return { success: true, callId: input.callId };
        }
      }
      // If not skipping processing, proceed with normal flow
      const { analyzeAndSaveCall } = require('../services/observability/observability');

      // Process the call directly
      try {
        await analyzeAndSaveCall(input);
        return {
          messageId: "local-development-direct-processing",
          success: true,
          callId: input.callId
        };
      } catch (processError) {
        console.error("Error in analyzeAndSaveCall:", processError);

        // If processing fails but we want to ignore errors, create mock data
        if (process.env.IGNORE_PROCESSING_ERRORS === 'true') {
          console.log("IGNORE_PROCESSING_ERRORS=true: Creating mock data despite error");

          // Create a mock database entry as fallback
          const mockCreated = await createMockCallEntry({
            callId: input.callId,
            agentId: input.agentId,
            ownerId: input.ownerId,
            recordingUrl: input.stereoRecordingUrl,
            createdAt: input.createdAt,
            metadata: input.metadata
          });

          if (mockCreated) {
            console.log("Successfully created mock call data as fallback");
          } else {
            console.log("Failed to create mock call data fallback");
          }

          return {
            messageId: "dev-error-fallback-mock",
            success: true,
            error: (processError as Error).message,
            callId: input.callId
          };
        }

        throw processError;
      }
    }

    // In production, use SQS
    console.log("Production mode: Adding to SQS queue");
    const result = await sqs.sendMessage({
      QueueUrl: env.SQS_QUEUE_URL || "",
      MessageBody: JSON.stringify(input),
    });

    return {
      success: true,
      callId: input.callId,
      messageId: result.MessageId
    };
  } catch (error) {
    console.error("Error adding call to queue:", error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
};

export const uploadFromPresignedUrl = async (
  callId: string,
  recordingUrl: string,
  flipped: boolean,
) => {
  if (!recordingUrl) {
    throw new Error("Recording URL is required");
  }

  try {
    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDir();

    // Try to get a pre-signed URL if it's a DigitalOcean URL and doesn't already have a signature
    let url = recordingUrl;
    if (url.includes("digitaloceanspaces.com") && !url.includes("X-Amz-Signature")) {
      try {
        console.log("Getting pre-signed URL for:", url);
        url = await getPresignedUrl(recordingUrl);
        console.log("Using pre-signed URL:", url);
      } catch (error) {
        console.error("Error getting pre-signed URL:", error);
        // Continue with the original URL if there's an error
      }
    }

    // Extract basic auth credentials if present
    let username;
    let password;
    if (/^[^:]+:[^@]+@/.test(url)) {
      const [protocol, rest] = url.split("://");
      const [credentials, baseUrl] = rest.split("@");
      [username, password] = credentials.split(":");
      url = `${protocol}://${baseUrl}`;
    }

    console.log("Downloading file from URL:", url);
    // Download the file
    const response = await fetch(url, {
      headers:
        username && password
          ? {
            Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
          }
          : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to download file from URL: ${url}, status: ${response.status}`);
    }

    // Get content type from response headers
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    console.log("File content type:", contentType);

    // Determine file extension based on content type
    let extension = "bin";
    if (
      contentType.includes("audio/mpeg") ||
      contentType.includes("audio/mp3")
    ) {
      extension = "mp3";
    } else if (contentType.includes("audio/wav")) {
      extension = "wav";
    } else if (contentType.includes("audio/ogg")) {
      extension = "ogg";
    } else if (contentType.includes("audio/m4a")) {
      extension = "m4a";
    } else if (contentType.includes("video/mp4")) {
      extension = "mp4";
    }

    console.log("Detected file extension:", extension);
    const buffer = await response.arrayBuffer();
    let finalBuffer = Buffer.from(buffer);

    // Convert to stereo WAV if it's not already or if flipped is true
    if (extension !== "wav" || flipped) {
      console.log("Converting to stereo WAV...");
      await new Promise((resolve, reject) => {
        const ffmpegArgs = [
          "-i", "pipe:0", // Read from stdin
        ];

        if (flipped) {
          ffmpegArgs.push("-af", "pan=stereo|c1=c0|c0=c1"); // Swap channels if flipped
        } else {
          ffmpegArgs.push("-ac", "2"); // Ensure stereo output
        }

        ffmpegArgs.push(
          "-f", "wav", // Output format
          "pipe:1" // Output to stdout
        );

        const ffmpeg = spawn("ffmpeg", ffmpegArgs);
        const chunks: Buffer[] = [];

        ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));
        ffmpeg.stderr.on("data", (data) =>
          console.error(`ffmpeg stderr: ${data}`),
        );

        ffmpeg.on("close", (code) => {
          if (code === 0) {
            finalBuffer = Buffer.concat(chunks);
            extension = "wav"; // Update extension to wav
            console.log("Conversion to stereo WAV successful");
            resolve(null);
          } else {
            reject(new Error(`ffmpeg process exited with code ${code}`));
          }
        });

        // Write input buffer to ffmpeg's stdin
        ffmpeg.stdin.write(Buffer.from(buffer));
        ffmpeg.stdin.end();
      });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${callId}-${timestamp}.${extension}`;
    const localPath = path.join(uploadsDir, filename);

    // Save file to local filesystem
    await fs.writeFile(localPath, finalBuffer);

    // Create a URL that points to our Express server's file serving endpoint
    // Using the NODE_SERVER_URL from environment which should be something like http://localhost:3003
    const port = process.env.PORT || 3001;
    const fileUrl = `${env.NODE_SERVER_URL || 'http://localhost:3000'}/files/calls/${filename}`;

    console.log(`File saved locally at ${localPath}, accessible at ${fileUrl}`);

    return fileUrl;
  } catch (error) {
    console.error("Error in uploadFromPresignedUrl:", error);
    throw error;
  }
};