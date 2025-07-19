// apps/web-app/src/server/config/s3client.ts
// This file is kept for backward compatibility but no longer uses AWS S3
// We'll use it to provide local file storage utilities

import * as path from "path";
import * as fs from "fs/promises";

// Ensure the uploads directory exists
export const ensureUploadsDirectory = async (prefix: string = "") => {
  const uploadsDir = path.join(process.cwd(), process.env.LOCAL_STORAGE_PATH || "uploads", prefix);
  try {
    await fs.access(uploadsDir);
  } catch (error) {
    // Directory doesn't exist, create it recursively
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

// For backward compatibility, we export an empty object with the same shape
// as the original S3Client, but it doesn't do anything
export const s3Client = {
  // This is a placeholder that won't be used
  _placeholder: true
};