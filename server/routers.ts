import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getAllPlans, getToolsForPlan, getAllTools } from "./db";
import { getUserCredits, useCredits, getUserActivePlan } from "./credits";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  plans: router({
    /**
     * Get all available plans
     */
    list: publicProcedure.query(async () => {
      return await getAllPlans();
    }),

    /**
     * Get tools for a specific plan
     */
    getTools: publicProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        return await getToolsForPlan(input.planId);
      }),
  }),

  tools: router({
    /**
     * Get all tools
     */
    list: publicProcedure.query(async () => {
      return await getAllTools();
    }),
  }),

  credits: router({
    /**
     * Get current user's credit balance
     */
    balance: protectedProcedure.query(async ({ ctx }) => {
      return await getUserCredits(ctx.user.id);
    }),

    /**
     * Get user's active plan
     */
    activePlan: protectedProcedure.query(async ({ ctx }) => {
      return await getUserActivePlan(ctx.user.id);
    }),

    /**
     * Use credits for a tool
     */
    use: protectedProcedure
      .input(z.object({
        amount: z.number().positive(),
        toolName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await useCredits(ctx.user.id, input.amount, input.toolName);
      }),
  }),
});

export type AppRouter = typeof appRouter;

