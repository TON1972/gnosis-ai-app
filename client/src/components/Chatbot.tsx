import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  options?: { label: string; action: string }[];
}

const KNOWLEDGE_BASE = {
  greeting: {
    message: "Olá! 👋 Sou a Rebeca, assistente virtual da GNOSIS AI. Como posso ajudá-lo(a) hoje?",
    options: [
      { label: "📋 Informações sobre Planos", action: "planos" },
      { label: "💰 Dúvidas sobre Créditos", action: "creditos" },
      { label: "🔧 Como usar as Ferramentas", action: "ferramentas" },
      { label: "❓ Outras Dúvidas", action: "outras" },
      { label: "👋 Encerrar conversa", action: "encerrar" },
    ],
  },
  planos: {
    message: "Temos 4 planos disponíveis:\n\n**FREE** - Gratuito com 6 ferramentas básicas\n**ALIANÇA** - R$ 18,98/mês com 8 ferramentas\n**LUMEN** - R$ 33,98/mês com 12 ferramentas\n**GNOSIS PREMIUM** - R$ 62,98/mês com todas as 15 ferramentas\n\nO que você gostaria de saber?",
    options: [
      { label: "Diferenças entre planos", action: "diferencas_planos" },
      { label: "Como fazer upgrade", action: "upgrade" },
      { label: "Formas de pagamento", action: "pagamento" },
      { label: "Voltar ao menu", action: "menu" },
      { label: "👋 Encerrar conversa", action: "encerrar" },
    ],
  },
  creditos: {
    message: "Sobre o sistema de créditos:\n\n• Cada ferramenta consome créditos ao ser usada\n• Planos pagos recebem créditos iniciais + créditos diários\n• FREE: 500 iniciais + 50/dia\n• ALIANÇA: 1500 iniciais + 100/dia\n• LUMEN: 3000 iniciais + 200/dia\n• PREMIUM: 6000 iniciais + 300/dia\n\nQual sua dúvida específica?",
    options: [
      { label: "Como ganhar mais créditos", action: "ganhar_creditos" },
      { label: "Créditos expiram?", action: "expiracao_creditos" },
      { label: "Comprar créditos avulsos", action: "creditos_avulsos" },
      { label: "Voltar ao menu", action: "menu" },
      { label: "👋 Encerrar conversa", action: "encerrar" },
    ],
  },
  ferramentas: {
    message: "A GNOSIS AI oferece 15 ferramentas poderosas:\n\n**Básicas (FREE):**\n• Hermenêutica\n• Traduções\n• Resumos\n• Enfoques de Pregação\n• Estudos Doutrinários\n• Análise Teológica Comparada\n\n**Avançadas (planos pagos):**\n• Exegese\n• Teologia Sistemática\n• Linguagem Ministerial\n• E mais 6 ferramentas!\n\nSobre qual ferramenta você tem dúvida?",
    options: [
      { label: "Como usar uma ferramenta", action: "usar_ferramenta" },
      { label: "Custo em créditos", action: "custo_ferramentas" },
      { label: "Salvar estudos", action: "salvar_estudos" },
      { label: "Voltar ao menu", action: "menu" },
      { label: "👋 Encerrar conversa", action: "encerrar" },
    ],
  },
  outras: {
    message: "Outras dúvidas frequentes:\n\n• Posso testar antes de assinar?\n• Como funciona o período de graça?\n• Posso cancelar a qualquer momento?\n• Como entrar em contato com suporte?\n\nSelecione uma opção ou digite sua dúvida:",
    options: [
      { label: "Testar gratuitamente", action: "testar_gratis" },
      { label: "Cancelamento", action: "cancelamento" },
      { label: "Falar com suporte", action: "suporte" },
      { label: "Voltar ao menu", action: "menu" },
      { label: "👋 Encerrar conversa", action: "encerrar" },
    ],
  },
  diferencas_planos: {
    message: "**Principais diferenças:**\n\n**FREE** - 6 ferramentas básicas, 500+50 créditos\n**ALIANÇA** - 8 ferramentas, 1500+100 créditos\n**LUMEN** - 12 ferramentas, 3000+200 créditos\n**PREMIUM** - Todas as 15 ferramentas, 6000+300 créditos\n\nPlanos pagos incluem ferramentas avançadas como Exegese, Teologia Sistemática e Linguagem Ministerial.",
    options: [
      { label: "Ver página de planos", action: "ver_planos" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  upgrade: {
    message: "Para fazer upgrade:\n\n1. Faça login na plataforma\n2. Acesse seu Painel de Controle\n3. Clique em 'Escolher Plano' na seção de créditos\n4. Selecione o plano desejado\n5. Complete o pagamento via Mercado Pago\n\nO upgrade é instantâneo após confirmação do pagamento!",
    options: [
      { label: "Fazer login agora", action: "login" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  pagamento: {
    message: "Aceitamos pagamento via **Mercado Pago**:\n\n• Cartão de crédito\n• PIX\n• Boleto bancário\n\nTodos os pagamentos são processados de forma segura. Você receberá confirmação por email.",
    options: [
      { label: "Ver planos", action: "ver_planos" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  ganhar_creditos: {
    message: "Formas de ganhar créditos:\n\n1. **Créditos diários** - Renovam automaticamente todo dia\n2. **Upgrade de plano** - Planos superiores têm mais créditos\n3. **Compra avulsa** - Pacotes de créditos que nunca expiram\n4. **Renovação mensal** - Créditos iniciais renovam a cada 30 dias",
    options: [
      { label: "Comprar créditos avulsos", action: "creditos_avulsos" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  expiracao_creditos: {
    message: "**Sobre expiração:**\n\n✅ **Créditos diários** - Renovam todo dia (não acumulam)\n✅ **Créditos iniciais** - Renovam a cada 30 dias\n✅ **Créditos avulsos** - NUNCA expiram!\n\nOs créditos avulsos são permanentes e podem ser usados a qualquer momento.",
    options: [
      { label: "Comprar créditos avulsos", action: "creditos_avulsos" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  creditos_avulsos: {
    message: "Pacotes de créditos avulsos disponíveis:\n\n• 500 créditos - R$ 9,90\n• 1000 créditos - R$ 18,90\n• 2500 créditos - R$ 44,90\n\n**Vantagens:**\n✅ Nunca expiram\n✅ Podem ser usados em qualquer ferramenta\n✅ Complementam seus créditos do plano",
    options: [
      { label: "Comprar agora", action: "login" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  usar_ferramenta: {
    message: "Para usar uma ferramenta:\n\n1. Faça login na plataforma\n2. Acesse o Painel de Controle\n3. Clique na ferramenta desejada\n4. Digite ou cole o texto bíblico\n5. Clique em 'Analisar'\n\nO resultado aparecerá em segundos e você pode salvar ou baixar em PDF!",
    options: [
      { label: "Fazer login", action: "login" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  custo_ferramentas: {
    message: "Custo em créditos por ferramenta:\n\n**Básicas (50 créditos):**\nHermenêutica, Traduções, Resumos, etc.\n\n**Intermediárias (75 créditos):**\nExegese, Teologia Sistemática\n\n**Avançadas (100 créditos):**\nLinguagem Ministerial, Análise de Dados\n\nO custo é descontado apenas quando você usa a ferramenta.",
    options: [
      { label: "Ver todas as ferramentas", action: "ferramentas" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  salvar_estudos: {
    message: "Você pode salvar até **100 estudos** no seu histórico!\n\n✅ Acesso rápido aos estudos salvos\n✅ Download em PDF a qualquer momento\n✅ Organização automática por data\n✅ Scroll completo para visualizar todos\n\nTodos os planos (incluindo FREE) têm esse benefício!",
    options: [
      { label: "Acessar meu histórico", action: "login" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  testar_gratis: {
    message: "Sim! Você pode testar gratuitamente:\n\n✅ Crie uma conta FREE (sem cartão)\n✅ Acesse 6 ferramentas básicas\n✅ Receba 500 créditos iniciais + 50/dia\n✅ Experimente todas as funcionalidades\n\nSem compromisso, sem cobrança automática!",
    options: [
      { label: "Criar conta grátis", action: "login" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  cancelamento: {
    message: "Sobre cancelamento:\n\n✅ Pode cancelar a qualquer momento\n✅ Sem multas ou taxas\n✅ Acesso até o fim do período pago\n✅ Créditos avulsos permanecem disponíveis\n\nPara cancelar, acesse Configurações > Assinatura no seu painel.",
    options: [
      { label: "Acessar painel", action: "login" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  suporte: {
    message: "", // Will be set dynamically based on time
    options: [
      { label: "Fornecer dados de contato", action: "capture_contact" },
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
  ver_planos: {
    message: "Redirecionando você para a página de planos...",
    options: [],
  },
  login: {
    message: "Redirecionando você para fazer login...",
    options: [],
  },
  encerrar: {
    message: "✨ Espero ter ajudado! Se precisar de mais alguma coisa, é só chamar. Shalom! ✨",
    options: [
      { label: "Voltar ao menu", action: "menu" },
    ],
  },
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [contactFormActive, setContactFormActive] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const saveContactMutation = trpc.chatbot.saveContact.useMutation({
    onSuccess: () => {
      toast.success("Dados enviados com sucesso! Nossa equipe entrará em contato em breve.");
      setContactFormActive(false);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      
      // Show confirmation message
      addMessage("bot", "✅ Obrigado! Seus dados foram enviados com sucesso. Nossa equipe entrará em contato em breve.\n\nEnquanto isso, você pode continuar navegando ou acessar nosso portal de suporte:", [
        { label: "Abrir portal de suporte", action: "abrir_suporte" },
        { label: "Voltar ao menu", action: "menu" },
      ]);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar dados. Por favor, tente novamente.");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleBotResponse("greeting");
    }
  }, [isOpen]);

  const addMessage = (type: "user" | "bot", content: string, options?: { label: string; action: string }[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      options,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const isBusinessHours = () => {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const hour = brazilTime.getHours();
    return hour >= 10 && hour < 18;
  };

  const handleBotResponse = (action: string) => {
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      let response = KNOWLEDGE_BASE[action as keyof typeof KNOWLEDGE_BASE];
      
      // Handle support action with business hours check
      if (action === "suporte") {
        const inBusinessHours = isBusinessHours();
        response = {
          ...response,
          message: inBusinessHours
            ? "🕒 **Horário de Atendimento: 10h às 18h**\n\nEstamos disponíveis agora! Para que possamos ajudá-lo melhor, por favor forneça seus dados de contato. Nossa equipe entrará em contato em breve!"
            : "🌙 **Horário de Atendimento: 10h às 18h**\n\nNo momento estamos fora do horário de atendimento.\n\n**Deixe a sua solicitação abaixo, que no primeiro horário amanhã nós retornaremos, Shalom!**",
        };
      }

      if (action === "menu") {
        const greeting = KNOWLEDGE_BASE.greeting;
        addMessage("bot", greeting.message, greeting.options);
      } else if (action === "capture_contact") {
        setContactFormActive(true);
        addMessage("bot", "Por favor, preencha os campos abaixo para que possamos entrar em contato:");
      } else if (action === "ver_planos") {
        addMessage("bot", response.message);
        setTimeout(() => {
          window.location.href = "/#planos";
        }, 1000);
      } else if (action === "login") {
        addMessage("bot", response.message);
        setTimeout(() => {
          const loginUrl = `${import.meta.env.VITE_OAUTH_PORTAL_URL}/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + "/api/oauth/callback")}&response_type=code`;
          window.location.href = loginUrl;
        }, 1000);
      } else if (action === "abrir_suporte") {
        addMessage("bot", "Abrindo portal de suporte em nova aba...");
        setTimeout(() => {
          window.open("https://help.manus.im", "_blank");
        }, 1000);
      } else if (action === "encerrar") {
        addMessage("bot", response.message, response.options);
        // Auto-close chat after 3 seconds
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      } else if (response) {
        addMessage("bot", response.message, response.options);
      } else {
        addMessage("bot", "Desculpe, não entendi sua pergunta. Pode reformular ou escolher uma opção do menu?", KNOWLEDGE_BASE.greeting.options);
      }

      setIsTyping(false);
    }, 800);
  };

  const handleOptionClick = (action: string) => {
    handleBotResponse(action);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addMessage("user", inputValue);
    setInputValue("");

    // Simple keyword matching for free-form questions
    const lowerInput = inputValue.toLowerCase();

    if (lowerInput.includes("plano") || lowerInput.includes("preço") || lowerInput.includes("custo")) {
      handleBotResponse("planos");
    } else if (lowerInput.includes("crédito") || lowerInput.includes("credito")) {
      handleBotResponse("creditos");
    } else if (lowerInput.includes("ferramenta") || lowerInput.includes("como usar")) {
      handleBotResponse("ferramentas");
    } else if (lowerInput.includes("suporte") || lowerInput.includes("ajuda") || lowerInput.includes("contato")) {
      handleBotResponse("suporte");
    } else if (lowerInput.includes("cancelar") || lowerInput.includes("cancelamento")) {
      handleBotResponse("cancelamento");
    } else if (lowerInput.includes("testar") || lowerInput.includes("grátis") || lowerInput.includes("gratis") || lowerInput.includes("free")) {
      handleBotResponse("testar_gratis");
    } else {
      // Default response for unrecognized input
      setIsTyping(true);
      setTimeout(() => {
        addMessage("bot", "Desculpe, não encontrei uma resposta específica para sua pergunta. Posso ajudá-lo com:\n\n• Informações sobre planos\n• Dúvidas sobre créditos\n• Como usar as ferramentas\n• Suporte técnico\n\nEscolha uma opção ou reformule sua pergunta:", KNOWLEDGE_BASE.greeting.options);
        setIsTyping(false);
      }, 800);
    }
  };

  const handleSubmitContact = () => {
    if (!contactName.trim() || !contactEmail.trim()) {
      toast.error("Por favor, preencha nome e e-mail");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      toast.error("Por favor, insira um e-mail válido");
      return;
    }

    saveContactMutation.mutate({
      name: contactName,
      email: contactEmail,
      message: contactMessage || undefined,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#d4af37] text-[#1e3a5f] p-4 rounded-full shadow-2xl hover:bg-[#B8860B] transition-all duration-300 hover:scale-110"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border-4 border-[#d4af37]">
          {/* Header */}
          <div className="bg-[#1e3a5f] text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center">
                <UserCircle className="w-7 h-7 text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Rebeca</h3>
                <p className="text-xs text-[#d4af37]">Assistente Virtual</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#d4af37] hover:text-white transition-colors"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-[#f5f5f5]">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user" ? "bg-[#1e3a5f]" : "bg-[#d4af37]"}`}>
                    {message.type === "user" ? <User className="w-4 h-4 text-white" /> : <UserCircle className="w-5 h-5 text-[#1e3a5f]" />}
                  </div>
                  <div>
                    <div className={`p-3 rounded-2xl ${message.type === "user" ? "bg-[#1e3a5f] text-white" : "bg-white text-[#1e3a5f] border-2 border-[#d4af37]"}`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                    {message.options && message.options.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleOptionClick(option.action)}
                            className="block w-full text-left px-3 py-2 bg-[#d4af37] text-[#1e3a5f] rounded-lg text-sm font-semibold hover:bg-[#B8860B] transition-colors"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Contact Form */}
            {contactFormActive && (
              <div className="bg-white border-2 border-[#d4af37] rounded-2xl p-4 space-y-3">
                <div>
                  <label className="text-sm font-semibold text-[#1e3a5f] block mb-1">Nome *</label>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="border-[#d4af37] focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1e3a5f] block mb-1">E-mail *</label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="border-[#d4af37] focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1e3a5f] block mb-1">Mensagem (opcional)</label>
                  <Textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Descreva brevemente sua dúvida..."
                    className="border-[#d4af37] focus:border-[#1e3a5f] resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitContact}
                    disabled={saveContactMutation.isPending}
                    className="flex-1 bg-[#d4af37] text-[#1e3a5f] hover:bg-[#B8860B]"
                  >
                    {saveContactMutation.isPending ? "Enviando..." : "Enviar"}
                  </Button>
                  <Button
                    onClick={() => {
                      setContactFormActive(false);
                      setContactName("");
                      setContactEmail("");
                      setContactMessage("");
                    }}
                    variant="outline"
                    className="border-[#d4af37] text-[#1e3a5f]"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div className="bg-white border-2 border-[#d4af37] p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!contactFormActive && (
            <div className="p-4 border-t-2 border-[#d4af37] bg-white rounded-b-xl">
              <div className="flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua dúvida..."
                  className="flex-1 resize-none border-2 border-[#d4af37] focus:border-[#1e3a5f] rounded-lg text-sm"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#B8860B] self-end"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

