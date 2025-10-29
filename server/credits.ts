import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { userCredits, creditTransactions, subscriptions, plans } from "../drizzle/schema";

/**
 * Credit system for GNOSIS AI
 * 
 * Three types of credits:
 * 1. Initial credits: Cumulative, 30-day validity (from subscription/renewal)
 * 2. Daily credits: Non-cumulative, reset daily
 * 3. Bonus credits: Purchased separately, permanent (never expire)
 */

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let credits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

  if (credits.length === 0) {
    // Initialize credits for new user
    // Get user's plan to set initial credits
    const userPlan = await getUserActivePlan(userId);
    const initialCredits = userPlan?.plan.creditsInitial || 500; // Default FREE plan
    const dailyCredits = userPlan?.plan.creditsDaily || 50; // Default FREE plan
    const expiryDate = new Date(Date.now() + THIRTY_DAYS_MS);
    
    await db.insert(userCredits).values({
      userId,
      creditsInitial: initialCredits,
      creditsDaily: dailyCredits,
      creditsBonus: 0,
      creditsInitialExpiry: expiryDate,
      lastDailyReset: new Date(),
    });
    
    // Log initial credit grant
    await db.insert(creditTransactions).values({
      userId,
      amount: initialCredits,
      type: "initial",
      description: `Initial credits for new user (${userPlan?.plan.displayName || "FREE"} plan)`,
    });
    
    credits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
  }

  const userCredit = credits[0];

  // Check if initial credits expired
  let initialCredits = userCredit.creditsInitial;
  if (userCredit.creditsInitialExpiry && new Date() > userCredit.creditsInitialExpiry) {
    initialCredits = 0;
  }

  // Check if daily credits need reset
  const now = new Date();
  const lastReset = new Date(userCredit.lastDailyReset);
  const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (24 * 60 * 60 * 1000));

  console.log('[Credits Debug]', {
    userId,
    now: now.toISOString(),
    lastReset: lastReset.toISOString(),
    daysSinceReset,
    currentDaily: userCredit.creditsDaily,
  });

  let dailyCredits = userCredit.creditsDaily;
  if (daysSinceReset >= 1) {
    // Reset daily credits based on user's plan
    const userSub = await getUserActivePlan(userId);
    console.log('[Credits Debug] User subscription:', userSub ? { planName: userSub.plan.displayName, dailyCredits: userSub.plan.creditsDaily } : 'null');
    if (userSub) {
      dailyCredits = userSub.plan.creditsDaily;
      await db.update(userCredits)
        .set({
          creditsDaily: dailyCredits,
          lastDailyReset: now,
        })
        .where(eq(userCredits.userId, userId));
      console.log('[Credits Debug] Daily credits renewed:', dailyCredits);
    } else {
      console.log('[Credits Debug] No active subscription found, setting daily credits to 0');
      dailyCredits = 0;
    }
  }

  // Convert to numbers to ensure correct types
  const initial = Number(initialCredits) || 0;
  const daily = Number(dailyCredits) || 0;
  const bonus = Number(userCredit.creditsBonus) || 0;

  return {
    initial,
    daily,
    bonus,
    total: initial + daily + bonus,
    initialExpiry: userCredit.creditsInitialExpiry,
  };
}

/**
 * Get user's active subscription and plan details
 */
export async function getUserActivePlan(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get active subscription
  const subs = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1);

  console.log('[getUserActivePlan] Active subscription:', subs);

  if (subs.length === 0) {
    console.log('[getUserActivePlan] No active subscription found');
    return null;
  }

  const subscription = subs[0];

  // Get plan details
  const planResults = await db
    .select()
    .from(plans)
    .where(eq(plans.id, subscription.planId))
    .limit(1);

  console.log('[getUserActivePlan] Plan query result:', planResults);

  if (planResults.length === 0) {
    console.log('[getUserActivePlan] Plan not found for planId:', subscription.planId);
    return null;
  }

  return {
    subscription,
    plan: planResults[0],
  };
}

/**
 * Use credits for a tool
 * Priority: daily credits -> initial credits -> bonus credits
 */
