import "dotenv/config";
import bcrypt from "bcrypt";
import cors from "cors";
import { eq } from "drizzle-orm";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { users } from "../../drizzle/schema.ts";
import { getDb } from "../db.ts";
import { ENV } from "./env";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { configurePassport } from "./passport";
import { serveStatic, setupVite } from "./vite";
import { handleMercadoPagoWebhook } from "./webhookHandler";
import session from "express-session";

const app = express();

// Configure CORS to allow credentials (cookies)
app.use(cors({
  origin: true, // Allow all origins in development, configure for production
  credentials: true, // CRITICAL: Allow cookies to be sent
}));

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rota de teste da Vercel
app.get('/api/dev', (req, res) => {
  return 'Funciona!';
});

// Configure session.
app.use(session({
  secret: ENV.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: ENV.cookieSecure,
    httpOnly: true,
    maxAge: ENV.cookieMaxAge,
  },
}));

// OAuth callback under /api/oauth/callback (Manus OAuth)
registerOAuthRoutes(app);

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

// Mercado Pago webhook
app.post("/api/webhooks/mercadopago", handleMercadoPagoWebhook);
// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);
// development mode uses Vite, production mode uses static files
if (process.env.NODE_ENV === "development") {
  const server = createServer(app);
  setupVite(app, server);
} else {
  serveStatic(app);
}

export default app;
