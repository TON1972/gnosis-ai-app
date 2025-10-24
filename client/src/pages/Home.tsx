import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
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
  ArrowRight,
  CheckCircle2,
  Crown
} from "lucide-react";

const mainTools = [
  {
    icon: <BookOpen className="w-8 h-8" />,
    name: "Hermenêutica",
    description: "Análise de contexto histórico, cultural e literário"
  },
  {
    icon: <Languages className="w-8 h-8" />,
    name: "Traduções",
    description: "Hebraico, Aramaico e Grego"
  },
  {
    icon: <FileText className="w-8 h-8" />,
    name: "Resumos",
    description: "Sínteses personalizadas de passagens"
  },
  {
    icon: <Presentation className="w-8 h-8" />,
    name: "Esboços de Pregação",
    description: "Estruturas completas para sermões"
  },
  {
    icon: <BookMarked className="w-8 h-8" />,
    name: "Estudos Doutrinários",
    description: "Análises teológicas profundas"
  },
  {
    icon: <Scale className="w-8 h-8" />,
    name: "Análise Teológica Comparada",
    description: "Comparação entre correntes teológicas"
  }
];

const theologians = [
  "Agostinho de Hipona",
  "Tomás de Aquino",
  "Martinho Lutero",
  "João Calvino",
  "John Wesley",
  "Karl Barth",
  "C.S. Lewis",
  "Dietrich Bonhoeffer",
  "N.T. Wright",
  "Timothy Keller"
];

const allTools = [
  { name: "Hermenêutica", free: true, alianca: true, lumen: true, premium: true },
  { name: "Traduções", free: true, alianca: true, lumen: true, premium: true },
  { name: "Resumos", free: true, alianca: true, lumen: true, premium: true },
  { name: "Esboços de Pregação", free: true, alianca: true, lumen: true, premium: true },
  { name: "Estudos Doutrinários", free: false, alianca: true, lumen: true, premium: true },
  { name: "Análise Teológica Comparada", free: false, alianca: true, lumen: true, premium: true },
  { name: "Teologia Sistemática", free: false, alianca: true, lumen: true, premium: true },
  { name: "Contextualização Brasileira", free: false, alianca: true, lumen: true, premium: true },
  { name: "Exegese Avançada", free: false, alianca: false, lumen: true, premium: true },
  { name: "Religiões Comparadas", free: false, alianca: false, lumen: true, premium: true },
  { name: "Referências ABNT/APA", free: false, alianca: false, lumen: true, premium: true },
  { name: "Linguagem Ministerial", free: false, alianca: false, lumen: true, premium: true },
  { name: "Redação Acadêmica", free: false, alianca: false, lumen: true, premium: true },
  { name: "Dados Demográficos", free: false, alianca: false, lumen: true, premium: true },
  { name: "Transcrição de Mídia", free: false, alianca: false, lumen: true, premium: true }
];

