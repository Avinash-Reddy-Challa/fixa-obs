// apps/web-app/src/server/utils/s3utils.ts
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs/promises";
import * as path from "path";

// Type augmentation for globalThis to include uploadTokens
declare global {
  // eslint-disable-next-line no-var
  var uploadTokens: Map<string, {
    fileName: string;
    fileType: string;
    prefix: string;
    createdAt: number;
  }> | undefined;
}

// Ensure uploads directory exists
const ensureUploadsDir = async (prefix: string = "") => {
  const uploadsDir = path.join(process.cwd(), "uploads", prefix);
  try {
    await fs.access(uploadsDir);
  } catch (error) {
    // Directory doesn't exist, create it recursively
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

/**
 * Uploads a file to the local file system
 */
export const uploadFileToLocalStorage = async (
  file: File,
  keepOriginalName = false,
): Promise<{ url: string; type: string }> => {
  const fileExtension = file.name.split(".").pop();
  const fileName = keepOriginalName
    ? file.name
    : `${uuidv4()}.${fileExtension}`;

  // Determine directory prefix based on file type
  const prefix = file.type === "application/pdf" ? "brochures" : "images";
  const uploadsDir = await ensureUploadsDir(prefix);

  // Create unique key with filename and UUID
  const key = `${fileName}-${uuidv4()}`;
  const filePath = path.join(uploadsDir, key);

  const arrayBuffer = Buffer.from(await file.arrayBuffer());

  try {
    await fs.writeFile(filePath, arrayBuffer);

    // Return a URL path that can be accessed through the Next.js API
    return {
      url: `/api/files/${prefix}/${key}`,
      type: file.type,
    };
  } catch (error) {
    console.error("Error uploading file to local storage:", error);
    throw new Error("Failed to upload file");
  }
};

/**
 * Creates a "fake" presigned URL that actually points to a local file upload endpoint
 */
export const createPresignedUrl = async (
  fileName: string,
  fileType: string,
  keepOriginalName = false,
): Promise<string> => {
  const fileExtension = fileName.split(".").pop();
  const uniqueFileName = keepOriginalName
    ? fileName
    : `${uuidv4()}.${fileExtension}`;

  const prefix = fileType === "application/pdf" ? "brochures" : "images";

  // Ensure directory exists
  await ensureUploadsDir(prefix);

  // Generate a unique token for this upload request
  const uploadToken = uuidv4();

  // Store this token temporarily (could use a simple in-memory store or database)
  // This is a simplified example - in production you might want to store this in Redis or a database
  // with an expiration time
  global.uploadTokens = global.uploadTokens || new Map();
  global.uploadTokens.set(uploadToken, {
    fileName: uniqueFileName,
    fileType,
    prefix,
    createdAt: Date.now(),
  });

  // Return URL to your own upload endpoint with the token
  return `/api/upload-file?token=${uploadToken}`;
};