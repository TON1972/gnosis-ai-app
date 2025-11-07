import { useState } from "react";
import { ChevronLeft, ChevronRight, X, BookOpen, Search, Save, Share2, CreditCard, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
}

const slides: Slide[] = [
  {
    icon: <BookOpen className="w-16 h-16 text-[#d4af37]" />,
    title: "Bem-vindo à GNOSIS AI! 👋",
    description: "Olá! Sou a Rebeca, sua assistente virtual. Vou te mostrar como usar nossa plataforma de estudos bíblicos com inteligência artificial. É super simples!",
    highlight: "Navegue pelas setas ou clique nos indicadores abaixo"
  },
  {
    icon: <Search className="w-16 h-16 text-[#d4af37]" />,
    title: "18 Ferramentas Poderosas 🔧",
    description: "No Dashboard, você encontra ferramentas como Hermenêutica, Traduções, Análise Teológica, Apologética Avançada e muito mais. Escolha a ferramenta, digite seu tema e clique em 'Gerar Estudo'.",
    highlight: "Cada ferramenta consome créditos - veja o custo antes de usar"
  },
  {
    icon: <Save className="w-16 h-16 text-[#d4af37]" />,
    title: "Seus Estudos Salvos 📚",
    description: "Todos os estudos gerados ficam salvos automaticamente na seção 'Meus Estudos' do Dashboard. Você pode visualizar, editar e organizar tudo em um só lugar!",
    highlight: "Nunca perca seus estudos - tudo fica guardado para você"
  },
  {
    icon: <Share2 className="w-16 h-16 text-[#d4af37]" />,
    title: "Compartilhe em Redes Sociais 📱",
    description: "Clique em 'Compartilhar' em qualquer estudo e escolha: WhatsApp, Facebook, Twitter, LinkedIn, Instagram ou TikTok. Seu estudo será enviado completo com a assinatura GNOSIS AI!",
    highlight: "Espalhe conhecimento bíblico com facilidade"
  },
  {
    icon: <TrendingUp className="w-16 h-16 text-[#d4af37]" />,
    title: "Upgrade de Plano 🚀",
    description: "Precisa de mais ferramentas? Clique em 'Upgrade de Plano' no Dashboard. Escolha entre Aliança (10 ferramentas), Lumen (18 ferramentas) ou Premium (18 ferramentas + mais créditos).",
    highlight: "Planos anuais têm 16,5% de desconto!"
  },
  {
    icon: <CreditCard className="w-16 h-16 text-[#d4af37]" />,
    title: "Créditos Avulsos 💳",
    description: "Acabaram os créditos? Sem problemas! Clique em 'Comprar Créditos' no painel superior. Escolha o pacote (500, 1.500, 2.500 ou 5.000 créditos) e pague via PIX ou Cartão.",
    highlight: "Créditos avulsos nunca expiram!"
  }
];

export default function TutorialCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative bg-gradient-to-br from-[#1e3a5f] to-[#0f1f3a] rounded-3xl shadow-2xl p-8 md:p-12 border-4 border-[#d4af37]">
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-[#d4af37] hover:text-[#B8860B] transition-colors"
        aria-label="Fechar tutorial"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Slide Content */}
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Icon */}
        <div className="bg-white/10 rounded-full p-6">
          {slides[currentSlide].icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-bold text-[#d4af37]">
          {slides[currentSlide].title}
        </h3>

        {/* Description */}
        <p className="text-white text-lg md:text-xl max-w-2xl leading-relaxed">
          {slides[currentSlide].description}
        </p>

        {/* Highlight */}
        <div className="bg-[#d4af37]/20 border-2 border-[#d4af37] rounded-xl p-4 max-w-xl">
          <p className="text-[#d4af37] font-semibold text-sm md:text-base">
            💡 {slides[currentSlide].highlight}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {/* Previous Button */}
        <Button
          onClick={prevSlide}
          variant="outline"
          size="icon"
          className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#1e3a5f]"
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        {/* Indicators */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-[#d4af37] w-8"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          onClick={nextSlide}
          variant="outline"
          size="icon"
          className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#1e3a5f]"
          disabled={currentSlide === slides.length - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress */}
      <div className="text-center mt-6">
        <p className="text-white/70 text-sm">
          {currentSlide + 1} de {slides.length}
        </p>
      </div>
    </div>
  );
}

