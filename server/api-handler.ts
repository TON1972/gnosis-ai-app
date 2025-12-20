import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers.ts";
import { createContext } from "./_core/context.ts";
import cors from "cors";
import { configurePassport } from "./_core/passport";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema.ts";
import { getDb } from "./db.ts";

const app = express();

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// tRPC middleware
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check
app.get("/api/health", (req: any, res: any) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Passport.js routes.
configurePassport(app);

// Register route.
app.post('/api/register', async (req, res, next) => {
  const db = await getDb();
  if (!db) throw new Error("Database not available.");

  const [result] = await db
    .insert(users)
    .values({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
    })
    .$returningId();

  const [newUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, result.id))
    .limit(1);

  req.login(newUser, (err) => {
    if (err) return next(err);
    return res.json({ success: true });
  });
});

// Export for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}

