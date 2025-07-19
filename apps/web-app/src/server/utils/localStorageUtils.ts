import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export const uploadFileToLocal = async (
    file: File,
    keepOriginalName = false,
): Promise<{ url: string; type: string }> => {
    const fileExtension = file.name.split(".").pop();
    const fileName = keepOriginalName
        ? file.name
        : `${uuidv4()}.${fileExtension}`;

    const key = fileName + "-" + uuidv4();
    const filePath = path.join(UPLOAD_DIR, key);

    try {
        const arrayBuffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, arrayBuffer);

        // Return a local URL that can be accessed through the Next.js public directory
        return {
            url: `/uploads/${key}`,
            type: file.type,
        };
    } catch (error) {
        console.error("Error saving file locally:", error);
        throw new Error("Failed to save file");
    }
};

export const createLocalFileUrl = async (
    fileName: string,
    fileType: string,
    keepOriginalName = false,
): Promise<string> => {
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = keepOriginalName
        ? fileName
        : `${uuidv4()}.${fileExtension}`;

    const prefix = fileType === "application/pdf" ? "brochures" : "images";
    const key = `${prefix}/${uniqueFileName}`;

    return `/uploads/${key}`;
};