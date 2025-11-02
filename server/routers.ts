import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getAllPlans, getToolsForPlan, getAllTools } from "./db";
import { savedStudies, users } from "../drizzle/schema";
import { getDb } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { getUserCredits, useCredits, getUserActivePlan } from "./credits";
import { checkSubscriptionStatus, markSubscriptionPaid } from "./subscriptionStatus";
import { getUserStats, getFinancialCalendar, getDelinquentUsers } from "./admin";
import { createSubscriptionCheckout, createCreditsCheckout, createManualPaymentCheckout } from "./mercadopago";
import { invokeLLM } from "./_core/llm";
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
    /**
     * Refresh user session data from database
     */
    refreshSession: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Fetch fresh user data from database
      const freshUser = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (freshUser.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      // Return fresh user data
      return freshUser[0];
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

  studies: router({ 
    /**
     * Save a generated study
     */
    save: protectedProcedure
      .input(z.object({
        toolName: z.string(),
        input: z.string(),
        output: z.string(),
        creditCost: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Insert new study
        const [study] = await db.insert(savedStudies).values({
          userId: ctx.user.id,
          toolName: input.toolName,
          input: input.input,
          output: input.output,
          creditCost: input.creditCost,
        });

        // Keep only the 100 most recent studies for this user
        const allStudies = await db
          .select()
          .from(savedStudies)
          .where(eq(savedStudies.userId, ctx.user.id))
          .orderBy(desc(savedStudies.createdAt));

        if (allStudies.length > 100) {
          // Get IDs of studies to delete (all beyond the 100 most recent)
          const studiesToDelete = allStudies.slice(100).map(s => s.id);
          
          // Delete old studies
          for (const id of studiesToDelete) {
            await db.delete(savedStudies).where(eq(savedStudies.id, id));
          }
        }

        return { success: true, id: study.insertId };
      }),

    /**
     * Get all saved studies for current user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const studies = await db
        .select()
        .from(savedStudies)
        .where(eq(savedStudies.userId, ctx.user.id))
        .orderBy(desc(savedStudies.createdAt));

      return studies;
    }),

    /**
     * Delete a saved study
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .delete(savedStudies)
          .where(eq(savedStudies.id, input.id));

        return { success: true };
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

  admin: router({
    /**
     * Get user statistics (admin only)
     */
    userStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new Error('Acesso negado');
      }
      return await getUserStats();
    }),

    /**
     * Get financial calendar (admin only)
     */
    financialCalendar: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new Error('Acesso negado');
      }
      return await getFinancialCalendar();
    }),

    /**
     * Get delinquent users (admin only)
     */
    delinquentUsers: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
          throw new Error('Acesso negado');
        }
        const startDate = input?.startDate ? new Date(input.startDate) : undefined;
        const endDate = input?.endDate ? new Date(input.endDate) : undefined;
        return await getDelinquentUsers(startDate, endDate);
      }),

    /**
     * List all administrators (super_admin only)
     */
    listAdmins: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'super_admin') {
        throw new Error('Apenas Super Administradores podem listar administradores');
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(sql`${users.role} IN ('admin', 'super_admin')`);
    }),

    /**
     * Add new administrator (super_admin only)
     */
    addAdmin: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        role: z.enum(['admin', 'super_admin']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'super_admin') {
          throw new Error('Apenas Super Administradores podem adicionar administradores');
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Find user by email
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (user.length === 0) {
          throw new Error('Usuário não encontrado com este email');
        }

        // Update role
        await db
          .update(users)
          .set({ role: input.role })
          .where(eq(users.id, user[0].id));

        return { success: true };
      }),

    /**
     * Remove administrator (super_admin only)
     */
    removeAdmin: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'super_admin') {
          throw new Error('Apenas Super Administradores podem remover administradores');
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Cannot remove super_admin
        const targetUser = await db
          .select()
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);

        if (targetUser.length > 0 && targetUser[0].role === 'super_admin') {
          throw new Error('Não é possível remover Super Administradores');
        }

        // Set role back to user
        await db
          .update(users)
          .set({ role: 'user' })
          .where(eq(users.id, input.userId));

        return { success: true };
      }),
  }),

  subscription: router({
    /**
     * Check current subscription status
     */
    status: protectedProcedure.query(async ({ ctx }) => {
      return await checkSubscriptionStatus(ctx.user.id);
    }),

    /**
     * Mark subscription as paid (called by webhook or manual confirmation)
     */
    markPaid: protectedProcedure.mutation(async ({ ctx }) => {
      await markSubscriptionPaid(ctx.user.id);
      return { success: true };
    }),
  }),

  payments: router({
    /**
     * Create checkout for subscription
     */
    createSubscriptionCheckout: protectedProcedure
      .input(z.object({
        planId: z.union([z.number(), z.string()]),
        billingPeriod: z.enum(['monthly', 'yearly']).default('monthly'),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get plan details
        const plans = await getAllPlans();
        const plan = plans.find(p => p.id === Number(input.planId) || p.id === input.planId);
        
        if (!plan) {
          throw new Error('Plano não encontrado');
        }

        // Calculate price based on billing period
        const isYearly = input.billingPeriod === 'yearly';
        // Convert from cents to reais (divide by 100)
        const monthlyPrice = plan.priceMonthly / 100;
        const yearlyPrice = plan.priceYearly ? plan.priceYearly / 100 : (monthlyPrice * 12 * 0.834); // 16.6% discount
        const price = isYearly ? yearlyPrice : monthlyPrice;
        const duration = isYearly ? 12 : 1;

        // Create Mercado Pago checkout
        const checkout = await createSubscriptionCheckout({
          planId: plan.id,
          planName: plan.displayName,
          price: price,
          duration: duration,
          billingPeriod: input.billingPeriod,
          userId: ctx.user.id,
          userEmail: ctx.user.email || '',
        });

        return checkout;
      }),

    /**
     * Create manual payment checkout (with PIX)
     */
    createManualPaymentCheckout: protectedProcedure
      .input(z.object({
        planId: z.union([z.number(), z.string()]),
        billingPeriod: z.enum(['monthly', 'yearly']).default('monthly'),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get plan details
        const plans = await getAllPlans();
        const plan = plans.find(p => p.id === Number(input.planId) || p.id === input.planId);
        
        if (!plan) {
          throw new Error('Plano não encontrado');
        }

        // Calculate price based on billing period
        const isYearly = input.billingPeriod === 'yearly';
        // Convert from cents to reais (divide by 100)
        const monthlyPrice = plan.priceMonthly / 100;
        const yearlyPrice = plan.priceYearly ? plan.priceYearly / 100 : (monthlyPrice * 12 * 0.834); // 16.6% discount
        const price = isYearly ? yearlyPrice : monthlyPrice;
        const duration = isYearly ? 12 : 1;

        // Create Mercado Pago manual checkout
        const checkout = await createManualPaymentCheckout({
          planId: plan.id,
          planName: plan.displayName,
          price: price,
          duration: duration,
          billingPeriod: input.billingPeriod,
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

  chatbot: router({
    /**
     * Get AI-powered response for chatbot
     */
    getAIResponse: publicProcedure
      .input(z.object({
        message: z.string(),
        conversationHistory: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const systemPrompt = `Você é o assistente virtual da GNOSIS AI, uma plataforma de estudos bíblicos profundos com inteligência artificial.

Informações sobre a plataforma:

PLANOS:
- FREE: Gratuito, 6 ferramentas básicas, 500 créditos iniciais + 50/dia
- ALIANÇA: R$ 18,98/mês, 8 ferramentas, 1500 créditos iniciais + 100/dia
- LUMEN: R$ 33,98/mês, 12 ferramentas, 3000 créditos iniciais + 200/dia
- GNOSIS PREMIUM: R$ 62,98/mês, todas as 15 ferramentas, 6000 créditos iniciais + 300/dia

FERRAMENTAS:
- Básicas (FREE): Hermenêutica, Traduções, Resumos, Enfoques de Pregação, Estudos Doutrinários, Análise Teológica Comparada
- Avançadas (pagos): Exegese, Teologia Sistemática, Linguagem Ministerial, e mais

CRÉDITOS:
- Créditos diários renovam todo dia
- Créditos iniciais renovam a cada 30 dias
- Créditos avulsos nunca expiram
- Pacotes avulsos: 500 (R$ 9,90), 1000 (R$ 18,90), 2500 (R$ 44,90)

REGRAS:
- Seja simpático, profissional e prestativo
- Responda de forma clara e objetiva
- Use emojis moderadamente
- Se não souber algo, sugira contato com suporte
- Incentive o usuário a testar a plataforma
- Mantenha respostas com no máximo 150 palavras`;

          const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...(input.conversationHistory || []),
            { role: 'user' as const, content: input.message },
          ];

          const response = await invokeLLM({ messages });
          
          return {
            response: response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta. Por favor, tente novamente ou escolha uma opção do menu.',
          };
        } catch (error) {
          console.error('Chatbot AI error:', error);
          return {
            response: 'Desculpe, estou com dificuldades no momento. Por favor, escolha uma opção do menu ou tente novamente mais tarde.',
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

