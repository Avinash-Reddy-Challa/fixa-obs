import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";

// Configure S3 client for DigitalOcean Spaces
export const s3Client = new S3Client({
    region: "us-east-1", // DigitalOcean Spaces typically use us-east-1
    endpoint: "https://tenxrvoiceairecordings.nyc3.digitaloceanspaces.com",
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY || "DO801EPR3XNGGHCM39VQ",
        secretAccessKey: env.AWS_SECRET_KEY || "cM9AGNODa3LEzw8et/GA9y1JLnl6YpxjK8/8/Px4fOs"
    },
    forcePathStyle: false // DigitalOcean Spaces uses subdomain-style URLs
});

// Function to get a pre-signed URL for a recording
export async function getRecordingUrl(key: string) {
    try {
        // Handle existing URLs - if it's already a full URL, extract the key
        if (key.startsWith('http')) {
            try {
                const url = new URL(key);
                // Extract the path from the URL and remove the leading slash
                key = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
            } catch (error) {
                console.error("Error parsing URL:", error);
                // If there's an error parsing the URL, use the original key
            }
        }

        const command = new GetObjectCommand({
            Bucket: env.BUCKET || "tenxrvoiceairecordings",
            Key: key
        });

        // Generate a presigned URL that's valid for 1 hour (3600 seconds)
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return url;
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        throw error;
    }
}