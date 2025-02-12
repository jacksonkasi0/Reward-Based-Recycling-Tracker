import { env } from "@/config/env";
import axios from "axios";

export class EmailService {
  private static BASE_URL = env.IMAGE_PROCESS_SERVER_URL;

  /**
   * Sends a success email.
   *
   * @param email - The email address to send to.
   * @param points - The points earned.
   * @returns The response data from the email service.
   */
  public static async sendSuccessEmail(email: string, points: string): Promise<any> {
    try {
      const url = `${this.BASE_URL}/email/send/success/`;
      const payload = { email, points };

      const response = await axios.post(url, payload);
      console.log("✅ Success Email Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error sending success email:", error);
      throw error;
    }
  }

  /**
   * Sends a failure email.
   *
   * @param email - The email address to send to.
   * @returns The response data from the email service.
   */
  public static async sendFailureEmail(email: string): Promise<any> {
    try {
      const url = `${this.BASE_URL}/email/send/failure/`;
      const payload = { email };

      const response = await axios.post(url, payload);
      console.log("✅ Failure Email Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error sending failure email:", error);
      throw error;
    }
  }
}