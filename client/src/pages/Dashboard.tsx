import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import CreditsPanel from "@/components/CreditsPanel";
import NoCreditsModal from "@/components/NoCreditsModal";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Languages,
  FileText,
  Presentation,
  BookMarked,
  Scale,
  GraduationCap,
  Globe,
  FileCheck,
  Mic,
  BarChart,
  PenTool,
  Sparkles,
  Home,
  LogOut,
  Lock,
  Search
} from "lucide-react";

const TOOLS_CONFIG = [
  {
    id: "hermeneutica",
    name: "Hermenêutica",
    description: "Análise de contexto histórico, cultural e literário",
    icon: BookOpen,
    category: "Estudo Bíblico"
  },
  {
    id: "exegese",
    name: "Exegese",
    description: "Interpretação crítica e detalhada",
    icon: Search,
    category: "Estudo Bíblico",
    premium: true
  },
  {
    id: "traducoes",
    name: "Traduções",
    description: "Hebraico, Aramaico e Grego",
    icon: Languages,
    category: "Estudo Bíblico"
  },
  {
    id: "resumos",
    name: "Resumos",
    description: "Sínteses personalizadas",
    icon: FileText,
    category: "Estudo Bíblico"
  },
  {
    id: "esbocos",
    name: "Esboços de Pregação",
    description: "Estruturas para sermões",
    icon: Presentation,
    category: "Prática"
  },
  {
    id: "estudos_doutrinarios",
    name: "Estudos Doutrinários",
    description: "Análises teológicas profundas",
    icon: BookMarked,
    category: "Teologia"
  },
  {
    id: "analise_teologica",
    name: "Análise Teológica Comparada",
    description: "Comparação entre correntes",
    icon: Scale,
    category: "Teologia"
  },
  {
    id: "teologia_sistematica",
    name: "Teologia Sistemática",
    description: "Estudo organizado de temas",
    icon: GraduationCap,
    category: "Teologia"
  },
  {
    id: "religioes_comparadas",
    name: "Religiões Comparadas",
    description: "Estudo comparativo",
    icon: Globe,
    category: "Teologia",
    premium: true
  },
  {
    id: "contextualizacao_brasileira",
    name: "Contextualização Brasileira",
    description: "Corpus exclusivo brasileiro",
    icon: Globe,
    category: "Contexto"
  },
  {
    id: "referencias_abnt_apa",
    name: "Referências ABNT/APA",
    description: "Formatação acadêmica",
    icon: FileCheck,
    category: "Acadêmico",
    premium: true
  },
  {
    id: "linguagem_ministerial",
    name: "Linguagem Ministerial",
    description: "Análise de discursos",
    icon: Mic,
    category: "Acadêmico",
    premium: true
  },
  {
    id: "redacao_academica",
    name: "Redação Acadêmica",
    description: "Auxílio em trabalhos",
    icon: PenTool,
    category: "Acadêmico",
    premium: true
  },
  {
    id: "dados_demograficos",
    name: "Dados Demográficos",
    description: "Dados de igrejas",
    icon: BarChart,
    category: "Dados",
    premium: true
  },
  {
    id: "transcricao",
    name: "Transcrição de Mídia",
    description: "Transcrição de áudios/vídeos",
    icon: Sparkles,
    category: "Mídia",
    premium: true
  }
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const { data: activePlan } = trpc.credits.activePlan.useQuery();
  const planId = activePlan?.plan.id || 1;
  const { data: planTools } = trpc.plans.getTools.useQuery(
    { planId },
    { enabled: true } // Sempre buscar, usar planId 1 (FREE) como fallback
  );

  const categories = ["Todos", ...Array.from(new Set(TOOLS_CONFIG.map(t => t.category)))];

  const availableToolIds = new Set(planTools?.map(t => t.name) || []);
  
  // Mapeamento de IDs do frontend para nomes do banco
  const toolIdToDbName: Record<string, string> = {
    'hermeneutica': 'hermeneutica',
    'exegese': 'exegese',
    'traducoes': 'traducoes',
    'resumos': 'resumos',
    'esbocos': 'esbocos',
    'estudos_doutrinarios': 'estudos_doutrinarios',
    'analise_teologica': 'analise_teologica',
    'teologia_sistematica': 'teologia_sistematica',
    'religioes_comparadas': 'religioes_comparadas',
    'contextualizacao_brasileira': 'contextualizacao_brasileira',
    'referencias_abnt_apa': 'referencias_abnt_apa',
    'linguagem_ministerial': 'linguagem_ministerial',
    'redacao_academica': 'redacao_academica',
    'dados_demograficos': 'dados_demograficos',
    'transcricao': 'transcricao'
  };
  
  const filteredTools = TOOLS_CONFIG.filter(tool => 
    selectedCategory === "Todos" || tool.category === selectedCategory
  );

  const handleToolClick = (toolId: string) => {
    if (!availableToolIds.has(toolId)) {
      setShowNoCreditsModal(true);
      return;
    }
    setLocation(`/tool/${toolId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-[#d4af37] via-[#DAA520] to-[#FFFACD]">
      {/* Header */}
      <header className="bg-[#1e3a5f] shadow-lg border-b-4 border-[#d4af37]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link href="/">
              <span className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10 md:h-12 md:w-12 object-contain" />
                <h1 className="text-xl md:text-2xl font-bold text-[#d4af37]">{APP_TITLE}</h1>
              </span>
            </Link>
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <span className="text-[#d4af37] font-semibold text-sm md:text-base">
                Olá, {user?.name || "Usuário"}!
              </span>
              <Link href="/">
                <span className="flex items-center gap-2 px-4 py-2 text-[#d4af37] hover:text-[#B8860B] transition-colors cursor-pointer">
                  <Home className="w-5 h-5" />
                  Home
                </span>
              </Link>
              <Button
                onClick={() => logout()}
                variant="outline"
                className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#1e3a5f]"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar - Credits Panel */}
          <div className="lg:col-span-1">
            <CreditsPanel onNeedCredits={() => setShowNoCreditsModal(true)} />
          </div>

          {/* Main Content - Tools */}
          <div className="lg:col-span-3">
            {/* Welcome Section */}
            <div className="bg-white/90 rounded-2xl p-6 md:p-8 shadow-xl border-4 border-[#d4af37] mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-2">
                Bem-vindo ao Dashboard
              </h2>
              <p className="text-lg text-[#8b6f47]">
                Escolha uma ferramenta abaixo para começar seus estudos bíblicos profundos.
              </p>
              <div className="mt-4 p-4 bg-[#FFFACD] rounded-lg border-2 border-[#d4af37]">
                <p className="text-sm text-[#8b6f47]">
                  <strong>Plano Atual:</strong> {activePlan?.plan.displayName || "FREE"}
                  {" • "}
                  <strong>Ferramentas Disponíveis:</strong> {availableToolIds.size} de 15
                </p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={
                    selectedCategory === category
                      ? "bg-[#1e3a5f] text-[#d4af37] hover:bg-[#2a4a7f]"
                      : "border-[#d4af37] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-white"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                const dbName = toolIdToDbName[tool.id] || tool.id;
                const isAvailable = availableToolIds.has(dbName);
                const isLocked = !isAvailable;

                return (
                  <div
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className={`
                      bg-white/90 rounded-2xl p-6 shadow-xl border-4 border-[#d4af37]
                      transition-all duration-200 cursor-pointer
                      ${isAvailable 
                        ? 'hover:scale-105 hover:shadow-2xl' 
                        : 'opacity-60 cursor-not-allowed'
                      }
                      relative
                    `}
                  >
                    {isLocked && (
                      <div className="absolute top-4 right-4">
                        <Lock className="w-6 h-6 text-red-600" />
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-lg ${
                        isAvailable ? 'bg-[#1e3a5f]' : 'bg-gray-400'
                      }`}>
                        <Icon className={`w-8 h-8 ${
                          isAvailable ? 'text-[#d4af37]' : 'text-gray-200'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-[#8b6f47] mb-2">
                          {tool.description}
                        </p>
                        <span className="inline-block px-3 py-1 bg-[#FFFACD] border border-[#d4af37] rounded-full text-xs font-semibold text-[#1e3a5f]">
                          {tool.category}
                        </span>
                        {isLocked && (
                          <p className="mt-2 text-xs text-red-600 font-semibold">
                            Disponível em planos superiores
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* No Credits Modal */}
      <NoCreditsModal
        open={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
      />
    </div>
  );
}

