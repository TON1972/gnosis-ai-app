import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import VersePopup from "@/components/VersePopup";
import TutorialCarousel from "@/components/TutorialCarousel";
import MobileMenu from "@/components/MobileMenu";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import React, { useState, useEffect } from "react";
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
  Crown,
  Gift,
  ShoppingCart
} from "lucide-react";

const mainTools = [
  {
    icon: <BookOpen className="w-8 h-8" />,
    name: "Hermenêutica",
    description: "Análise profunda de contexto histórico, cultural e literário de passagens bíblicas"
  },
  {
    icon: <Languages className="w-8 h-8" />,
    name: "Traduções",
    description: "Análise de palavras originais em Hebraico, Aramaico e Grego com nuances linguísticas"
  },
  {
    icon: <FileText className="w-8 h-8" />,
    name: "Resumos",
    description: "Sínteses personalizadas de passagens, capítulos ou livros inteiros da Bíblia"
  },
  {
    icon: <Presentation className="w-8 h-8" />,
    name: "Esboços de Pregação",
    description: "Estruturas completas para sermões e mensagens com pontos-chave e aplicações práticas"
  },
  {
    icon: <BookMarked className="w-8 h-8" />,
    name: "Estudos Doutrinários",
    description: "Análises teológicas profundas sobre doutrinas específicas com fundamentação bíblica"
  },
  {
    icon: <Scale className="w-8 h-8" />,
    name: "Análise Teológica Comparada",
    description: "Comparação detalhada entre diferentes correntes teológicas e tradições cristãs"
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    name: "Exegese",
    description: "Interpretação crítica e detalhada verso por verso com análise exegética completa"
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    name: "Teologia Sistemática",
    description: "Estudo organizado e estruturado de temas teológicos sistemáticos"
  },
  {
    icon: <Mic className="w-8 h-8" />,
    name: "Linguagem Ministerial",
    description: "Análise retórica e teológica de discursos, sermões e mensagens ministeriais"
  },
  {
    icon: <Scale className="w-8 h-8" />,
    name: "Apologética Avançada",
    description: "Defesa racional da fé cristã com argumentos filosóficos, históricos e científicos",
    mobileOnly: true
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    name: "Escatologia Bíblica",
    description: "Análise escatológica profunda com rigor acadêmico em nível de doutorado",
    mobileOnly: true
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
  { name: "Estudos Doutrinários", free: true, alianca: true, lumen: true, premium: true },
  { name: "Análise Teológica Comparada", free: true, alianca: true, lumen: true, premium: true },
  { name: "Teologia Sistemática", free: false, alianca: true, lumen: true, premium: true },
  { name: "Contextualização Brasileira", free: false, alianca: true, lumen: true, premium: true },
  { name: "Exegese Avançada", free: false, alianca: false, lumen: true, premium: true },
  { name: "Religiões Comparadas", free: false, alianca: true, lumen: true, premium: true },
  { name: "Referências ABNT/APA", free: false, alianca: false, lumen: true, premium: true },
  { name: "Linguagem Ministerial", free: false, alianca: true, lumen: true, premium: true },
  { name: "Redação Acadêmica", free: false, alianca: false, lumen: true, premium: true },
  { name: "Dados Demográficos", free: false, alianca: false, lumen: true, premium: true },
  { name: "Transcrição de Mídia", free: false, alianca: false, lumen: true, premium: true },
  { name: "Patrística", free: false, alianca: false, lumen: true, premium: true },
  { name: "Linha do Tempo Teológica", free: false, alianca: false, lumen: true, premium: true },
  { name: "Apologética Avançada", free: false, alianca: false, lumen: true, premium: true },
  { name: "Escatologia Bíblica", free: false, alianca: false, lumen: true, premium: true }
];

const plans = [
  {
    name: "FREE",
    price: "Gratuito",
    priceValue: 0,
    creditsInitial: "500 créditos iniciais",
    creditsDaily: "50 créditos/dia",
    tools: "6 de 18 ferramentas disponíveis",
    planKey: "free" as const,
    highlight: false
  },
  {
    name: "Aliança",
    price: "R$ 19,98",
    priceValue: 19.98,
    period: "/mês",
    creditsInitial: "1.500 créditos iniciais*",
    creditsDaily: "100 créditos/dia",
    tools: "10 de 18 ferramentas disponíveis",
    planKey: "alianca" as const,
    highlight: false
  },
  {
    name: "Lumen",
    price: "R$ 36,98",
    priceValue: 36.98,
    period: "/mês",
    creditsInitial: "3.000 créditos iniciais*",
    creditsDaily: "200 créditos/dia",
    tools: "Todas as 18 ferramentas",
    planKey: "lumen" as const,
    highlight: true
  },
  {
    name: "GNOSIS Premium",
    price: "R$ 68,98",
    priceValue: 68.98,
    period: "/mês",
    creditsInitial: "6.000 créditos iniciais*",
    creditsDaily: "300 créditos/dia",
    tools: "Todas as 18 ferramentas",
    planKey: "premium" as const,
    highlight: false,
    premium: true
  }
];

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: activePlan } = trpc.credits.activePlan.useQuery(undefined, { enabled: isAuthenticated });
  const [, setLocation] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  
  // Scroll para o topo quando a página carregar (método robusto)
  useEffect(() => {
    // Método 1: Scroll imediato
    window.scrollTo(0, 0);
    // Método 2: Forçar scroll após pequeno delay (garante que DOM está pronto)
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  }, []);
  
  // Calcula preço anual com 16,5% desconto
  const getYearlyPrice = (monthly: number) => {
    const yearly = monthly * 12;
    const discount = yearly * 0.165;
    return (yearly - discount).toFixed(2);
  };
  
  const getDisplayPrice = (plan: typeof plans[number]) => {
    if (plan.priceValue === 0) return { main: plan.price, multiplier: null };
    if (billingPeriod === 'yearly') {
      // Calcula valor mensal COM desconto de 16,5%
      const yearlyTotal = parseFloat(getYearlyPrice(plan.priceValue));
      const monthlyWithDiscount = (yearlyTotal / 12).toFixed(2).replace('.', ',');
      return { main: `R$ ${monthlyWithDiscount}`, multiplier: 'x 12' };
    }
    return { main: plan.price, multiplier: null };
  };
  
  const getDisplayPeriod = (plan: typeof plans[number]) => {
    if (plan.priceValue === 0) return '';
    return billingPeriod === 'yearly' ? '/ano' : '/mês';
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="public-page min-h-screen bg-gradient-radial from-[#d4af37] via-[#DAA520] to-[#FFFACD]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1e3a5f] shadow-lg border-b-4 border-[#d4af37]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 object-contain" loading="lazy" />
              {/* Título completo para desktop */}
              <h1 className="hidden md:block text-3xl font-bold text-[#d4af37]">{APP_TITLE}</h1>
              {/* Título curto para mobile */}
              <h1 className="block md:hidden text-3xl font-bold text-[#d4af37]">GNOSIS AI</h1>
            </div>
            
            {/* Menu Hambúrguer (Desktop e Mobile) */}
            <MobileMenu 
              isAuthenticated={isAuthenticated}
              onLogout={logout}
              loginUrl={getLoginUrl()}
              user={user}
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#1e3a5f] mb-6">
            Estudos Bíblicos Profundos com IA
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-[#8b6f47] mb-8 leading-relaxed">
            Explore as Escrituras com ferramentas avançadas de inteligência artificial, 
            desenvolvidas especialmente para pastores, teólogos e estudantes de seminário.
          </p>
          
          {/* Tutorial Carousel */}
          <div className="mb-12">
            <TutorialCarousel />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/faq">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-[#d4af37] text-lg px-8 py-6 rounded-xl shadow-xl"
              >
                Perguntas Frequentes
              </Button>
            </Link>
            <Link href="/planos">
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                size="lg"
                className="bg-[#1e3a5f] text-[#d4af37] hover:bg-[#2a4a7f] text-xl px-12 py-6 rounded-xl shadow-2xl"
              >
                Começar Agora
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Tools Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1e3a5f] text-center mb-8 md:mb-12">
          Ferramentas Principais
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
          {mainTools.map((tool, index) => {
            // Esconder Apologética Avançada em desktop
            const isMobileOnly = (tool as any).mobileOnly;
            return (
              <div
                key={index}
                className={`bg-white/90 rounded-2xl p-8 shadow-xl border-4 border-[#d4af37] hover:scale-105 transition-transform ${
                  isMobileOnly ? 'block md:hidden' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                  <div className="p-3 bg-[#1e3a5f] rounded-lg text-[#d4af37]">
                    {tool.icon}
                  </div>
                  <h4 className="text-sm md:text-xl font-bold text-[#1e3a5f] text-center md:text-left">{tool.name}</h4>
                </div>
                <p className="text-[#8b6f47]">{tool.description}</p>
              </div>
            );
          })}
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
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="bg-white/90 rounded-2xl p-6 md:p-12 shadow-2xl border-4 border-[#d4af37] max-w-5xl mx-auto">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1e3a5f] text-center mb-6 md:mb-8">
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
      <section id="planos" className="container mx-auto px-4 py-8 md:py-16">
        <h3 className="hidden md:block text-2xl md:text-3xl lg:text-4xl font-bold text-[#1e3a5f] text-center mb-4">
          Escolha Seu Plano
        </h3>
        
        {/* Billing Period Toggle */}
        <div className="hidden md:flex justify-center items-center gap-4 mb-6">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-[#1e3a5f] text-[#d4af37] shadow-lg scale-105'
                : 'bg-white/80 text-[#8b6f47] hover:bg-white'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
              billingPeriod === 'yearly'
                ? 'bg-[#1e3a5f] text-[#d4af37] shadow-lg scale-105'
                : 'bg-white/80 text-[#8b6f47] hover:bg-white'
            }`}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-[#d4af37] text-[#1e3a5f] text-xs px-2 py-1 rounded-full font-bold">
              -16,5%
            </span>
          </button>
        </div>
        
        <p className="hidden md:block text-base md:text-lg lg:text-xl text-[#8b6f47] text-center mb-8 md:mb-12">
          * Créditos iniciais dos planos pagos são renovados a cada 30 dias
        </p>
        
        {/* Mensagem promocional - apenas para visitantes e usuários FREE */}
        {(!isAuthenticated || !activePlan || activePlan.plan.name === 'free') && (
          <div className="mb-8 text-center">
            <style>{`
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
              }
              .blink-animation {
                animation: blink 1.5s ease-in-out infinite;
              }
            `}</style>
            {/* Texto para Mobile */}
            <p className="blink-animation md:hidden text-xl font-bold text-red-600 bg-yellow-100 border-4 border-red-500 rounded-lg py-4 px-6 inline-block shadow-lg">
              🎉 CLIQUE ABAIXO E APROVEITE OS VALORES PROMOCIONAIS DE FINAL DE ANO, OU PARA USAR FREE SE PREFERIR! 🎉
            </p>
            {/* Texto para Desktop */}
            <p className="blink-animation hidden md:inline-block text-2xl font-bold text-red-600 bg-yellow-100 border-4 border-red-500 rounded-lg py-4 px-6 shadow-lg">
              🎉 ESSES SÃO VALORES PROMOCIONAIS DE FINAL DE ANO, APROVEITE A OPORTUNIDADE! 🎉
            </p>
            
            {/* Botão Planos e Preços */}
            <div className="mt-6">
              <Link href="/planos">
                <span className="inline-flex items-center gap-2 px-8 py-4 bg-[#d4af37] md:bg-[#d4af37] bg-gradient-to-r from-red-500 to-red-600 md:from-[#d4af37] md:to-[#d4af37] text-white md:text-[#1e3a5f] rounded-xl font-bold text-lg hover:bg-[#B8860B] transition-colors shadow-lg cursor-pointer">
                  PLANOS E PREÇOS
                </span>
              </Link>
            </div>
          </div>
        )}
        
        <div id="pricing-grid" className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
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
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 bg-[#1e3a5f] text-[#d4af37] px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-bold whitespace-nowrap">
                  MAIS POPULAR
                </div>
              )}
              {plan.premium && (
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 bg-[#d4af37] text-[#1e3a5f] px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-bold flex items-center gap-1 whitespace-nowrap">
                  <Crown className="w-3 h-3 md:w-4 md:h-4" />
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
                  {getDisplayPrice(plan).main}
                </span>
                {getDisplayPrice(plan).multiplier && (
                  <span className={`text-lg ml-1 ${
                    plan.highlight || plan.premium ? "text-white/60" : "text-[#8b6f47]/60"
                  }`}>
                    {getDisplayPrice(plan).multiplier}
                  </span>
                )}
                {plan.priceValue > 0 && (
                  <span className={`text-lg ${
                    plan.highlight || plan.premium ? "text-white/80" : "text-[#8b6f47]"
                  }`}>
                    {getDisplayPeriod(plan)}
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
                onClick={() => {
                  if (plan.priceValue === 0) {
                    window.location.href = getLoginUrl();
                  } else {
                    // Redirecionar para checkout (será implementado)
                    window.location.href = getLoginUrl();
                  }
                }}
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

      {/* FAQ Button Section - Desktop only */}
      <section className="hidden md:block container mx-auto px-4 py-8">
        <div className="text-center">
          <Link href="/faq">
            <Button
              size="lg"
              className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#B8860B] text-xl px-12 py-6 rounded-xl shadow-2xl"
            >
              Perguntas Frequentes
            </Button>
          </Link>
        </div>
      </section>

      {/* Bonus Credits Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="bg-gradient-to-br from-[#FFFACD] to-[#F0E68C] rounded-2xl p-6 md:p-12 shadow-2xl border-4 border-[#d4af37] max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 md:mb-12">
            <Gift className="w-12 h-12 md:w-16 md:h-16 text-[#d4af37] mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1e3a5f] mb-4">
              Acabaram Seus Créditos?
            </h3>
            {/* Mobile version */}
            <p className="md:hidden text-lg text-[#8b6f47] font-semibold">
              Compre Créditos Avulso!
            </p>
            {/* Desktop version */}
            <p className="hidden md:block text-xl text-[#8b6f47] font-semibold">
              Faça um Upgrade de Plano ou Compre Créditos Avulso!
            </p>
            {/* PIX Message */}
            <div className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg inline-block shadow-lg">
              <p className="text-base md:text-lg font-bold">
                💸 OPÇÃO DE COMPRA DE CRÉDITOS AVULSO POR PIX LIBERADO, MAIS RÁPIDO E PRÁTICO!
              </p>
            </div>
            
            {/* Botão Comprar Créditos - Mobile only */}
            <div className="md:hidden mt-6 flex justify-center">
              <Button
                onClick={() => setShowBuyCreditsModal(true)}
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 text-sm px-8 py-4 rounded-lg shadow-xl font-bold flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                COMPRAR CRÉDITOS AVULSO
              </Button>
            </div>
          </div>

          {/* Credits Packages */}
          <div id="credits-grid" className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Package 1 - 500 credits */}
            <div className="bg-white/90 rounded-xl p-6 shadow-lg border-3 border-[#d4af37] relative">
              <div className="text-center mb-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#d4af37]" />
                <p className="text-3xl font-bold text-[#1e3a5f]">
                  500
                </p>
                <p className="text-sm text-[#8b6f47]">
                  créditos
                </p>
              </div>
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-[#1e3a5f]">
                  R$ 9,90
                </p>
                <p className="text-xs text-[#8b6f47]">
                  R$ 0,0198/crédito
                </p>
              </div>
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="w-full bg-[#1e3a5f] text-[#d4af37] hover:bg-[#2a4a7f]"
              >
                Comprar
              </Button>
            </div>

            {/* Package 2 - 1500 credits (POPULAR) */}
            <div className="bg-white/95 rounded-xl p-6 shadow-lg border-4 border-[#d4af37] relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#d4af37] text-[#1e3a5f] px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <div className="text-center mb-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#d4af37]" />
                <p className="text-3xl font-bold text-[#1e3a5f]">
                  1.500
                </p>
                <p className="text-sm text-[#8b6f47]">
                  créditos
                </p>
              </div>
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-[#1e3a5f]">
                  R$ 24,90
                </p>
                <p className="text-xs text-[#8b6f47]">
                  R$ 0,0166/crédito
                </p>
              </div>
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="w-full bg-[#1e3a5f] text-[#d4af37] hover:bg-[#2a4a7f]"
              >
                Comprar
              </Button>
            </div>

            {/* Package 3 - 2500 credits */}
            <div className="bg-white/90 rounded-xl p-6 shadow-lg border-3 border-[#d4af37] relative">
              <div className="text-center mb-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#d4af37]" />
                <p className="text-3xl font-bold text-[#1e3a5f]">
                  2.500
                </p>
                <p className="text-sm text-[#8b6f47]">
                  créditos
                </p>
              </div>
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-[#1e3a5f]">
                  R$ 39,90
                </p>
                <p className="text-xs text-[#8b6f47]">
                  R$ 0,0160/crédito
                </p>
              </div>
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="w-full bg-[#1e3a5f] text-[#d4af37] hover:bg-[#2a4a7f]"
              >
                Comprar
              </Button>
            </div>

            {/* Package 4 - 5000 credits (MELHOR VALOR) */}
            <div className="bg-gradient-to-br from-[#d4af37] to-[#B8860B] rounded-xl p-6 shadow-lg border-3 border-[#1e3a5f] relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#1e3a5f] text-[#d4af37] px-3 py-1 rounded-full text-xs font-bold">
                MELHOR VALOR
              </div>
              <div className="text-center mb-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-white" />
                <p className="text-3xl font-bold text-white">
                  5.000
                </p>
                <p className="text-sm text-white/80">
                  créditos
                </p>
              </div>
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-white">
                  R$ 69,90
                </p>
                <p className="text-xs text-white/70">
                  R$ 0,0140/crédito
                </p>
              </div>
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="w-full bg-white text-[#1e3a5f] hover:bg-gray-100"
              >
                Comprar
              </Button>
            </div>
          </div>

          {/* Info Text */}
          <div className="text-center mt-6 md:mt-8">
            <p className="text-sm md:text-base text-[#8b6f47]">
              <strong>Créditos avulsos nunca expiram</strong> e podem ser usados em qualquer plano!
            </p>
          </div>
          
          {/* FAQ Button - Mobile only (repositioned) */}
          <div className="md:hidden mt-8 flex justify-center">
            <Link href="/faq">
              <Button
                size="lg"
                className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#B8860B] text-xl px-12 py-6 rounded-xl shadow-2xl"
              >
                Perguntas Frequentes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brazilian Context Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="bg-white/90 rounded-2xl p-6 md:p-12 shadow-2xl border-4 border-[#d4af37] max-w-5xl mx-auto text-center">
          <Globe className="w-12 h-12 md:w-16 md:h-16 text-[#d4af37] mx-auto mb-4 md:mb-6" />
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1e3a5f] mb-4 md:mb-6">
            Contextualização Brasileira Exclusiva
          </h3>
          <p className="text-base md:text-lg lg:text-xl text-[#8b6f47] leading-relaxed">
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
                  <a href="#planos" className="text-[#B8860B] hover:text-[#d4af37] transition-colors">
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

      {/* Verse Pop-up */}
      <VersePopup />
      
      {/* Buy Credits Modal - Mobile only */}
      <BuyCreditsModal
        open={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
      />
    </div>
  );
}

