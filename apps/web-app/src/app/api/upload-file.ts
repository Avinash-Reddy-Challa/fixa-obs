// apps/web-app/src/pages/api/upload-file.ts
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import * as fs from "fs/promises";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

// Disable the default body parser to handle file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Get the upload token from the query parameters
        const { token } = req.query;

        if (!token || typeof token !== "string") {
            return res.status(400).json({ error: "Invalid upload token" });
        }

        // Check if the token exists in our temporary store
        if (!global.uploadTokens || !global.uploadTokens.has(token)) {
            return res.status(401).json({ error: "Unauthorized upload attempt" });
        }

        // Get the file metadata from the token
        const { fileName, fileType, prefix } = global.uploadTokens.get(token);

        // Remove the token after use
        global.uploadTokens.delete(token);

        // Parse the incoming form data
        const form = formidable({
            maxFileSize: 100 * 1024 * 1024, // 100MB limit
        });

        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    console.error("Error parsing form:", err);
                    res.status(500).json({ error: "Failed to parse file upload" });
                    return resolve(true);
                }

                const file = files.file?.[0];

                if (!file) {
                    res.status(400).json({ error: "No file provided" });
                    return resolve(true);
                }

                try {
                    // Ensure the uploads directory exists
                    const uploadsDir = path.join(process.cwd(), "uploads", prefix);
                    try {
                        await fs.access(uploadsDir);
                    } catch {
                        await fs.mkdir(uploadsDir, { recursive: true });
                    }

                    // Generate unique filename
                    const uniqueKey = `${fileName}-${uuidv4()}`;
                    const filePath = path.join(uploadsDir, uniqueKey);

                    // Read the file from the temporary location and save it to our uploads directory
                    const fileData = await fs.readFile(file.filepath);
                    await fs.writeFile(filePath, fileData);

                    // Clean up the temporary file
                    await fs.unlink(file.filepath).catch(console.error);

                    // Return the public URL for the file
                    const fileUrl = `/api/files/${prefix}/${uniqueKey}`;

                    res.status(200).json({
                        url: fileUrl,
                        type: fileType
                    });
                    return resolve(true);
                } catch (error) {
                    console.error("Error handling file upload:", error);
                    res.status(500).json({ error: "Failed to upload file" });
                    return resolve(true);
                }
            });
        });
    } catch (error) {
        console.error("Error in upload handler:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}