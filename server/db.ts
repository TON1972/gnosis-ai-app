import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, plans, tools, planTools, subscriptions } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    // Always set owner as super_admin
    if (user.openId === ENV.ownerOpenId) {
      values.role = 'super_admin';
      updateSet.role = 'super_admin'; // Always update to super_admin
    } else if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    const result = await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // Check if this is a new user (insert happened)
    if (result[0].affectedRows > 0) {
      // Get the user to find their ID
      const newUser = await getUserByOpenId(user.openId);
      if (newUser) {
        // Check if user already has a subscription
        const existingSub = await db.select().from(subscriptions)
          .where(eq(subscriptions.userId, newUser.id))
          .limit(1);
        
        if (existingSub.length === 0) {
          // Get FREE plan ID
          const freePlan = await db.select().from(plans)
            .where(eq(plans.name, "free"))
            .limit(1);
          
          if (freePlan.length > 0) {
            // Create FREE subscription for new user
            await db.insert(subscriptions).values({
              userId: newUser.id,
              planId: freePlan[0].id,
              status: "active",
            });
            console.log(`[Database] Created FREE subscription for new user ${newUser.id}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all available plans
 */
export async function getAllPlans() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(plans).where(eq(plans.isActive, true));
}

/**
 * Get plan by ID
 */
export async function getPlanById(planId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Get all tools for a specific plan
 */
export async function getToolsForPlan(planId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ tool: tools })
    .from(planTools)
    .innerJoin(tools, eq(planTools.toolId, tools.id))
    .where(eq(planTools.planId, planId));

  return result.map(r => r.tool);
}

/**
 * Get all tools
 */
export async function getAllTools() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tools).where(eq(tools.isActive, true));
}

