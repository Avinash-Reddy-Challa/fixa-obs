// apps/node-server/src/utils/audio.ts
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

const execAsync = promisify(exec);

// Helper function to download a file to a temporary location
async function downloadToTemp(url: string): Promise<string> {
  try {
    console.log(`Downloading file from URL to temp location: ${url.substring(0, 100)}...`);

    // Create a unique filename in the temp directory
    const tempDir = os.tmpdir();
    const uniqueId = uuidv4();
    const fileExt = path.extname(url.split('?')[0]) || '.mp4'; // Get extension before query parameters
    const tempFilePath = path.join(tempDir, `${uniqueId}${fileExt}`);

    // Download the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    // Save to disk
    const buffer = await response.buffer();
    await fs.writeFile(tempFilePath, buffer);

    console.log(`File downloaded to: ${tempFilePath}`);
    return tempFilePath;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Gets the duration of an audio file
 * @param url URL or path to the audio file
 * @returns Duration in seconds
 */
export async function getAudioDuration(url: string): Promise<number> {
  // Skip processing in development if flag is set
  if (process.env.SKIP_PROCESSING === 'true' && process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Skipping audio processing for: ${url.substring(0, 50)}...`);
    return 120; // Return a mock duration of 2 minutes
  }

  let tempFilePath: string | null = null;

  try {
    // For URLs with query parameters or long URLs, download to temp file first
    if (url.includes('?') || url.length > 500 || url.startsWith('http')) {
      tempFilePath = await downloadToTemp(url);
      url = tempFilePath;
    }

    // Use ffprobe to get the audio duration
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_format "${url}"`,
    );
    const metadata = JSON.parse(stdout);
    return Math.round(parseFloat(metadata.format.duration) * 100) / 100;
  } catch (error) {
    console.error("Error getting audio duration:", error);

    // For development, return a mock duration if flag is set
    if (process.env.IGNORE_PROCESSING_ERRORS === 'true' && process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Ignoring error and returning mock duration`);
      return 120; // Return a mock duration of 2 minutes
    }

    throw new Error("Failed to get audio duration for url: " + url);
  } finally {
    // Clean up the temp file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log(`Removed temporary file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error(`Failed to remove temporary file: ${tempFilePath}`, cleanupError);
      }
    }
  }
}

/**
 * Gets the number of audio channels in a file
 * @param url URL or path to the audio file
 * @returns Number of audio channels
 */
export async function getNumberOfAudioChannels(url: string): Promise<number> {
  // Skip processing in development if flag is set
  if (process.env.SKIP_PROCESSING === 'true' && process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Skipping audio channel detection for: ${url.substring(0, 50)}...`);
    return 2; // Return a mock value of 2 channels (stereo)
  }

  let tempFilePath: string | null = null;

  try {
    // For URLs with query parameters or long URLs, download to temp file first
    if (url.includes('?') || url.length > 500 || url.startsWith('http')) {
      tempFilePath = await downloadToTemp(url);
      url = tempFilePath;

      // Use ffprobe directly on the local file
      const { stdout } = await execAsync(
        `ffprobe -v error -select_streams a:0 -show_entries stream=channels -of csv=p=0 "${url}"`,
      );
      return parseInt(stdout.trim());
    } else {
      // For local files or simple URLs, use the original curl piping approach
      const { stdout } = await execAsync(
        `curl -sL --range 0-65536 "${url}" | ffprobe -v error -select_streams a:0 -show_entries stream=channels -of csv=p=0 -i pipe:0`,
      );
      return parseInt(stdout.trim());
    }
  } catch (error) {
    console.error("Error getting audio channels:", error);

    // For development, return a mock value if flag is set
    if (process.env.IGNORE_PROCESSING_ERRORS === 'true' && process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Ignoring error and returning mock channel count`);
      return 2; // Return a mock value of 2 channels (stereo)
    }

    throw new Error("Failed to get audio channels for url: " + url);
  } finally {
    // Clean up the temp file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log(`Removed temporary file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error(`Failed to remove temporary file: ${tempFilePath}`, cleanupError);
      }
    }
  }
}

/**
 * Gets comprehensive audio metadata
 * @param url URL or path to the audio file
 * @returns Object with audio metadata
 */
export async function getAudioMetadata(url: string): Promise<any> {
  // Skip processing in development if flag is set
  if (process.env.SKIP_PROCESSING === 'true' && process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Skipping audio metadata extraction for: ${url.substring(0, 50)}...`);
    return {
      format: {
        duration: "120",
        bit_rate: "128000",
        size: "1920000"
      },
      streams: [
        {
          codec_type: "audio",
          codec_name: "aac",
          sample_rate: "44100",
          channels: 2,
          channel_layout: "stereo"
        }
      ]
    };
  }

  let tempFilePath: string | null = null;

  try {
    // For URLs with query parameters or long URLs, download to temp file first
    if (url.includes('?') || url.length > 500 || url.startsWith('http')) {
      tempFilePath = await downloadToTemp(url);
      url = tempFilePath;
    }

    // Use ffprobe to get the audio metadata
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_streams -show_format "${url}"`,
    );
    return JSON.parse(stdout);
  } catch (error) {
    console.error("Error getting audio metadata:", error);

    // For development, return mock metadata if flag is set
    if (process.env.IGNORE_PROCESSING_ERRORS === 'true' && process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Ignoring error and returning mock metadata`);
      return {
        format: {
          duration: "120",
          bit_rate: "128000",
          size: "1920000"
        },
        streams: [
          {
            codec_type: "audio",
            codec_name: "aac",
            sample_rate: "44100",
            channels: 2,
            channel_layout: "stereo"
          }
        ]
      };
    }

    throw new Error("Failed to get audio metadata for url: " + url);
  } finally {
    // Clean up the temp file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log(`Removed temporary file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error(`Failed to remove temporary file: ${tempFilePath}`, cleanupError);
      }
    }
  }
}