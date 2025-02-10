// src/routes/auth/login.ts

import { Hono } from "hono";

// Import 3rd-party
import { eq } from "drizzle-orm";

// Import db/schema
import { getDb } from "@repo/db";
import { tbl_users } from "@repo/db";

// Import utils
import { verifyPassword, signJWT } from "@/utils/auth";

// Import types
import type { Env } from "@/types/common";
import type { JWTPayload } from "@/types/auth";

const loginRoute = new Hono<{ Bindings: Env }>();

loginRoute.post("/", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;
  if (!email || !password) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const db = getDb(c.env.DATABASE_URL);
  const users = await db
    .select()
    .from(tbl_users)
    .where(eq(tbl_users.email, email));
  if (users.length === 0) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const user = users[0];
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  
  // Create a JWT token (expires in 30 days).
  const tokenPayload: JWTPayload = {
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days in seconds
  };

  const token = await signJWT(tokenPayload, c.env.JWT_SECRET);
  return c.json({ message: "Login successful", token });
});

export default loginRoute;
