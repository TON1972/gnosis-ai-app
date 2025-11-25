import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import CreditsPanel from "@/components/CreditsPanel";
import NoCreditsModal from "@/components/NoCreditsModal";
import SavedStudiesSection from "@/components/SavedStudiesSection";
import SubscriptionWarningBanner from "@/components/SubscriptionWarningBanner";
import DashboardMobileMenu from "@/components/DashboardMobileMenu";
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
  Search,
  Download,
  Trash2,
  Eye,
  Clock,
  BookText,
  Shield,
  User
} from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import "../dashboard-mobile.css";

const TOOLS_CONFIG = [
  {
    id: "hermeneutica",
    name: "Hermenêutica",
    description: "Análise profunda de contexto histórico, cultural e literário de passagens bíblicas",
    icon: BookOpen,
    category: "Estudo Bíblico"
  },
  {
    id: "exegese",
    name: "Exegese",
    description: "Interpretação crítica e detalhada verso por verso com análise exegética completa",
    icon: Search,
    category: "Estudo Bíblico",
    premium: true
  },
  {
    id: "traducoes",
    name: "Traduções",
    description: "Análise de palavras originais em Hebraico, Aramaico e Grego com nuances linguísticas",
    icon: Languages,
    category: "Estudo Bíblico"
  },
  {
    id: "resumos",
    name: "Resumos",
    description: "Sínteses personalizadas de passagens, capítulos ou livros inteiros da Bíblia",
    icon: FileText,
    category: "Estudo Bíblico"
  },
  {
    id: "esbocos",
    name: "Esboços de Pregação",
    description: "Estruturas completas para sermões e mensagens com pontos-chave e aplicações práticas",
    icon: Presentation,
    category: "Prática"
  },
  {
    id: "estudos_doutrinarios",
    name: "Estudos Doutrinários",
    description: "Análises teológicas profundas sobre doutrinas específicas com fundamentação bíblica",
    icon: BookMarked,
    category: "Teologia"
  },
  {
    id: "analise_teologica",
    name: "Análise Teológica Comparada",
    description: "Comparação detalhada entre diferentes correntes teológicas e tradições cristãs",
    icon: Scale,
    category: "Teologia"
  },
  {
    id: "teologia_sistematica",
    name: "Teologia Sistemática",
    description: "Estudo organizado e estruturado de temas teológicos sistemáticos",
    icon: GraduationCap,
    category: "Teologia"
  },
  {
    id: "religioes_comparadas",
    name: "Religiões Comparadas",
    description: "Estudo comparativo entre cristianismo e outras religiões mundiais",
    icon: Globe,
    category: "Teologia",
    premium: true
  },
  {
    id: "contextualizacao_brasileira",
    name: "Contextualização Brasileira",
    description: "Aplicação das Escrituras ao contexto cultural e social brasileiro exclusivo",
    icon: Globe,
    category: "Contexto"
  },
  {
    id: "referencias_abnt_apa",
    name: "Referências ABNT/APA",
    description: "Formatação acadêmica de citações e referências em padrões ABNT e APA",
    icon: FileCheck,
    category: "Acadêmico",
    premium: true
  },
  {
    id: "linguagem_ministerial",
    name: "Linguagem Ministerial",
    description: "Análise retórica e teológica de discursos, sermões e mensagens ministeriais",
    icon: Mic,
    category: "Acadêmico",
    premium: true
  },
  {
    id: "redacao_academica",
    name: "Redação Acadêmica",
    description: "Auxílio na estruturação e desenvolvimento de trabalhos acadêmicos teológicos",
    icon: PenTool,
    category: "Acadêmico",
    premium: true
  },
  {
    id: "dados_demograficos",
    name: "Dados Demográficos",
    description: "Dados estatísticos sobre igrejas, movimentos religiosos e tendências evangélicas",
    icon: BarChart,
    category: "Dados",
    premium: true
  },
  {
    id: "transcricao",
    name: "Transcrição de Mídia",
    description: "Transcrição automática de áudios e vídeos de sermões, estudos e palestras",
    icon: Sparkles,
    category: "Mídia",
    premium: true
  },
  {
    id: "patristica",
    name: "Patrística",
    description: "Explora o pensamento dos Pais da Igreja sobre temas e textos com contexto histórico",
    icon: BookText,
    category: "Teologia",
    premium: true
  },
  {
    id: "linha_tempo_teologica",
    name: "Linha do Tempo Teológica",
    description: "Gera linha do tempo teológica interativa e cronológica sobre doutrinas e movimentos",
    icon: Clock,
    category: "Teologia",
    premium: true
  },
  {
    id: "apologetica_avancada",
    name: "Apologética Avançada",
    description: "Ferramenta de defesa racional e sistemática da fé cristã, com base em filosofia, história, teologia bíblica e evidências empíricas",
    icon: Shield,
    category: "Teologia",
    premium: true
  },
  {
    id: "escatologia-biblica",
    name: "Escatologia Bíblica",
    description: "Análise escatológica profunda com rigor acadêmico em nível de doutorado. Abrange história da interpretação, exegese avançada, sistematização teológica e modelagem hermenêutica.",
    icon: Calendar,
    category: "Teologia",
    premium: true
  }
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  // Scroll to top when component mounts (método robusto)
  useEffect(() => {
    // Método 1: Scroll imediato
    window.scrollTo(0, 0);
    // Método 2: Forçar scroll após pequeno delay
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  }, []);

  const { data: activePlan } = trpc.credits.activePlan.useQuery();
  const { data: savedStudies, refetch: refetchStudies } = trpc.studies.list.useQuery();
  const deleteStudyMutation = trpc.studies.delete.useMutation();
  const planId = activePlan?.plan.id || 180001; // FREE plan ID
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
    const dbName = toolIdToDbName[toolId] || toolId;
    if (!availableToolIds.has(dbName)) {
      setShowNoCreditsModal(true);
      return;
    }
    // Scroll para o topo antes de navegar
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLocation(`/tool/${toolId}`);
  };

  return (
    <div className="dashboard-container min-h-screen bg-gradient-radial from-[#d4af37] via-[#DAA520] to-[#FFFACD]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1e3a5f] shadow-lg border-b-4 border-[#d4af37]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
                <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 object-contain" loading="lazy" />
                {/* Título completo para desktop */}
                <h1 className="hidden md:block text-3xl font-bold text-[#d4af37]">{APP_TITLE}</h1>
                {/* Título curto para mobile */}
                <h1 className="block md:hidden text-3xl font-bold text-[#d4af37]">GNOSIS AI</h1>
              </span>
            </Link>
            
            {/* Ícone de Perfil e Menu Hambúrguer */}
            <div className="flex items-center gap-3">
              {/* Ícone de Perfil (Bonequinho) */}
              <Link href="/perfil">
                <button className="p-2 text-[#d4af37] hover:bg-[#2a4a7f] rounded-lg transition-colors" aria-label="Meu Perfil">
                  <User className="w-6 h-6" />
                </button>
              </Link>
              
              {/* Menu Hambúrguer */}
              <DashboardMobileMenu 
                user={user}
                onLogout={() => {
                  logout();
                  setLocation("/");
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Subscription Warning Banner */}
      <SubscriptionWarningBanner />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar - Credits Panel */}
          <div className="lg:col-span-1">
            <CreditsPanel onNeedCredits={() => setShowNoCreditsModal(true)} />
            
            {/* Saved Studies Section */}
            <div className="mt-6">
              <SavedStudiesSection />
            </div>
          </div>

          {/* Main Content - Tools */}
          <div className="lg:col-span-3">

            {/* Welcome Section */}
            <div className="bg-white/90 rounded-2xl p-6 md:p-8 shadow-xl border-4 border-[#d4af37] mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-2">
                Bem-vindo ao Dashboard
              </h2>
              <p className="text-lg text-[#8b6f47]">
                Escolha uma ferramenta abaixo para começar seus estudos bíblicos profundos.
              </p>
              <div className="mt-4 p-4 bg-[#FFFACD] rounded-lg border-2 border-[#d4af37]">
                <p className="text-sm text-[#8b6f47]">
                  <strong>Plano Atual:</strong> {activePlan?.plan.displayName || "FREE"}
                  {user?.role === 'admin' || user?.role === 'super_admin' ? (
                    <span className="ml-2 px-2 py-0.5 bg-[#d4af37] text-white text-xs font-bold rounded">ADMIN</span>
                  ) : null}
                  {" • "}
                  <strong>Ferramentas Disponíveis:</strong> {availableToolIds.size} de 18
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

