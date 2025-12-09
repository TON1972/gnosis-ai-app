/**
 * 🔐 Sistema de Autenticação OAuth Manual
 * GNOSIS AI Platform
 * 
 * OAuth manual sem Passport.js - otimizado para Vercel serverless
 * Suporta: Google OAuth e Facebook OAuth
 */

import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

const router = Router();

// Configurações OAuth
const GOOGLE_CLIENT_ID = process.env.ID_DO_CLIENTE_DO_GOOGLE || process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const FACEBOOK_CLIENT_ID = process.env.ID_DO_CLIENTE_DO_FACEBOOK || process.env.FACEBOOK_CLIENT_ID || "";
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || "";
const CALLBACK_URL_BASE = process.env.NEXTAUTH_URL || "https://gnosis-ai-platform.vercel.app";

interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  loginMethod: string;
}

/**
 * Helper para gerar JWT token
 */
function generateJWT(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    ENV.jwtSecret,
    { expiresIn: "7d" }
  );
}

/**
 * Helper para setar cookie de sessão
 */
function setSessionCookie(res: Response, req: Request, token: string) {
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });
}

/**
 * ============================================
 * GOOGLE OAUTH - MANUAL
 * ============================================
 */

/**
 * GET /api/auth/google
 * Redirecionar para página de login do Google
 */
router.get("/auth/google", (req: Request, res: Response) => {
  console.log("[OAuth] Google login initiated");
  
  const redirectUri = `${CALLBACK_URL_BASE}/api/auth/google/callback`;
  const scope = "openid profile email";
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  res.redirect(googleAuthUrl);
});

/**
 * GET /api/auth/google/callback
 * Callback do Google OAuth
 */
router.get("/auth/google/callback", async (req: Request, res: Response) => {
  console.log("[OAuth] Google callback received");
  
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== "string") {
      console.error("[OAuth] No code received from Google");
      return res.redirect("/auth?error=google");
    }
    
    // Trocar code por access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${CALLBACK_URL_BASE}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    
    if (!tokenResponse.ok) {
      console.error("[OAuth] Failed to exchange code for token");
      return res.redirect("/auth?error=google");
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Buscar informações do usuário
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!userResponse.ok) {
      console.error("[OAuth] Failed to fetch user info");
      return res.redirect("/auth?error=google");
    }
    
    const userData = await userResponse.json();
    const email = userData.email;
    const name = userData.name;
    
    if (!email) {
      console.error("[OAuth] No email returned from Google");
      return res.redirect("/auth?error=google");
    }
    
    // Conectar ao banco de dados
    const db = await getDb();
    if (!db) {
      console.error("[OAuth] Database connection failed");
      return res.redirect("/auth?error=database");
    }
    
    // Verificar se usuário já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    let authUser: AuthUser;
    
    if (existingUser.length > 0) {
      // Usuário existe - atualizar loginMethod se necessário
      const dbUser = existingUser[0];
      if (dbUser.loginMethod !== "google") {
        await db
          .update(users)
          .set({ loginMethod: "google" })
          .where(eq(users.id, dbUser.id));
      }
      
      authUser = {
        id: dbUser.id,
        email: dbUser.email!,
        name: dbUser.name,
        role: dbUser.role,
        loginMethod: "google",
      };
    } else {
      // Criar novo usuário
      const result = await db.insert(users).values({
        email,
        name: name || null,
        role: "user",
        loginMethod: "google",
        password: null, // OAuth não usa senha
      });
      
      authUser = {
        id: Number(result.insertId),
        email,
        name: name || null,
        role: "user",
        loginMethod: "google",
      };
    }
    
    // Gerar token JWT
    const token = generateJWT(authUser);
    
    // Setar cookie
    setSessionCookie(res, req, token);
    
    console.log("[OAuth] Google login successful");
    
    // Redirecionar para dashboard
    res.redirect("/dashboard");
  } catch (error) {
    console.error("[OAuth] Google callback error:", error);
    res.redirect("/auth?error=google");
  }
});

/**
 * ============================================
 * FACEBOOK OAUTH - MANUAL
 * ============================================
 */

/**
 * GET /api/auth/facebook
 * Redirecionar para página de login do Facebook
 */
router.get("/auth/facebook", (req: Request, res: Response) => {
  console.log("[OAuth] Facebook login initiated");
  
  const redirectUri = `${CALLBACK_URL_BASE}/api/auth/facebook/callback`;
  const scope = "email";
  
  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${encodeURIComponent(FACEBOOK_CLIENT_ID)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}`;
  
  res.redirect(facebookAuthUrl);
});

/**
 * GET /api/auth/facebook/callback
 * Callback do Facebook OAuth
 */
router.get("/auth/facebook/callback", async (req: Request, res: Response) => {
  console.log("[OAuth] Facebook callback received");
  
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== "string") {
      console.error("[OAuth] No code received from Facebook");
      return res.redirect("/auth?error=facebook");
    }
    
    // Trocar code por access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${encodeURIComponent(FACEBOOK_CLIENT_ID)}&` +
      `client_secret=${encodeURIComponent(FACEBOOK_CLIENT_SECRET)}&` +
      `redirect_uri=${encodeURIComponent(`${CALLBACK_URL_BASE}/api/auth/facebook/callback`)}&` +
      `code=${encodeURIComponent(code)}`
    );
    
    if (!tokenResponse.ok) {
      console.error("[OAuth] Failed to exchange code for token");
      return res.redirect("/auth?error=facebook");
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Buscar informações do usuário
    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`
    );
    
    if (!userResponse.ok) {
      console.error("[OAuth] Failed to fetch user info");
      return res.redirect("/auth?error=facebook");
    }
    
    const userData = await userResponse.json();
    const email = userData.email;
    const name = userData.name;
    
    if (!email) {
      console.error("[OAuth] No email returned from Facebook");
      return res.redirect("/auth?error=facebook");
    }
    
    // Conectar ao banco de dados
    const db = await getDb();
    if (!db) {
      console.error("[OAuth] Database connection failed");
      return res.redirect("/auth?error=database");
    }
    
    // Verificar se usuário já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    let authUser: AuthUser;
    
    if (existingUser.length > 0) {
      // Usuário existe - atualizar loginMethod se necessário
      const dbUser = existingUser[0];
      if (dbUser.loginMethod !== "facebook") {
        await db
          .update(users)
          .set({ loginMethod: "facebook" })
          .where(eq(users.id, dbUser.id));
      }
      
      authUser = {
        id: dbUser.id,
        email: dbUser.email!,
        name: dbUser.name,
        role: dbUser.role,
        loginMethod: "facebook",
      };
    } else {
      // Criar novo usuário
      const result = await db.insert(users).values({
        email,
        name: name || null,
        role: "user",
        loginMethod: "facebook",
        password: null, // OAuth não usa senha
      });
      
      authUser = {
        id: Number(result.insertId),
        email,
        name: name || null,
        role: "user",
        loginMethod: "facebook",
      };
    }
    
    // Gerar token JWT
    const token = generateJWT(authUser);
    
    // Setar cookie
    setSessionCookie(res, req, token);
    
    console.log("[OAuth] Facebook login successful");
    
    // Redirecionar para dashboard
    res.redirect("/dashboard");
  } catch (error) {
    console.error("[OAuth] Facebook callback error:", error);
    res.redirect("/auth?error=facebook");
  }
});

export { router as oauthRouter };
