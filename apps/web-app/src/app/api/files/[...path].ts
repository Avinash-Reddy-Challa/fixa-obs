// apps/web-app/src/pages/api/files/[...path].ts
import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs/promises";
import * as path from "path";
import { extname } from "path";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Get the file path from the URL
        const { path: filePath } = req.query;

        if (!filePath || !Array.isArray(filePath) || filePath.length === 0) {
            return res.status(400).json({ error: "Invalid file path" });
        }

        // Join the path segments and ensure no path traversal
        const sanitizedPath = filePath.join("/").replace(/\.\.\//g, "");
        const fullPath = path.join(process.cwd(), "uploads", sanitizedPath);

        // Check if the file exists
        try {
            await fs.access(fullPath);
        } catch (error) {
            return res.status(404).json({ error: "File not found" });
        }

        // Get file info
        const stats = await fs.stat(fullPath);

        if (!stats.isFile()) {
            return res.status(400).json({ error: "Not a file" });
        }

        // Determine content type based on file extension
        const ext = extname(fullPath).toLowerCase();
        let contentType = "application/octet-stream";

        // Map common extensions to MIME types
        const mimeTypes: Record<string, string> = {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".wav": "audio/wav",
            ".mp3": "audio/mpeg",
            ".mp4": "video/mp4",
            ".pdf": "application/pdf",
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };

        if (ext in mimeTypes) {
            contentType = mimeTypes[ext] ?? "application/octet-stream";
        }

        // Set appropriate headers
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Length", stats.size);

        // Read and stream the file
        const fileBuffer = await fs.readFile(fullPath);
        res.status(200).send(fileBuffer);
    } catch (error) {
        console.error("Error serving file:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}