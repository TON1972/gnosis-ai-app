import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { getDb } from "./db";
import { users, subscriptions, plans } from "../drizzle/schema";

/**
 * Admin functions for dashboard
 */

export interface UserStats {
  totalUsers: number;
  freeUsers: number;
  paidUsers: number;
}

export interface FinancialDay {
  date: string;
  subscriptionsExpiring: number;
  totalValue: number;
}

export interface DelinquentUser {
  userId: number;
  userName: string;
  userEmail: string;
  planName: string;
  nextBillingDate: Date;
  daysOverdue: number;
  subscriptionValue: number;
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Total users
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(users);
  const totalUsers = Number(totalResult[0]?.count || 0);

  // Free users (users with FREE plan or no active subscription)
  const freeResult = await db
    .select({ count: sql<number>`count(DISTINCT ${users.id})` })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .leftJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      sql`${subscriptions.status} = 'active' AND ${plans.name} = 'free' OR ${subscriptions.id} IS NULL`
    );
  const freeUsers = Number(freeResult[0]?.count || 0);

  // Paid users
  const paidResult = await db
    .select({ count: sql<number>`count(DISTINCT ${users.id})` })
    .from(users)
    .innerJoin(subscriptions, eq(users.id, subscriptions.userId))
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.status, "active"),
        sql`${plans.name} != 'free'`
      )
    );
  const paidUsers = Number(paidResult[0]?.count || 0);

  return {
    totalUsers,
    freeUsers,
    paidUsers,
  };
}

/**
 * Get financial calendar for current month
 */
export async function getFinancialCalendar(): Promise<FinancialDay[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get all subscriptions expiring this month
  const expiringSubscriptions = await db
    .select({
      nextBillingDate: subscriptions.nextBillingDate,
      priceMonthly: plans.priceMonthly,
      priceYearly: plans.priceYearly,
      billingPeriod: subscriptions.billingPeriod,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.status, "active"),
        gte(subscriptions.nextBillingDate, startOfMonth),
        lte(subscriptions.nextBillingDate, endOfMonth),
        sql`${plans.name} != 'free'`
      )
    );

  // Group by date
  const calendar: Record<string, { count: number; total: number }> = {};

  for (const sub of expiringSubscriptions) {
    if (!sub.nextBillingDate) continue;

    const dateKey = sub.nextBillingDate.toISOString().split("T")[0];
    const value =
      sub.billingPeriod === "yearly"
        ? (sub.priceYearly || sub.priceMonthly * 12) / 100
        : sub.priceMonthly / 100;

    if (!calendar[dateKey]) {
      calendar[dateKey] = { count: 0, total: 0 };
    }

    calendar[dateKey].count++;
    calendar[dateKey].total += value;
  }

  // Convert to array
  const result: FinancialDay[] = [];
  for (const [date, data] of Object.entries(calendar)) {
    result.push({
      date,
      subscriptionsExpiring: data.count,
      totalValue: data.total,
    });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get list of delinquent users
 */
export async function getDelinquentUsers(
  startDate?: Date,
  endDate?: Date
): Promise<DelinquentUser[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();

  // Build where conditions
  const conditions = [
    sql`${subscriptions.status} IN ('grace_period', 'blocked')`,
    sql`${plans.name} != 'free'`,
  ];

  if (startDate) {
    conditions.push(gte(subscriptions.nextBillingDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(subscriptions.nextBillingDate, endDate));
  }

  const delinquentSubs = await db
    .select({
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      planName: plans.displayName,
      nextBillingDate: subscriptions.nextBillingDate,
      priceMonthly: plans.priceMonthly,
      priceYearly: plans.priceYearly,
      billingPeriod: subscriptions.billingPeriod,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(and(...conditions))
    .orderBy(desc(subscriptions.nextBillingDate));

  return delinquentSubs.map((sub) => {
    const daysOverdue = sub.nextBillingDate
      ? Math.floor(
          (now.getTime() - sub.nextBillingDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    const subscriptionValue =
      sub.billingPeriod === "yearly"
        ? (sub.priceYearly || sub.priceMonthly * 12) / 100
        : sub.priceMonthly / 100;

    return {
      userId: sub.userId,
      userName: sub.userName || "Sem nome",
      userEmail: sub.userEmail || "Sem email",
      planName: sub.planName,
      nextBillingDate: sub.nextBillingDate || new Date(),
      daysOverdue,
      subscriptionValue,
    };
  });
}

