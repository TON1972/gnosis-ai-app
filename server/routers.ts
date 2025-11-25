import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getAllPlans, getToolsForPlan, getAllTools } from "./db";
import { savedStudies, users, creditTransactions } from "../drizzle/schema";
import { getDb } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { getUserCredits, useCredits, getUserActivePlan } from "./credits";
import { checkSubscriptionStatus, markSubscriptionPaid } from "./subscriptionStatus";
import { getUserStats, getFinancialCalendar, getDelinquentUsers } from "./admin";
import { createSubscriptionCheckout, createCreditsCheckout, createManualPaymentCheckout } from "./mercadopago";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { chatbotContacts, ticketMessages } from "../drizzle/schema";
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
          transcricao: "Você é um transcritor especializado. Transcreva e organize o seguinte conteúdo:",
          patristica: "Voce e um pesquisador especializado em Patristica e Historia da Igreja. Analise o tema ou texto e estruture: 1) Principais autores patristicos que abordaram o tema (Clemente, Inacio, Irineu, Atanasio, Agostinho); 2) Sintese das interpretacoes com citacoes relevantes; 3) Diferencas entre teologia oriental e ocidental; 4) Influencia na teologia medieval, reforma e pensamento moderno; 5) Conclusao teologica integrando Patristica e pensamento contemporaneo; 6) Notas criticas e contexto historico. Formate de forma academica e bem estruturada. Tema:",
          linha_tempo_teologica: "Voce e um teologo-historiador especializado em historia do pensamento cristao. Crie uma linha do tempo teologica detalhada incluindo: 1) Periodizacao historica (Igreja Primitiva, Patristica, Medieval, Reforma, Modernidade, Contemporaneidade); 2) Eventos teologicos marcantes (concilios, controversias, cismas); 3) Principais teologos e obras de cada periodo; 4) Evolucao do conceito ao longo dos seculos; 5) Correntes teologicas divergentes; 6) Sintese conclusiva mostrando trajetoria e tendencias contemporaneas. Formate cronologicamente com datas especificas. Seja detalhado e teologicamente rigoroso. Tema:",
          apologetica_avancada: "Você é um apologeta cristão erudito, com formação de doutorado em Teologia, Filosofia da Religião e História do Cristianismo. Seu papel é analisar, responder e defender racionalmente a fé cristã com base nas Escrituras, na tradição histórica e na razão filosófica. Estruture sua resposta em 13 seções: I) CONTEXTO E DEFINIÇÃO (introdução, contextualização teológica/filosófica/histórica, identificação do campo); II) EXPOSIÇÃO DA OBJEÇÃO (descrição honesta e técnica, principais autores, estrutura lógica); III) ANÁLISE FILOSÓFICA (validade lógica, lógica formal, escolas filosóficas); IV) RESPOSTA TEOLÓGICA BÍBLICA (fundamentação bíblica, exegese contextual, coerência interna); V) APOLOGIA HISTÓRICA (Pais da Igreja, Reformadores, documentos conciliares, comparação entre tradições); VI) EVIDÊNCIAS EXTERNAS E INTERDISCIPLINARES (arqueologia, história, ciências, fé e razão); VII) SÍNTESE APOLOGÉTICA (resposta estruturada, superioridade explicativa, implicações éticas/espirituais); VIII) OBJEÇÕES COMUNS E RESPOSTAS RÁPIDAS (antecipar contra-argumentos, respostas concisas); IX) APLICAÇÃO PRÁTICA E PASTORAL (contexto ministerial, abordagens pastorais, orientações práticas); X) DIÁLOGO INTER-RELIGIOSO (comparação respeitosa, convergências/divergências, singularidade cristã); XI) FALÁCIAS A EVITAR (falácias lógicas comuns, armadilhas argumentativas, honestidade intelectual); XII) RECURSOS E REFERÊNCIAS (bíblicas, patrísticas, clássicas, modernas, contemporâneas); XIII) CONCLUSÃO (síntese teológica/filosófica, defesa racional, exortação acadêmica, chamado pastoral). Use linguagem acadêmica, clara e persuasiva. Seja respeitoso mas firme na defesa da fé. Tema ou objeção:",
          "escatologia-biblica": "Você é um teólogo especializado em Escatologia Bíblica, com formação acadêmica em nível de mestrado e doutorado nas áreas de Teologia Sistemática, Estudos Intertestamentários, Literatura Apocalíptica, Linguística Bíblica (hebraico, aramaico e grego koinê) e História da Interpretação Escatológica ao longo dos séculos. Sua missão é analisar, interpretar e explicar temas escatológicos com rigor acadêmico, precisão exegética e profundidade teológica, integrando Escrituras, tradições interpretativas históricas e modelos hermenêuticos contemporâneos. Estruture sua resposta em 9 seções: I) DEFINIÇÃO E CONTEXTO INICIAL (definição técnica, perspectiva AT/NT/intertestamentária, campo teológico, controvérsias acadêmicas); II) HISTÓRIA DA INTERPRETAÇÃO ESCATOLÓGICA (Pais da Igreja, Escolásticos, Reformadores, Puritanos, escolas modernas; comparação pré/pós/amilenismo, pré/meso/pós-tribulacionismo, preterismo/futurismo/historicismo/idealismo; autores clássicos e contemporâneos); III) ANÁLISE EXEGÉTICA AVANÇADA (textos essenciais AT/NT, análise técnica hebraico/aramaico/grego, semântica/morfologia/sintaxe, contexto literário, gênero literário, traduções e implicações, comparação entre escolas); IV) SISTEMATIZAÇÃO TEOLÓGICA (integração à teologia bíblica geral, teologia do Reino, conexão com Parousia/Julgamento/Ressurreição/Estado Intermediário/Escatologia Cósmica/Nova Criação, coerência AT/NT); V) MODELAGEM INTERPRETATIVA (modelos hermenêuticos literal/simbólico/progressivo/histórico-redentivo/tipológico/apocalíptico/futurista/preterista/idealista, forças e limitações, pressupostos); VI) SÍNTESE INTERDISCIPLINAR (arqueologia, história, cultura, literatura judaica Segundo Templo, filosofia da história, cosmologia, estudos judaicos, psicologia da religião); VII) AVALIAÇÃO DOGMÁTICA E TEOLÓGICA (comparação entre tradições reformada/católica/ortodoxa/pentecostal/evangélica, credos e confissões, riscos de leituras heterodoxas); VIII) APLICAÇÃO TEOLÓGICA E PASTORAL (impacto em ética/missão/esperança/prática espiritual, implicações práticas, perigos de leituras desequilibradas); IX) SÍNTESE FINAL (síntese geral, modelo interpretativo mais coerente, conclusão equilibrada, importância da escatologia hoje). Use linguagem acadêmica de nível doutorado, seja tecnicamente preciso e teologicamente profundo. Tema escatológico:"
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

    /**
     * Get credit usage history for the last 30 days
     */
    usageHistory: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const transactions = await db
        .select()
        .from(creditTransactions)
        .where(
          and(
            eq(creditTransactions.userId, ctx.user.id),
            eq(creditTransactions.type, 'usage'),
            gte(creditTransactions.createdAt, thirtyDaysAgo)
          )
        )
        .orderBy(creditTransactions.createdAt);

      // Group by date and sum usage
      const dailyUsage = new Map<string, number>();
      
      transactions.forEach(tx => {
        const date = tx.createdAt.toISOString().split('T')[0];
        const current = dailyUsage.get(date) || 0;
        dailyUsage.set(date, current + Math.abs(tx.amount));
      });

      // Fill in missing dates with 0
      const result = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          usage: dailyUsage.get(dateStr) || 0,
        });
      }

      return result;
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
        days: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
          throw new Error('Acesso negado');
        }
        // Convert days to Date range
        const endDate = new Date();
        const startDate = input.days ? new Date(Date.now() - input.days * 24 * 60 * 60 * 1000) : undefined;
        return await getDelinquentUsers(startDate, endDate);
      }),

    /**
     * Get all support requests (admin only)
     */
    supportRequests: protectedProcedure
      .input(z.object({
        status: z.enum(['pending', 'contacted', 'resolved', 'all']).optional(),
        department: z.enum(['tecnico', 'financeiro', 'comercial', 'outros', 'all']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
          throw new Error('Acesso negado');
        }

        const db = await getDb();
        if (!db) return [];

        // Build query with filters
        const conditions = [];
        if (input.status && input.status !== 'all') {
          conditions.push(eq(chatbotContacts.status, input.status));
        }
        if (input.department && input.department !== 'all') {
          conditions.push(eq(chatbotContacts.department, input.department));
        }
        
        // Filter by assigned admin (only for regular admins, super_admin sees all)
        if (ctx.user.role === 'admin') {
          conditions.push(eq(chatbotContacts.assignedTo, ctx.user.id));
        }

        let requests;
        if (conditions.length > 0) {
          requests = await db
            .select()
            .from(chatbotContacts)
            .where(and(...conditions))
            .orderBy(desc(chatbotContacts.createdAt));
        } else {
          requests = await db
            .select()
            .from(chatbotContacts)
            .orderBy(desc(chatbotContacts.createdAt));
        }

        return requests;
      }),

    /**
     * Update support request status (admin only)
     */
    updateSupportStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'contacted', 'resolved']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
          throw new Error('Acesso negado');
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');

        await db
          .update(chatbotContacts)
          .set({ status: input.status })
          .where(eq(chatbotContacts.id, input.id));

        return { success: true };
      }),

    /**
     * Assign support request to admin (admin only)
     */
    assignSupportRequest: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        adminId: z.number().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
          throw new Error('Acesso negado');
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');

        await db
          .update(chatbotContacts)
          .set({ assignedTo: input.adminId })
          .where(eq(chatbotContacts.id, input.requestId));

        // Notify assigned admin if not null
        if (input.adminId) {
          const assignedAdmin = await db
            .select()
            .from(users)
            .where(eq(users.id, input.adminId))
            .limit(1);

          if (assignedAdmin.length > 0) {
            const request = await db
              .select()
              .from(chatbotContacts)
              .where(eq(chatbotContacts.id, input.requestId))
              .limit(1);

            if (request.length > 0) {
              await notifyOwner({
                title: '📩 Solicitação de Suporte Atribuída',
                content: `**Admin:** ${assignedAdmin[0].name}\n**Solicitação:** ${request[0].name} (${request[0].email})\n**Departamento:** ${request[0].department}`,
              });
            }
          }
        }

        return { success: true };
      }),

    /**
     * Get list of all admins (admin only)
     */
    listAdminsForAssignment: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new Error('Acesso negado');
      }

      const db = await getDb();
      if (!db) return [];

      const admins = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(sql`${users.role} IN ('admin', 'super_admin')`);

      return admins;
    }),

    /**
     * Get ticket messages (admin only)
     */
    getTicketMessages: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
          throw new Error('Acesso negado');
        }

        const db = await getDb();
        if (!db) return [];

        const messages = await db
          .select()
          .from(ticketMessages)
          .where(eq(ticketMessages.ticketId, input.ticketId))
          .orderBy(ticketMessages.createdAt);

        return messages;
      }),

    /**
     * Send ticket message (admin only)
     */
    sendTicketMessage: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        message: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
          throw new Error('Acesso negado');
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');

        // Insert message
        await db.insert(ticketMessages).values({
          ticketId: input.ticketId,
          senderId: ctx.user.id,
          senderName: ctx.user.name || 'Admin',
          senderType: 'admin',
          message: input.message,
          isRead: 0,
        });

        // Get ticket info for email
        const ticket = await db
          .select()
          .from(chatbotContacts)
          .where(eq(chatbotContacts.id, input.ticketId))
          .limit(1);

        if (ticket.length > 0) {
          // Send email to client
          const { sendTicketEmail } = await import('./ticketEmail');
          await sendTicketEmail({
            clientEmail: ticket[0].email,
            clientName: ticket[0].name,
            ticketId: input.ticketId,
            adminName: ctx.user.name || 'Equipe GNOSIS AI',
            message: input.message,
          });
        }

        return { success: true };
      }),

    /**
     * Get unread message count per ticket (admin only)
     */
    getUnreadCounts: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new Error('Acesso negado');
      }

      const db = await getDb();
      if (!db) return [];

      const unreadCounts = await db
        .select({
          ticketId: ticketMessages.ticketId,
          count: sql<number>`COUNT(*)`
        })
        .from(ticketMessages)
        .where(and(
          eq(ticketMessages.senderType, 'client'),
          eq(ticketMessages.isRead, 0)
        ))
        .groupBy(ticketMessages.ticketId);

      return unreadCounts;
    }),

    /**
     * Send client message to ticket (public route)
     */
    sendClientTicketMessage: publicProcedure
      .input(z.object({
        ticketId: z.number(),
        message: z.string().min(1),
        clientName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        // Insert client message
        await db.insert(ticketMessages).values({
          ticketId: input.ticketId,
          senderId: 0, // Client has no user ID
          senderName: input.clientName,
          senderType: 'client',
          message: input.message,
          isRead: 0,
        });

        return { success: true };
      }),

    /**
     * Mark ticket messages as read (admin only)
     */
    markTicketAsRead: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
          throw new Error('Acesso negado');
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');

        await db
          .update(ticketMessages)
          .set({ isRead: 1 })
          .where(and(
            eq(ticketMessages.ticketId, input.ticketId),
            eq(ticketMessages.senderType, 'client')
          ));

        return { success: true };
      }),

    /**
     * Archive ticket (admin only)
     */
    archiveTicket: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
          throw new Error('Acesso negado');
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');

        await db
          .update(chatbotContacts)
          .set({ archived: true })
          .where(eq(chatbotContacts.id, input.ticketId));

        return { success: true };
      }),

    /**
     * Unarchive ticket (admin only)
     */
    unarchiveTicket: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
          throw new Error('Acesso negado');
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');

        await db
          .update(chatbotContacts)
          .set({ archived: false })
          .where(eq(chatbotContacts.id, input.ticketId));

        return { success: true };
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
- ALIANÇA: R$ 19,98/mês, 10 ferramentas, 1500 créditos iniciais + 100/dia
- LUMEN: R$ 36,98/mês, todas as 17 ferramentas, 3000 créditos iniciais + 200/dia
- GNOSIS PREMIUM: R$ 68,98/mês, todas as 17 ferramentas, 6000 créditos iniciais + 300/dia

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

    /**
     * Save contact information before transferring to support
     */
    saveContact: publicProcedure
      .input(z.object({
        name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
        email: z.string().email('Email inválido'),
        department: z.enum(['tecnico', 'financeiro', 'comercial', 'outros']),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const deptNames: Record<string, string> = {
            tecnico: "Suporte Técnico",
            financeiro: "Financeiro",
            comercial: "Comercial",
            outros: "Outros Assuntos"
          };

          // Save contact to database
          await db.insert(chatbotContacts).values({
            name: input.name,
            email: input.email,
            department: input.department,
            message: input.message || null,
            status: 'pending',
          });

          // Notify admin
          await notifyOwner({
            title: '📩 Nova solicitação de contato - Chatbot',
            content: `**Nome:** ${input.name}\n**Email:** ${input.email}\n**Departamento:** ${deptNames[input.department]}\n**Mensagem:** ${input.message || 'Nenhuma mensagem'}`,
          });

          return { success: true };
        } catch (error) {
          console.error('Error saving chatbot contact:', error);
          throw new Error('Erro ao salvar contato. Por favor, tente novamente.');
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

