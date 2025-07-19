// apps/web-app/src/server/api/routers/s3.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

// Mock implementation of createPresignedUrl
const createPresignedUrl = async (fileName: string, fileType: string, keepOriginalName?: boolean) => {
  console.log("Mock createPresignedUrl called with:", { fileName, fileType, keepOriginalName });
  return {
    url: "https://example.com/mock-upload-url",
    fields: {},
    key: "mock-key",
  };
};

// Export s3Router to match the import in root.ts
export const s3Router = createTRPCRouter({
  getPresignedS3Url: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        keepOriginalName: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Use the mock implementation
      return await createPresignedUrl(
        input.fileName,
        input.fileType,
        input.keepOriginalName,
      );
    }),
});