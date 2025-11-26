import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { createClerkClient } from "@clerk/backend";
import { ENV } from "./env";
import { getUserByClerkId, upsertUserFromClerk } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  clerkUserId: string | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let clerkUserId: string | null = null;

  try {
    // Extrair token do Clerk do header Authorization
    const authHeader = opts.req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      
      // Verificar token com Clerk
      const clerk = createClerkClient({ secretKey: ENV.clerkSecretKey });
      const verifiedToken = await clerk.verifyToken(token, {
        authorizedParties: [ENV.clerkPublishableKey],
      });
      
      if (verifiedToken && verifiedToken.sub) {
        clerkUserId = verifiedToken.sub;
        
        // Buscar ou criar usuário no banco de dados
        let user = await getUserByClerkId(clerkUserId);
        
        if (!user) {
          // Se usuário não existe, buscar dados do Clerk e criar
          const clerkUser = await clerk.users.getUser(clerkUserId);
          user = await upsertUserFromClerk(clerkUser);
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    console.error("Auth error:", error);
    user = null;
    clerkUserId = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user: user ?? null,
    clerkUserId,
  };
}

