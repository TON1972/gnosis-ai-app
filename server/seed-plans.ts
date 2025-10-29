import { getDb } from "./db";
import { plans, tools, planTools } from "../drizzle/schema";

/**
 * Seed script to populate plans and tools
 * Run with: pnpm tsx server/seed-plans.ts
 */

// Calcula preço anual com 16,6% desconto
const calculateYearlyPrice = (monthly: number) => {
  const yearlyWithoutDiscount = monthly * 12;
  const discount = yearlyWithoutDiscount * 0.166;
  return Math.round(yearlyWithoutDiscount - discount);
};

const PLANS_DATA = [
  {
    name: "free",
    displayName: "Plano FREE",
    priceMonthly: 0,
    priceYearly: 0,
    creditsInitial: 500, // cumulative, NOT renewable after 30 days
    creditsDaily: 50, // non-cumulative
    toolsCount: 6,
    description: "Plano gratuito com ferramentas básicas",
  },
  {
    name: "alianca",
    displayName: "Plano Aliança",
    priceMonthly: 1898, // R$ 18,98
    priceYearly: calculateYearlyPrice(1898), // R$ 189,88 com 16,6% desconto
    creditsInitial: 1500, // cumulative, 30-day validity
    creditsDaily: 150, // non-cumulative
    toolsCount: 10,
    description: "Plano intermediário com 10 ferramentas",
  },
  {
    name: "lumen",
    displayName: "Plano Lumen",
    priceMonthly: 3398, // R$ 33,98
    priceYearly: calculateYearlyPrice(3398), // R$ 339,88 com 16,6% desconto
    creditsInitial: 3000, // cumulative, 30-day validity
    creditsDaily: 300, // non-cumulative
    toolsCount: 15,
    description: "Plano completo com todas as 15 ferramentas",
  },
  {
    name: "premium",
    displayName: "Plano GNOSIS Premium",
    priceMonthly: 6298, // R$ 62,98
    priceYearly: calculateYearlyPrice(6298), // R$ 629,88 com 16,6% desconto
    creditsInitial: 8000, // cumulative, 30-day validity
    creditsDaily: 400, // non-cumulative (UPDATED from 800)
    toolsCount: 15,
    description: "Plano premium com todas as ferramentas e mais créditos",
  },
];

const TOOLS_DATA = [
  {
    name: "hermeneutica",
    displayName: "Hermenêutica",
    description: "Análise de contexto histórico, cultural e literário",
    category: "estudo_biblico",
    order: 1,
  },
  {
    name: "exegese",
    displayName: "Exegese",
    description: "Interpretação crítica e detalhada",
    category: "estudo_biblico",
    order: 2,
  },
  {
    name: "traducoes",
    displayName: "Traduções",
    description: "Hebraico, Aramaico e Grego",
    category: "estudo_biblico",
    order: 3,
  },
  {
    name: "resumos",
    displayName: "Resumos",
    description: "Sínteses personalizadas",
    category: "estudo_biblico",
    order: 4,
  },
  {
    name: "esbocos",
    displayName: "Esboços de Pregação",
    description: "Estruturas para sermões",
    category: "pratica",
    order: 5,
  },
  {
    name: "estudos_doutrinarios",
    displayName: "Estudos Doutrinários",
    description: "Análises teológicas profundas",
    category: "teologia",
    order: 6,
  },
  {
    name: "analise_teologica",
    displayName: "Análise Teológica Comparada",
    description: "Comparação entre correntes teológicas",
    category: "teologia",
    order: 7,
  },
  {
    name: "teologia_sistematica",
    displayName: "Teologia Sistemática",
    description: "Estudo organizado de temas teológicos",
    category: "teologia",
    order: 8,
  },
  {
    name: "religioes_comparadas",
    displayName: "Religiões Comparadas",
    description: "Estudo comparativo de religiões",
    category: "teologia",
    order: 9,
  },
  {
    name: "contextualizacao_brasileira",
    displayName: "Contextualização Brasileira",
    description: "Corpus exclusivo brasileiro",
    category: "contexto",
    order: 10,
  },
  {
    name: "referencias_abnt_apa",
    displayName: "Gerador de Referências ABNT/APA",
    description: "Formatação acadêmica de referências",
    category: "academico",
    order: 11,
  },
  {
    name: "linguagem_ministerial",
    displayName: "Análise de Linguagem Ministerial",
    description: "Análise de discursos ministeriais",
    category: "academico",
    order: 12,
  },
  {
    name: "redacao_academica",
    displayName: "Assistente de Redação Acadêmica",
    description: "Auxílio em trabalhos acadêmicos",
    category: "academico",
    order: 13,
  },
  {
    name: "dados_demograficos",
    displayName: "Análise de Dados Demográficos",
    description: "Dados estatísticos de igrejas",
    category: "dados",
    order: 14,
  },
  {
    name: "transcricao",
    displayName: "Transcrição de Mídia",
    description: "Transcrição de áudios e vídeos",
    category: "midia",
    order: 15,
  },
];

