// Mock S3 and SQS clients for development
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const MOCK_MODE = process.env.NODE_ENV !== 'production' || process.env.SKIP_ENV_VALIDATION === 'true';

let sqsClient: SQSClient;

if (MOCK_MODE) {
    console.log("Using mock SQS client");
    // @ts-ignore - Mock implementation
    sqsClient = {
        send: async (command: any) => {
            console.log("Mock SQS command:", command.constructor.name);

            if (command instanceof SendMessageCommand) {
                return { MessageId: "mock-message-id-" + Date.now() };
            }

            if (command instanceof ReceiveMessageCommand) {
                return { Messages: [] }; // Return empty message array
            }

            if (command instanceof DeleteMessageCommand) {
                return {}; // Success response
            }

            return {};
        }
    };
} else {
    // Real implementation
    sqsClient = new SQSClient({
        region: process.env.AWS_BUCKET_REGION || "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
    });
}

export const sqs = sqsClient;

export const s3 = {
    // Mock implementation
    send: async () => {
        console.log("Mock S3 client called");
        return { success: true };
    }
};