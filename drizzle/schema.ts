import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "super_admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Plans table - defines subscription tiers
 */
export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  priceMonthly: int("priceMonthly").notNull(), // in cents (R$ 18,98 = 1898)
  priceYearly: int("priceYearly").notNull(), // in cents with 16.6% discount
  creditsInitial: int("creditsInitial").notNull(), // cumulative credits with 30-day validity
  creditsDaily: int("creditsDaily").notNull(), // non-cumulative daily credits
  toolsCount: int("toolsCount").notNull(), // number of tools available
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

/**
 * User subscriptions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "grace_period", "blocked"]).default("active").notNull(),
  billingPeriod: mysqlEnum("billingPeriod", ["monthly", "yearly"]).default("monthly").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"), // for tracking subscription period
  nextBillingDate: timestamp("nextBillingDate"), // when next payment is due
  gracePeriodEndsAt: timestamp("gracePeriodEndsAt"), // 24h after payment due
  lastPaymentDate: timestamp("lastPaymentDate"), // last successful payment
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * User credits tracking
 */
export const userCredits = mysqlTable("userCredits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  creditsInitial: int("creditsInitial").default(0).notNull(), // cumulative with expiry
  creditsInitialExpiry: timestamp("creditsInitialExpiry"), // 30 days from grant
  creditsDaily: int("creditsDaily").default(0).notNull(), // reset daily
  creditsBonus: int("creditsBonus").default(0).notNull(), // purchased credits (permanent)
  lastDailyReset: timestamp("lastDailyReset").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserCredits = typeof userCredits.$inferSelect;
export type InsertUserCredits = typeof userCredits.$inferInsert;

/**
 * Credit transactions log
 */
export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // negative for usage, positive for grants
  type: mysqlEnum("type", ["initial", "daily", "bonus", "usage"]).notNull(),
  description: text("description"),
  toolUsed: varchar("toolUsed", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Tools/Features available in the platform
 */
export const tools = mysqlTable("tools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("displayName", { length: 150 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;

/**
 * Plan-Tool relationship (which tools are available in each plan)
 */
export const planTools = mysqlTable("planTools", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  toolId: int("toolId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlanTool = typeof planTools.$inferSelect;
export type InsertPlanTool = typeof planTools.$inferInsert;


/**
 * Saved studies generated by users
 */
export const savedStudies = mysqlTable("savedStudies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  toolName: varchar("toolName", { length: 100 }).notNull(),
  input: text("input").notNull(), // User's input/question
  output: text("output").notNull(), // Generated study content
  creditCost: int("creditCost").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedStudy = typeof savedStudies.$inferSelect;
export type InsertSavedStudy = typeof savedStudies.$inferInsert;

/**
 * Chatbot contact requests - stores user contact info before transferring to support
 */
export const chatbotContacts = mysqlTable("chatbotContacts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  department: mysqlEnum("department", ["tecnico", "financeiro", "comercial", "outros"]).notNull(),
  message: text("message"), // Optional message from user
  status: mysqlEnum("status", ["pending", "contacted", "resolved"]).default("pending").notNull(),
  assignedTo: int("assignedTo"), // User ID of assigned admin
  archived: boolean("archived").default(false).notNull(), // Hide resolved tickets from main view
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatbotContact = typeof chatbotContacts.$inferSelect;
export type InsertChatbotContact = typeof chatbotContacts.$inferInsert;

/**
 * Ticket messages - stores conversation history between admin and client
 */
export const ticketMessages = mysqlTable("ticketMessages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(), // References chatbotContacts.id
  senderId: int("senderId"), // User ID if admin, null if client
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderType: mysqlEnum("senderType", ["admin", "client"]).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(), // 0 = unread, 1 = read
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

