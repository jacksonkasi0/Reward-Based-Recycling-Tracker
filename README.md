# Reward-Based Recycling Tracker

## Project Details

- **Kotlin Mobile APP - REPO**: <https://github.com/sankarbehera45/recycler-tracker>
- **Python Server - REPO**: <https://github.com/Anusha266/reward-based-recycling-backend-python>

- **API Dog(API document)**: <https://j44cgdu55d.apidog.io/>

- **Edge Server Link**: <https://recycling-server.contentguru.workers.dev/>
- **Python Server**: <https://github.com/Anusha266/reward-based-recycling-backend-python>

- **Bucket:**
  - <https://tigris.dev>
  - <https://cloud.google.com/storage/pricing#cloud-storage-always-free>

---

## **🚀 Project Architecture & Tech Stack Overview**

### **📱 Mobile App**

- **Tech:** Kotlin (Android)
- **Purpose:** Handles user interactions, image uploads, and recycling submissions.
- **Security:** Uses **FingerprintJS** to prevent multiple account fraud from the same device.

---

### **🌐 Backend API (Cloudflare Edge Server)**

- **Framework:** **Hono.js** (Edge-optimized server with TypeScript)
- **API Validation:** **Zod** (Strict request validation)
- **Authentication:** **Better Auth** (JWT-based user authentication)
- **Database ORM:** **Drizzle ORM** (Typed SQL for PostgreSQL)
- **Hosting:** **Cloudflare Edge** (Fast API execution on the edge)

---

### **🗂 Database (PostgreSQL)**

- **Provider:** **Neon DB** (Cloud PostgreSQL with serverless capabilities)
- **ORM:** **Drizzle ORM** (Type-safe DB management)
- **Tables:**
  - `tbl_users` – User accounts & authentication
  - `tbl_recycling_logs` – User recycling activity
  - `tbl_image_hashes` – Stores image hashes to prevent duplicate uploads
  - `tbl_rewards` – Manages reward points & redemption
  - `tbl_user_fingerprint_logs` – Tracks unique device fingerprints & fraud prevention

---

### **📦 Image Storage & Processing**

- **Storage:** **Google Cloud Storage (GCS)**
  - Signed URL generation for **secure uploads**
- **Background Processing:** **Python Server (Leapcell Async Task)**
  - Handles **image hashing, EXIF extraction, fraud detection**.
  - Uses **OpenCV / PIL** for image analysis. 🚧

---

### **📩 Notifications & Email System**

- **Service:** **Twilio SendGrid**
  - **Trigger email notifications for:**
    - Recycling submission success/failure
    - Reward points updates
    - Reminder emails for inactive users

---

### **🛡️ Fraud Prevention**

- **Tech:** **FingerprintJS Pro**
  - **Prevents multiple accounts from the same device** by tracking `visitor_id`.
- **Security Measures:**
  - Prevents **duplicate image uploads** using `tbl_image_hashes`
  - Flags **excessive recycling attempts** using `tbl_user_fingerprint_logs`
  - Detects **VPN & Location Spoofing** (from FingerprintJS API) 🚧

---

### **⚡ Background Task System**

- **Platform:** **Leapcell Async Task**
- **Responsibilities:**
  - Generates **Signed URLs** for Google Cloud Storage.
  - Handles **Image Processing** (Extracting EXIF data, hashing images).
  - Manages **async reward points updates** after successful validation.

---

### **📌 Deployment & Infrastructure**

- **API Hosting:** **Cloudflare Edge (Hono.js)**
- **Database Hosting:** **Neon DB (PostgreSQL)**
- **Background Tasks:** **Leapcell (Async Task)**
- **Storage:** **Google Cloud Storage (S3 Alternative)**

---

### **🔥 Overall System Flow**

1️⃣ **User submits recycling via Mobile App (Kotlin).**  
2️⃣ **Mobile App sends a request to Cloudflare API (Hono.js).**  
3️⃣ **API validates request via Zod & Drizzle ORM (PostgreSQL - Neon DB).**  
4️⃣ **FingerprintJS checks if multiple accounts exist on the same device.**  
5️⃣ **If valid, API triggers a background task in Leapcell Async Runner.**  
6️⃣ **Python Server processes the image & returns validation results.**  
7️⃣ **If unique, Neon DB stores data & updates points in `tbl_users`.**  
8️⃣ **SendGrid triggers email notifications for reward updates.**  
9️⃣ **User gets confirmation & can track points in the mobile app.**

---

### **🚀 Summary**

| **Component**             | **Tech Stack**                               |
| ------------------------- | -------------------------------------------- |
| **Mobile App**            | Kotlin (Android)                             |
| **Fraud Prevention**      | FingerprintJS (Visitor ID Tracking)          |
| **Storage**               | Google Cloud Storage (Signed URLs)           |
| **Emails**                | Twilio SendGrid (Points updates & reminders) |
| **Database**              | Neon DB (PostgreSQL + Drizzle ORM)           |
| **API Layer**             | Cloudflare Edge (Hono.js + Zod)              |
| **Authentication**        | Better Auth (JWT-based)                      |
| **Background Processing** | Leapcell Async Task (Python Server)          |
