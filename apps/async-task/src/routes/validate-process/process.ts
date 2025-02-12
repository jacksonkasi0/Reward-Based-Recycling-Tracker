import { Hono } from "hono";

// Import config
import { env } from "@/config/env";

// Import 3rd-party
import { zValidator } from "@hono/zod-validator";

// Import db/schema
import { eq } from "@repo/db";
import { getDb } from "@repo/db";
import { tbl_users, tbl_image_hashes, tbl_recycling_logs, tbl_user_fingerprint_logs } from "@repo/db";

// Import middleware
import { authMiddleware } from "@/middleware/jwt-auth";

// Import types
import type { JWTPayload } from "@repo/jwt";

// Import Image Processor Utility
import { processImage } from "@/utils/imageProcessor";
import { EmailService } from "@/utils/email-services";

// Import validation schema
import { validationSchema } from "@/validation/process";

const route = new Hono<{ Variables: { user: JWTPayload } }>();

// API route with authentication and validation
route.post(
  "/",
  authMiddleware,
  zValidator("json", validationSchema),
  async (c) => {
    const user = c.get("user") as JWTPayload;
    const data = await c.req.valid("json");

    const db = getDb(env.DATABASE_URL);

    try {
      // **Step 1: Check if User Exists**
      const users = await db
        .select({ id: tbl_users.id, points: tbl_users.points })
        .from(tbl_users)
        .where(eq(tbl_users.id, user.sub));

      if (users.length === 0) {
        return c.json({ error: "User not found" }, 404);
      }

      const userData = users[0];

      // **Step 2: Process Image & Get Image Hash**
      const processedImage = await processImage(data.image_url);
      let { image_hash, exif_timestamp, exif_gps_location } = processedImage;

      // **Step 3: Check for Duplicates**
      const existingImage = await db
        .select({ id: tbl_image_hashes.id })
        .from(tbl_image_hashes)
        .where(eq(tbl_image_hashes.image_hash, image_hash));

      if (existingImage.length > 0) {
        await EmailService.sendFailureEmail(user.email);
        return c.json({ error: "Duplicate image detected" }, 409);
      }

      // **Step 4: Insert New Image Hash**
      const [newImage] = await db
        .insert(tbl_image_hashes)
        .values({
          image_hash,
          image_url: data.image_url,
          created_at: new Date(),
        })
        .returning({ id: tbl_image_hashes.id });

      exif_timestamp = exif_timestamp ? new Date(exif_timestamp).toISOString() : null;

      // **Step 5: Insert Recycling Log**
      await db.insert(tbl_recycling_logs).values({
        user_id: user.sub,
        item_type: data.item_type,
        image_hash_id: newImage.id,
        exif_timestamp: exif_timestamp ? new Date(exif_timestamp) : new Date(),
        exif_gps_location: exif_gps_location || "Unknown",
        status: "Completed",
        created_at: new Date(),
      });

      // **Step 6: Update User Points**
      const updatedPoints = userData.points + 10;
      await db
        .update(tbl_users)
        .set({ points: updatedPoints })
        .where(eq(tbl_users.id, user.sub));

      // **Step 7: Log User Fingerprint for Fraud Prevention**
      const existingFingerprint = await db
        .select({ visitor_id: tbl_user_fingerprint_logs.visitor_id, submission_count: tbl_user_fingerprint_logs.submission_count })
        .from(tbl_user_fingerprint_logs)
        .where(eq(tbl_user_fingerprint_logs.visitor_id, data.visitor_id));

      if (existingFingerprint.length > 0) {
        await db
          .update(tbl_user_fingerprint_logs)
          .set({
            submission_count: existingFingerprint[0].submission_count + 1,
            last_submission_at: new Date(),
          })
          .where(eq(tbl_user_fingerprint_logs.visitor_id, data.visitor_id));
      } else {
        await db.insert(tbl_user_fingerprint_logs).values({
          visitor_id: data.visitor_id,
          user_id: user.sub,
          device_info: data.device_info,
          ip_address: data.ip_address,
          ip_location: data.ip_location,
          submission_count: 1,
          last_submission_at: new Date(),
          flagged: false,
        });
      }

      // **Step 8: Send Success Email**
      await EmailService.sendSuccessEmail(user.email, updatedPoints);

      return c.json({
        message: "Image processed & recycling log created",
        new_points: updatedPoints,
      });

    } catch (error: any) {
      console.error("❌ API Error:", error);

      // Send failure email
      await EmailService.sendFailureEmail(user.email);

      return c.json({ error: "Processing failed", details: error.message }, 500);
    }
  }
);

export default route;