// Tools excluded from Aliança plan (now only 5 excluded, 10 included)
const ALIANCA_EXCLUDED_TOOLS = [
  "exegese",
  "referencias_abnt_apa",
  "redacao_academica",
  "dados_demograficos",
  "transcricao",
];

// FREE plan now has 6 basic tools
const FREE_TOOLS = [
  "hermeneutica",
  "traducoes",
  "resumos",
  "esbocos",
  "estudos_doutrinarios",
  "analise_teologica",
];

async function seedPlansAndTools() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  console.log("🌱 Seeding plans and tools...");

  try {
    // Insert plans
    console.log("📋 Inserting plans...");
    await db.delete(plans); // Clear existing
    const insertedPlans = await db.insert(plans).values(PLANS_DATA).$returningId();
    console.log(`✅ Inserted ${insertedPlans.length} plans`);

    // Get plan IDs
    const allPlans = await db.select().from(plans);
    const planMap = new Map(allPlans.map(p => [p.name, p.id]));

    // Insert tools
    console.log("🔧 Inserting tools...");
    await db.delete(tools); // Clear existing
    const insertedTools = await db.insert(tools).values(TOOLS_DATA).$returningId();
    console.log(`✅ Inserted ${insertedTools.length} tools`);

    // Get tool IDs
    const allTools = await db.select().from(tools);
    const toolMap = new Map(allTools.map(t => [t.name, t.id]));

    // Create plan-tool relationships
    console.log("🔗 Creating plan-tool relationships...");
    await db.delete(planTools); // Clear existing

    const planToolsData = [];

    // FREE plan - only 4 basic tools
    const freePlanId = planMap.get("free")!;
    for (const toolName of FREE_TOOLS) {
      const toolId = toolMap.get(toolName);
      if (toolId) {
        planToolsData.push({ planId: freePlanId, toolId });
      }
    }

    // ALIANÇA plan - 10 tools (excluding 5 specific ones)
    const aliancaPlanId = planMap.get("alianca")!;
    for (const tool of allTools) {
      if (!ALIANCA_EXCLUDED_TOOLS.includes(tool.name)) {
        planToolsData.push({ planId: aliancaPlanId, toolId: tool.id });
      }
    }

    // LUMEN and PREMIUM - all 15 tools
    const lumenPlanId = planMap.get("lumen")!;
    const premiumPlanId = planMap.get("premium")!;
    for (const tool of allTools) {
      planToolsData.push({ planId: lumenPlanId, toolId: tool.id });
      planToolsData.push({ planId: premiumPlanId, toolId: tool.id });
    }

    await db.insert(planTools).values(planToolsData);
    console.log(`✅ Created ${planToolsData.length} plan-tool relationships`);

    console.log("\n✨ Seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - FREE: 6 tools`);
    console.log(`  - ALIANÇA: 10 tools (excluding: ${ALIANCA_EXCLUDED_TOOLS.join(", ")})`);
    console.log(`  - LUMEN: 15 tools (all)`);
    console.log(`  - PREMIUM: 15 tools (all)`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPlansAndTools();
}

export { seedPlansAndTools };

