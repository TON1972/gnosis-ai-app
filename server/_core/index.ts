import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleMercadoPagoWebhook } from "./webhookHandler";

const app = express();

// Configure CORS to allow credentials (cookies)
app.use(cors({
  origin: true, // Allow all origins in development, configure for production
  credentials: true, // CRITICAL: Allow cookies to be sent
}));

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth callback under /api/oauth/callback (Manus OAuth)
// registerOAuthRoutes(app);

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
