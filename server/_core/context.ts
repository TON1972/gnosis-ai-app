import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifyToken } from "./sdk";
import { getUserByOpenId, upsertUser } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authHeader = (opts.req as any).headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = await verifyToken(token);
      
      if (payload?.openId) {
        user = (await getUserByOpenId(payload.openId)) ?? null;
        
        if (!user) {
          // Criar usuário se não existir
          await upsertUser({
            openId: payload.openId,
            name: payload.name || null,
            email: (payload as any).email || null,
            loginMethod: (payload as any).loginMethod || null,
            lastSignedIn: new Date(),
          });
          user = (await getUserByOpenId(payload.openId)) ?? null;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    console.error("Auth error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user: user ?? null,
  };
}

