/**
 * 🔐 Sistema de Autenticação Completo - Passport.js
 * GNOSIS AI Platform
 * 
 * Suporta 3 métodos de autenticação:
 * 1. Email/Senha (passport-local)
 * 2. Google OAuth (passport-google-oauth20)
 * 3. Facebook OAuth (passport-facebook)
 */

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Request, Response, NextFunction, Router } from "express";
import bcrypt from "bcryptjs";
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
const SALT_ROUNDS = 10;

interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  loginMethod: string;
}

/**
 * ============================================
 * PASSPORT LOCAL STRATEGY (Email/Senha)
 * ============================================
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const db = await getDb();
        if (!db) {
          return done(new Error("Erro ao conectar ao banco de dados"));
        }

        // Buscar usuário por email
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (userResult.length === 0) {
          return done(null, false, { message: "Email ou senha incorretos" });
        }

        const user = userResult[0];

        // Verificar se usuário tem senha (pode ter sido criado via OAuth)
        if (!user.password) {
          return done(null, false, { message: "Esta conta foi criada via Google ou Facebook. Use o botão correspondente para entrar." });
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return done(null, false, { message: "Email ou senha incorretos" });
        }

        // Autenticação bem-sucedida
        const authUser: AuthUser = {
          id: user.id,
          email: user.email!,
          name: user.name,
          role: user.role,
          loginMethod: "email",
        };

        return done(null, authUser);
      } catch (error) {
        console.error("[Passport Local] Erro:", error);
        return done(error);
      }
    }
  )
);

/**
 * ============================================
 * GOOGLE OAUTH STRATEGY
 * ============================================
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

            const userId = Number((result as any).insertId);

            authUser = {
              id: userId,
              email,
              name: name || null,
              role: "user",
              loginMethod: "google",
            };
          }

          return done(null, authUser);
        } catch (error) {
          console.error("[Google OAuth] Erro:", error);
          return done(error);
        }
      }
    )
  );
}

/**
 * ============================================
 * FACEBOOK OAUTH STRATEGY
 * ============================================
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

            const userId = Number((result as any).insertId);

            authUser = {
              id: userId,
              email,
              name: name || null,
              role: "user",
              loginMethod: "facebook",
            };
          }

          return done(null, authUser);
        } catch (error) {
          console.error("[Facebook OAuth] Erro:", error);
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
 * ROTAS DE AUTENTICAÇÃO
 * ============================================
 */

/**
 * POST /api/auth/register
 * Cadastro com email/senha
 */
router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validações
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, senha e nome são obrigatórios",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "A senha deve ter no mínimo 6 caracteres",
      });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        message: "Erro ao conectar ao banco de dados",
      });
    }

    // Verificar se email já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email já cadastrado",
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Criar usuário
    const result = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name || null,
      role: "user",
      loginMethod: "email",
    });

    const userId = Number((result as any).insertId);

    // Gerar token JWT
    const token = generateJWT({
      id: userId,
      email,
      name: name || null,
      role: "user",
      loginMethod: "email",
    });

    // Setar cookie
    setSessionCookie(res, req, token);

    return res.json({
      success: true,
      message: "Cadastro realizado com sucesso",
      user: {
        id: userId,
        email,
        name: name || null,
        role: "user",
      },
    });
  } catch (error) {
    console.error("[Register] Erro:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao criar conta. Tente novamente.",
    });
  }
});

/**
 * POST /api/auth/login
 * Login com email/senha
 */
router.post("/auth/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", { session: false }, (err: any, user: AuthUser | false, info: any) => {
    if (err) {
      console.error("[Login] Erro:", err);
      return res.status(500).json({
        success: false,
        message: "Erro ao fazer login. Tente novamente.",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Email ou senha incorretos",
      });
    }

    // Gerar token JWT
    const token = generateJWT(user);

    // Setar cookie
    setSessionCookie(res, req, token);

    return res.json({
      success: true,
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  })(req, res, next);
});

/**
 * GET /api/auth/google
 * Iniciar login com Google
 */
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

/**
 * GET /api/auth/google/callback
 * Callback do Google
 */
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth?error=google" }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as AuthUser;

      // Gerar token JWT
      const token = generateJWT(user);

      // Setar cookie
      setSessionCookie(res, req, token);

      // Redirecionar para dashboard
      res.redirect("/dashboard");
    } catch (error) {
      console.error("[Google Callback] Erro:", error);
      res.redirect("/auth?error=google");
    }
  }
);

/**
 * GET /api/auth/facebook
 * Iniciar login com Facebook
 */
router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"], session: false }));

/**
 * GET /api/auth/facebook/callback
 * Callback do Facebook
 */
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/auth?error=facebook" }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as AuthUser;

      // Gerar token JWT
      const token = generateJWT(user);

      // Setar cookie
      setSessionCookie(res, req, token);

      // Redirecionar para dashboard
      res.redirect("/dashboard");
    } catch (error) {
      console.error("[Facebook Callback] Erro:", error);
      res.redirect("/auth?error=facebook");
    }
  }
);

export { router as oauthRouter };
