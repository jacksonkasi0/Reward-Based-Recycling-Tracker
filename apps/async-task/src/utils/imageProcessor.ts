// Import 3rd-party
import axios from "axios";

// Import config
import { env } from "@/config/env";

/**
 * Calls the image processing server API to process an image.
 *
 * @param imageUrl - The image URL to be processed.
 * @returns Promise resolving to processed image data.
 */
export async function processImage(imageUrl: string): Promise<{
  image_hash: string;
  exif_timestamp?: string | null;
  exif_gps_location?: string | null;
}> {
  try {
    const response = await axios.post(`${env.IMAGE_PROCESS_SERVER_URL}/api/process-image/`, {
      image_url: imageUrl,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error processing image:", error);
    throw new Error("Failed to process image. Please try again.");
  }
}