const plans = [
  {
    name: "FREE",
    price: "Gratuito",
    priceValue: 0,
    creditsInitial: "500 créditos iniciais",
    creditsDaily: "50 créditos/dia",
    tools: "4 ferramentas básicas",
    planKey: "free" as const,
    highlight: false
  },
  {
    name: "Aliança",
    price: "R$ 18,98",
    priceValue: 18.98,
    period: "/mês",
    creditsInitial: "1.500 créditos iniciais*",
    creditsDaily: "150 créditos/dia",
    tools: "8 ferramentas",
    planKey: "alianca" as const,
    highlight: false
  },
  {
    name: "Lumen",
    price: "R$ 33,98",
    priceValue: 33.98,
    period: "/mês",
    creditsInitial: "3.000 créditos iniciais*",
    creditsDaily: "300 créditos/dia",
    tools: "Todas as 15 ferramentas",
    planKey: "lumen" as const,
    highlight: true
  },
  {
    name: "GNOSIS Premium",
    price: "R$ 62,98",
    priceValue: 62.98,
    period: "/mês",
    creditsInitial: "8.000 créditos iniciais*",
    creditsDaily: "400 créditos/dia",
    tools: "Todas as 15 ferramentas",
    planKey: "premium" as const,
    highlight: false,
    premium: true
  }
];

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-[#d4af37] via-[#DAA520] to-[#FFFACD]">
      {/* Header */}
      <header className="bg-[#1e3a5f] shadow-lg border-b-4 border-[#d4af37]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 object-contain" />
              <h1 className="text-3xl font-bold text-[#d4af37]">{APP_TITLE}</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/faq">
                <span className="px-4 py-2 text-[#d4af37] hover:text-[#B8860B] transition-colors font-semibold cursor-pointer">
                  FAQ
                </span>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <span className="px-4 py-2 text-[#d4af37] hover:text-[#B8860B] transition-colors font-semibold cursor-pointer">
                      Dashboard
                    </span>
                  </Link>
                  <Button
                    onClick={() => logout()}
                    variant="outline"
                    className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#1e3a5f]"
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => window.location.href = getLoginUrl()}
                  className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#B8860B]"
                >
                  Entrar
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold text-[#1e3a5f] mb-6">
            Estudos Bíblicos Profundos com IA
          </h2>
          <p className="text-2xl text-[#8b6f47] mb-8 leading-relaxed">
            Explore as Escrituras com ferramentas avançadas de inteligência artificial, 
            desenvolvidas especialmente para pastores, teólogos e estudantes de seminário.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-[#1e3a5f] text-[#d4af37] hover:bg-[#2a4a7f] text-xl px-12 py-6 rounded-xl shadow-2xl"
          >
            Começar Agora
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </div>
      </section>

      {/* Main Tools Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-4xl font-bold text-[#1e3a5f] text-center mb-12">
          Ferramentas Principais
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {mainTools.map((tool, index) => (
            <div
              key={index}
              className="bg-white/90 rounded-2xl p-8 shadow-xl border-4 border-[#d4af37] hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#1e3a5f] rounded-lg text-[#d4af37]">
                  {tool.icon}
                </div>
                <h4 className="text-xl font-bold text-[#1e3a5f]">{tool.name}</h4>
              </div>
              <p className="text-[#8b6f47]">{tool.description}</p>
            </div>
          ))}
        </div>
        
        {/* Link to FAQ for more tools */}
        <div className="text-center mt-12">
          <Link href="/faq">
            <span className="inline-flex items-center gap-2 px-8 py-4 bg-[#d4af37] text-[#1e3a5f] rounded-xl font-bold text-lg hover:bg-[#B8860B] transition-colors shadow-lg cursor-pointer">
              <Sparkles className="w-6 h-6" />
              Entre outras poderosas ferramentas para estudos acadêmicos, clique aqui e veja!
              <ArrowRight className="w-6 h-6" />
            </span>
          </Link>
        </div>
      </section>

      {/* Theologians Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white/90 rounded-2xl p-12 shadow-2xl border-4 border-[#d4af37] max-w-5xl mx-auto">
          <h3 className="text-4xl font-bold text-[#1e3a5f] text-center mb-8">
            Fundamentada nos Mais Proeminentes Teólogos da História
          </h3>
          <p className="text-xl text-[#8b6f47] text-center mb-8">
            Nossa IA foi treinada com obras e pensamentos de renomados teólogos cristãos:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {theologians.map((theologian, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-[#FFFACD] rounded-lg border-2 border-[#d4af37]">
                <CheckCircle2 className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <span className="text-[#1e3a5f] font-semibold">{theologian}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-lg text-[#8b6f47] italic font-semibold">
            Entre muitos outros...
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-4xl font-bold text-[#1e3a5f] text-center mb-4">
          Escolha Seu Plano
        </h3>
        <p className="text-xl text-[#8b6f47] text-center mb-12">
          * Créditos iniciais dos planos pagos são renovados a cada 30 dias
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 shadow-2xl border-4 ${
                plan.highlight
                  ? "bg-gradient-to-br from-[#d4af37] to-[#B8860B] border-[#1e3a5f] scale-105"
                  : plan.premium
                  ? "bg-gradient-to-br from-[#1e3a5f] to-[#2a4a7f] border-[#d4af37]"
                  : "bg-white/90 border-[#d4af37]"
              } hover:scale-105 transition-transform relative`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#1e3a5f] text-[#d4af37] px-4 py-1 rounded-full text-sm font-bold">
                  MAIS POPULAR
                </div>
              )}
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#d4af37] text-[#1e3a5f] px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  PREMIUM
                </div>
              )}
              <h4 className={`text-2xl font-bold mb-4 ${
                plan.highlight || plan.premium ? "text-white" : "text-[#1e3a5f]"
              }`}>
                {plan.name}
              </h4>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${
                  plan.highlight || plan.premium ? "text-white" : "text-[#1e3a5f]"
                }`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-lg ${
                    plan.highlight || plan.premium ? "text-white/80" : "text-[#8b6f47]"
                  }`}>
                    {plan.period}
                  </span>
                )}
              </div>
              <div className="space-y-3 mb-6">
                <div className={`p-3 rounded-lg ${
                  plan.highlight || plan.premium ? "bg-white/20" : "bg-[#FFFACD]"
                }`}>
                  <p className={`font-semibold ${
                    plan.highlight || plan.premium ? "text-white" : "text-[#1e3a5f]"
                  }`}>
                    {plan.creditsInitial}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  plan.highlight || plan.premium ? "bg-white/20" : "bg-[#FFFACD]"
                }`}>
                  <p className={`font-semibold ${
                    plan.highlight || plan.premium ? "text-white" : "text-[#1e3a5f]"
                  }`}>
                    {plan.creditsDaily}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  plan.highlight || plan.premium ? "bg-white/20" : "bg-[#FFFACD]"
                }`}>
                  <p className={`font-semibold ${
                    plan.highlight || plan.premium ? "text-white" : "text-[#1e3a5f]"
                  }`}>
                    {plan.tools}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {allTools.map((tool, i) => {
                  const isAvailable = tool[plan.planKey];
                  return (
                    <li key={i} className="flex items-start gap-2">
                      {isAvailable ? (
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          plan.highlight || plan.premium ? "text-green-400" : "text-green-600"
                        }`} />
                      ) : (
                        <span className={`w-4 h-4 flex-shrink-0 mt-0.5 text-red-500 font-bold`}>×</span>
                      )}
                      <span className={`text-xs ${
                        plan.highlight || plan.premium 
                          ? isAvailable ? "text-white" : "text-white/50"
                          : isAvailable ? "text-[#1e3a5f]" : "text-gray-400"
                      }`}>
                        {tool.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <Button
                onClick={handleGetStarted}
                className={`w-full ${
                  plan.highlight
                    ? "bg-[#1e3a5f] text-[#d4af37] hover:bg-[#2a4a7f]"
                    : plan.premium
                    ? "bg-[#d4af37] text-[#1e3a5f] hover:bg-[#B8860B]"
                    : "bg-[#1e3a5f] text-[#d4af37] hover:bg-[#2a4a7f]"
                }`}
              >
                {plan.priceValue === 0 ? "Começar Grátis" : "Assinar Agora"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Brazilian Context Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white/90 rounded-2xl p-12 shadow-2xl border-4 border-[#d4af37] max-w-5xl mx-auto text-center">
          <Globe className="w-16 h-16 text-[#d4af37] mx-auto mb-6" />
          <h3 className="text-4xl font-bold text-[#1e3a5f] mb-6">
            Contextualização Brasileira Exclusiva
          </h3>
          <p className="text-xl text-[#8b6f47] leading-relaxed">
            Nossa ferramenta de Contextualização Brasileira oferece referências que os melhores 
            softwares estrangeiros não possuem. Desenvolvida especialmente para a realidade 
            brasileira, com corpus exclusivo sobre cultura, sociedade e religiosidade do Brasil.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e3a5f] text-[#d4af37] py-12 mt-16 border-t-4 border-[#d4af37]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Sobre</h4>
              <p className="text-[#B8860B]">
                GNOSIS AI é uma plataforma de estudos bíblicos profundos, 
                desenvolvida para pastores, teólogos e estudantes de seminário.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq">
                    <span className="text-[#B8860B] hover:text-[#d4af37] transition-colors cursor-pointer">
                      Perguntas Frequentes
                    </span>
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-[#B8860B] hover:text-[#d4af37] transition-colors">
                    Planos e Preços
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Contato</h4>
              <p className="text-[#B8860B]">
                Dúvidas ou sugestões? Entre em contato conosco.
              </p>
            </div>
          </div>
          <div className="text-center pt-8 border-t-2 border-[#d4af37]">
            <p className="text-lg">
              © 2025 {APP_TITLE} - Todos os direitos reservados
            </p>
            <p className="text-sm text-[#B8860B] mt-2">
              Aprofunde-se na Palavra com ferramentas de excelência
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

