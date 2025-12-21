import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { ENV } from "./_core/env.ts";
import { appRouter } from "./routers.ts";
import { createContext } from "./_core/context.ts";
import cors from "cors";
import { configurePassport } from "./_core/passport";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema.ts";
import { getDb } from "./db.ts";
import { createClient } from "redis";
import session from "express-session";
import { RedisStore } from "connect-redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch(console.error);
const redisStore = new RedisStore({ client: redisClient });

const app = express();

app.set('trust proxy', 1);

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Configure session.
app.use(session({
  store: redisStore,
  secret: ENV.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: ENV.cookieSecure,
    httpOnly: true,
    maxAge: ENV.cookieMaxAge,
  },
}));

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

app.get('/api/test', async (req, res, next) => {
  next(new Error('Test error'));
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

