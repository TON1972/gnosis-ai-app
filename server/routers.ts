import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getAllPlans, getToolsForPlan, getAllTools } from "./db";
import { getUserCredits, useCredits, getUserActivePlan } from "./credits";
import { createSubscriptionCheckout, createCreditsCheckout } from "./mercadopago";
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

    /**
     * Generate content using a tool
     */
    generate: protectedProcedure
      .input(z.object({
        toolId: z.string(),
        input: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        // Tool-specific prompts
        const toolPrompts: Record<string, string> = {
          hermeneutica: "Você é um especialista em hermenêutica bíblica. Analise o contexto histórico, cultural e literário da seguinte passagem:",
          exegese: "Você é um exegeta bíblico. Faça uma análise exegética detalhada, verso por verso, da seguinte passagem:",
          traducoes: "Você é um especialista em línguas bíblicas (Hebraico, Aramaico e Grego). Analise as palavras originais e suas traduções:",
          resumos: "Você é um teólogo. Crie um resumo claro e objetivo do seguinte conteúdo bíblico:",
          esbocos: "Você é um pastor experiente. Crie um esboço de pregação estruturado com introdução, pontos principais e conclusão sobre:",
          estudos_doutrinarios: "Você é um teólogo sistemático. Faça um estudo doutrinário profundo sobre:",
          analise_teologica: "Você é um teólogo comparativo. Compare diferentes correntes teológicas sobre:",
          teologia_sistematica: "Você é um professor de teologia sistemática. Explique de forma organizada o seguinte tema:",
          religioes_comparadas: "Você é um especialista em religiões comparadas. Compare a visão cristã com outras religiões sobre:",
          contextualizacao_brasileira: "Você é um teólogo brasileiro. Contextualize as Escrituras para a realidade cultural brasileira:",
          referencias_abnt_apa: "Você é um especialista em normas acadêmicas. Formate as seguintes referências em ABNT e APA:",
          linguagem_ministerial: "Você é um analista de retórica ministerial. Analise o seguinte discurso ou sermão:",
          redacao_academica: "Você é um orientador acadêmico. Ajude na estruturação do seguinte trabalho:",
          dados_demograficos: "Você é um sociólogo da religião. Forneça dados demográficos e análises sobre:",
          transcricao: "Você é um transcritor especializado. Transcreva e organize o seguinte conteúdo:"
        };

        const systemPrompt = toolPrompts[input.toolId] || "Você é um assistente de estudos bíblicos. Ajude com:";

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.input }
          ]
        });

        return {
          content: response.choices[0].message.content || "Erro ao gerar conteúdo."
        };
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

  payments: router({
    /**
     * Create checkout for subscription
     */
    createSubscriptionCheckout: protectedProcedure
      .input(z.object({
        planId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get plan details
        const plans = await getAllPlans();
        const plan = plans.find(p => p.id === input.planId);
        
        if (!plan) {
          throw new Error('Plano não encontrado');
        }

        // Create Mercado Pago checkout
        const checkout = await createSubscriptionCheckout({
          planId: plan.id,
          planName: plan.displayName,
          price: plan.priceMonthly,
          userId: ctx.user.id,
          userEmail: ctx.user.email || '',
        });

        return checkout;
      }),

    /**
     * Create checkout for credits purchase
     */
    createCreditsCheckout: protectedProcedure
      .input(z.object({
        credits: z.number().positive(),
        price: z.number().positive(),
      }))
      .mutation(async ({ ctx, input }) => {
        const checkout = await createCreditsCheckout({
          credits: input.credits,
          price: input.price,
          userId: ctx.user.id,
          userEmail: ctx.user.email || '',
        });

        return checkout;
      }),
  }),
});

export type AppRouter = typeof appRouter;

