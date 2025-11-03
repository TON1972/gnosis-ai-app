import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { useState } from "react";
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
  { name: "Linha do Tempo Teológica", free: false, alianca: false, lumen: true, premium: true }
];

const plans = [
  {
    name: "FREE",
    price: "Gratuito",
    priceValue: 0,
    creditsInitial: "500 créditos iniciais",
    creditsDaily: "50 créditos/dia",
    tools: "6 ferramentas básicas",
    planKey: "free" as const,
    highlight: false
  },
  {
    name: "Aliança",
    price: "R$ 18,98",
    priceValue: 18.98,
    period: "/mês",
    creditsInitial: "1.500 créditos iniciais*",
    creditsDaily: "100 créditos/dia",
    tools: "10 ferramentas",
    planKey: "alianca" as const,
    highlight: false
  },
  {
    name: "Lumen",
    price: "R$ 33,98",
    priceValue: 33.98,
    period: "/mês",
    creditsInitial: "3.000 créditos iniciais*",
    creditsDaily: "200 créditos/dia",
    tools: "Todas as 17 ferramentas",
    planKey: "lumen" as const,
    highlight: true
  },
  {
    name: "GNOSIS Premium",
    price: "R$ 62,98",
    priceValue: 62.98,
    period: "/mês",
    creditsInitial: "6.000 créditos iniciais*",
    creditsDaily: "300 créditos/dia",
    tools: "Todas as 17 ferramentas",
    planKey: "premium" as const,
    highlight: false,
    premium: true
  }
];

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  // Calcula preço anual com 16,6% desconto
  const getYearlyPrice = (monthly: number) => {
    const yearly = monthly * 12;
    const discount = yearly * 0.166;
    return (yearly - discount).toFixed(2);
  };
  
  const getDisplayPrice = (plan: typeof plans[number]) => {
    if (plan.priceValue === 0) return plan.price;
    if (billingPeriod === 'yearly') {
      return `R$ ${getYearlyPrice(plan.priceValue)}`;
    }
    return plan.price;
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
    <div className="min-h-screen bg-gradient-radial from-[#d4af37] via-[#DAA520] to-[#FFFACD]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1e3a5f] shadow-lg border-b-4 border-[#d4af37]">
        <div className="container mx-auto px-4 py-1 md:py-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 md:gap-2">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-12 md:h-16 md:w-16 object-contain" />
              <h1 className="text-xl md:text-3xl font-bold text-[#d4af37]">{APP_TITLE}</h1>
            </div>
            
            {/* Passagem Bíblica */}
            <div className="hidden xl:block text-[#d4af37] text-xs italic max-w-md text-right">
              <p className="leading-relaxed">
                ¹⁴ Por causa disto me ponho de joelhos perante o Pai de nosso Senhor Jesus Cristo,
                ¹⁵ Do qual toda a família nos céus e na terra toma o nome,
                ¹⁶ Para que, segundo as riquezas da sua glória, vos conceda que sejais fortalecidos com poder pelo seu Espírito no homem interior;
                ¹⁷ Para que Cristo habite pela fé nos vossos corações; a fim de, estando enraizados e fundados em amor,
                ¹⁸ Poderdes perfeitamente compreender, com todos os santos, qual seja a largura, e o comprimento, e a altura, e a profundidade,
                ¹⁹ E conhecer o amor de Cristo, que excede todo o entendimento, para que sejais cheios de toda a plenitude de Deus.
              </p>
              <p className="mt-2 font-semibold">(Efésios 3:14-19)</p>
            </div>
            
            <nav className="flex items-center gap-2 md:gap-4 flex-wrap">
              <Link href="/faq">
                <span className="text-[#d4af37] hover:text-[#B8860B] transition-colors cursor-pointer">
                  PERGUNTAS FREQUENTES
                </span>
              </Link>
              {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') && (
                <Link href="/admin">
                  <span className="text-[#d4af37] hover:text-[#B8860B] transition-colors cursor-pointer font-bold">
                    ADMIN
                  </span>
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <span className="px-4 py-2 text-[#d4af37] hover:text-[#B8860B] transition-colors font-semibold cursor-pointer">
                      PAINEL DE CONTROLE
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
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#1e3a5f] mb-6">
            Estudos Bíblicos Profundos com IA
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-[#8b6f47] mb-8 leading-relaxed">
            Explore as Escrituras com ferramentas avançadas de inteligência artificial, 
            desenvolvidas especialmente para pastores, teólogos e estudantes de seminário.
          </p>
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
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              size="lg"
              className="bg-[#1e3a5f] text-[#d4af37] hover:bg-[#2a4a7f] text-xl px-12 py-6 rounded-xl shadow-2xl"
            >
              Começar Agora
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Tools Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1e3a5f] text-center mb-8 md:mb-12">
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
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1e3a5f] text-center mb-4">
          Escolha Seu Plano
        </h3>
        
        {/* Billing Period Toggle */}
        <div className="flex justify-center items-center gap-4 mb-6">
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
              -16,6%
            </span>
          </button>
        </div>
        
        <p className="text-base md:text-lg lg:text-xl text-[#8b6f47] text-center mb-8 md:mb-12">
          * Créditos iniciais dos planos pagos são renovados a cada 30 dias
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
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
                  {getDisplayPrice(plan)}
                </span>
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

      {/* FAQ Button Section */}
      <section className="container mx-auto px-4 py-8">
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
    </div>
  );
}

