// Mock implementation for testing
export async function getRecordingUrl(key: string) {
    console.log("Mock getRecordingUrl called with key:", key);

    // If it's a full URL already, return it
    if (key.startsWith('http')) {
        return key;
    }

    // For testing with mock data, return a predictable URL
    // Format a URL that could work with a public bucket or for testing
    return `https://tenxrvoiceairecordings.nyc3.digitaloceanspaces.com/${key}`;
}