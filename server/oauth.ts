/**
 * 🔐 OAuth Integration - Google & Facebook
 * GNOSIS AI Platform
 * 
 * Integração OAuth usando Passport.js
 * Compatível com o sistema Gnosis.log existente
 */

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Request, Response, NextFunction, Router } from "express";
import jwt from "jsonwebtoken";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";

const router = Router();

// Configurações OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || "";
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || "";
const CALLBACK_URL_BASE = process.env.NEXTAUTH_URL || "https://gnosis-ai-platform.vercel.app";

interface OAuthUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  loginMethod: string;
}

/**
 * Configurar Google OAuth Strategy
 */
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${CALLBACK_URL_BASE}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          if (!email) {
            return done(new Error("Email não fornecido pelo Google"));
          }

          const db = await getDb();
          if (!db) {
            return done(new Error("Erro ao conectar ao banco de dados"));
          }

          // Verificar se usuário já existe
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          let user: OAuthUser;

          if (existingUser.length > 0) {
            // Usuário existe - atualizar loginMethod se necessário
            const dbUser = existingUser[0];
            if (dbUser.loginMethod !== "google") {
              await db
                .update(users)
                .set({ loginMethod: "google" })
                .where(eq(users.id, dbUser.id));
            }

            user = {
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

            const userId = Number((result as any).insertId);

            user = {
              id: userId,
              email,
              name: name || null,
              role: "user",
              loginMethod: "google",
            };
          }

          return done(null, user);
        } catch (error) {
          console.error("[OAuth] Erro no Google Strategy:", error);
          return done(error);
        }
      }
    )
  );
}

/**
 * Configurar Facebook OAuth Strategy
 */
if (FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: `${CALLBACK_URL_BASE}/api/auth/facebook/callback`,
        profileFields: ["id", "displayName", "emails"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          if (!email) {
            return done(new Error("Email não fornecido pelo Facebook"));
          }

          const db = await getDb();
          if (!db) {
            return done(new Error("Erro ao conectar ao banco de dados"));
          }

          // Verificar se usuário já existe
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          let user: OAuthUser;

          if (existingUser.length > 0) {
            // Usuário existe - atualizar loginMethod se necessário
            const dbUser = existingUser[0];
            if (dbUser.loginMethod !== "facebook") {
              await db
                .update(users)
                .set({ loginMethod: "facebook" })
                .where(eq(users.id, dbUser.id));
            }

            user = {
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

            const userId = Number((result as any).insertId);

            user = {
              id: userId,
              email,
              name: name || null,
              role: "user",
              loginMethod: "facebook",
            };
          }

          return done(null, user);
        } catch (error) {
          console.error("[OAuth] Erro no Facebook Strategy:", error);
          return done(error);
        }
      }
    )
  );
}

// Serialização do usuário (necessário para Passport)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

/**
 * Rota: Iniciar login com Google
 */
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

/**
 * Rota: Callback do Google
 */
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth?error=google" }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as OAuthUser;

      // Gerar token JWT (compatível com Gnosis.log)
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        ENV.jwtSecret,
        { expiresIn: "7d" }
      );

      // Redirecionar para o frontend com o token
      res.redirect(`/?token=${token}`);
    } catch (error) {
      console.error("[OAuth] Erro no callback do Google:", error);
      res.redirect("/auth?error=google");
    }
  }
);

/**
 * Rota: Iniciar login com Facebook
 */
router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"], session: false }));

/**
 * Rota: Callback do Facebook
 */
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/auth?error=facebook" }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as OAuthUser;

      // Gerar token JWT (compatível com Gnosis.log)
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        ENV.jwtSecret,
        { expiresIn: "7d" }
      );

      // Redirecionar para o frontend com o token
      res.redirect(`/?token=${token}`);
    } catch (error) {
      console.error("[OAuth] Erro no callback do Facebook:", error);
      res.redirect("/auth?error=facebook");
    }
  }
);

export { router as oauthRouter };
