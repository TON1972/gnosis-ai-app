/**
 * 🔐 NextAuth.js Configuration
 * OAuth Google e Facebook otimizado para Vercel Serverless
 */

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: ENV.googleClientId,
      clientSecret: ENV.googleClientSecret,
    }),
    FacebookProvider({
      clientId: ENV.facebookClientId,
      clientSecret: ENV.facebookClientSecret,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        const db = await getDb();
        if (!db) {
          console.error("[NextAuth] Database not available");
          return false;
        }

        const provider = account?.provider || "unknown";
        const openId = `${provider}:${user.email}`;

        // Verificar se usuário já existe
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.openId, openId))
          .limit(1)
          .then((rows) => rows[0]);

        if (!existingUser) {
          // Criar novo usuário
          await db.insert(users).values({
            openId,
            email: user.email || null,
            name: user.name || null,
            role: "user",
            loginMethod: provider,
          });
        } else {
          // Atualizar lastSignedIn
          await db
            .update(users)
            .set({ lastSignedIn: new Date() })
            .where(eq(users.openId, openId));
        }

        return true;
      } catch (error) {
        console.error("[NextAuth] Sign in error:", error);
        return false;
      }
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        try {
          const db = await getDb();
          if (!db) return session;

          // Buscar usuário no banco
          const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.email, session.user.email!))
            .limit(1)
            .then((rows) => rows[0]);

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.role = dbUser.role;
          }
        } catch (error) {
          console.error("[NextAuth] Session error:", error);
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: ENV.jwtSecret,
};

export default NextAuth(authOptions);