export async function useCredits(userId: number, amount: number, toolName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const credits = await getUserCredits(userId);

  if (credits.total < amount) {
    return {
      success: false,
      error: "Insufficient credits",
      remaining: credits.total,
    };
  }

  let remaining = amount;
  const updates: Partial<typeof userCredits.$inferInsert> = {};

  // Use daily credits first
  if (credits.daily > 0 && remaining > 0) {
    const dailyUsed = Math.min(credits.daily, remaining);
    updates.creditsDaily = credits.daily - dailyUsed;
    remaining -= dailyUsed;

    await db.insert(creditTransactions).values({
      userId,
      amount: -dailyUsed,
      type: "usage",
      description: `Used daily credits for ${toolName}`,
      toolUsed: toolName,
    });
  }

  // Then use initial credits
  if (credits.initial > 0 && remaining > 0) {
    const initialUsed = Math.min(credits.initial, remaining);
    updates.creditsInitial = credits.initial - initialUsed;
    remaining -= initialUsed;

    await db.insert(creditTransactions).values({
      userId,
      amount: -initialUsed,
      type: "usage",
      description: `Used initial credits for ${toolName}`,
      toolUsed: toolName,
    });
  }

  // Finally use bonus credits
  if (credits.bonus > 0 && remaining > 0) {
    const bonusUsed = Math.min(credits.bonus, remaining);
    updates.creditsBonus = credits.bonus - bonusUsed;
    remaining -= bonusUsed;

    await db.insert(creditTransactions).values({
      userId,
      amount: -bonusUsed,
      type: "usage",
      description: `Used bonus credits for ${toolName}`,
      toolUsed: toolName,
    });
  }

  // Update user credits
  await db.update(userCredits)
    .set(updates)
    .where(eq(userCredits.userId, userId));

  const newCredits = await getUserCredits(userId);

  return {
    success: true,
    remaining: newCredits.total,
    used: amount,
  };
}

/**
 * Grant initial credits when user subscribes or renews
 */
export async function grantInitialCredits(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiry = new Date(Date.now() + THIRTY_DAYS_MS);

  const existing = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

  if (existing.length === 0) {
    await db.insert(userCredits).values({
      userId,
      creditsInitial: amount,
      creditsInitialExpiry: expiry,
      creditsDaily: 0,
      creditsBonus: 0,
      lastDailyReset: new Date(),
    });
  } else {
    // Add to existing initial credits and extend expiry
    await db.update(userCredits)
      .set({
        creditsInitial: existing[0].creditsInitial + amount,
        creditsInitialExpiry: expiry,
      })
      .where(eq(userCredits.userId, userId));
  }

  await db.insert(creditTransactions).values({
    userId,
    amount,
    type: "initial",
    description: "Initial credits granted from subscription",
  });

  return await getUserCredits(userId);
}

/**
 * Grant bonus credits (purchased separately, permanent)
 */
export async function grantBonusCredits(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

  if (existing.length === 0) {
    await db.insert(userCredits).values({
      userId,
      creditsInitial: 0,
      creditsDaily: 0,
      creditsBonus: amount,
      lastDailyReset: new Date(),
    });
  } else {
    await db.update(userCredits)
      .set({
        creditsBonus: existing[0].creditsBonus + amount,
      })
      .where(eq(userCredits.userId, userId));
  }

  await db.insert(creditTransactions).values({
    userId,
    amount,
    type: "bonus",
    description: "Bonus credits purchased",
  });

  return await getUserCredits(userId);
}

/**
 * Initialize FREE plan credits for new user
 */
export async function initializeFreeUserCredits(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // FREE plan: 500 initial (non-renewable after 30 days) + 50 daily
  const expiry = new Date(Date.now() + THIRTY_DAYS_MS);

  await db.insert(userCredits).values({
    userId,
    creditsInitial: 500,
    creditsInitialExpiry: expiry,
    creditsDaily: 50,
    creditsBonus: 0,
    lastDailyReset: new Date(),
  });

  await db.insert(creditTransactions).values({
    userId,
    amount: 500,
    type: "initial",
    description: "Initial FREE plan credits",
  });

  return await getUserCredits(userId);
}

