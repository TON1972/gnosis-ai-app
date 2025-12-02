import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

interface Message {
  type: "bot" | "user";
  text: string;
  options?: { label: string; value: string }[];
}

interface ChatOption {
  label: string;
  value: string;
}

const chatData = {
  greeting: {
    message: "Olá! 👋 Sou a Rebeca, assistente virtual da GNOSIS AI. Como posso ajudá-lo(a) hoje?",
    options: [
      { label: "📋 Informações sobre Planos", value: "planos" },
      { label: "💰 Dúvidas sobre Créditos", value: "creditos" },
      { label: "🔧 Como usar as Ferramentas", value: "ferramentas" },
      { label: "❓ Outras Dúvidas", value: "suporte" },
      { label: "👋 Encerrar conversa", value: "encerrar" }
    ]
  },
  responses: {
    planos: {
      message: `📋 **Nossos Planos:**

**FREE** - Gratuito
• 500 créditos iniciais + 50/dia
• 6 ferramentas disponíveis

**Aliança** - R$ 16,68/mês
• 1.500 créditos iniciais + 100/dia
• 10 ferramentas disponíveis

**Lumen** - R$ 30,88/mês (MAIS POPULAR)
• 3.000 créditos iniciais + 200/dia
• Todas as 19 ferramentas

**GNOSIS Premium** - R$ 57,60/mês
• 6.000 créditos iniciais + 300/dia
• Todas as 19 ferramentas

Quer ver mais detalhes dos planos?`,
      options: [
        { label: "✅ Ver Planos Completos", value: "ver_planos" },
        { label: "🔙 Voltar ao Menu", value: "menu" }
      ]
    },
    creditos: {
      message: `💰 **Sistema de Créditos:**

Os créditos são usados para acessar as ferramentas de IA. Cada ferramenta consome uma quantidade específica de créditos.

**Ordem de uso:**
1. Créditos diários (renovam todo dia)
2. Créditos iniciais (renovados a cada 30 dias)
3. Créditos avulsos (nunca expiram)

**Créditos Avulsos:**
• 500 créditos - R$ 9,90
• 1.500 créditos - R$ 24,90
• 2.500 créditos - R$ 39,90
• 5.000 créditos - R$ 69,90

Posso ajudar com mais alguma coisa?`,
      options: [
        { label: "📋 Ver Planos", value: "planos" },
        { label: "🔙 Voltar ao Menu", value: "menu" }
      ]
    },
    ferramentas: {
      message: `🔧 **Como usar as Ferramentas:**

1. Faça login ou crie sua conta gratuita
2. Acesse o Dashboard
3. Escolha a ferramenta desejada
4. Digite sua consulta ou texto bíblico
5. Aguarde a IA processar
6. Copie ou baixe o resultado

**Principais ferramentas:**
• Hermenêutica - Análise de contexto
• Traduções - Hebraico, Grego, Aramaico
• Resumos - Sínteses de passagens
• Esboços de Pregação - Estruturas completas
• E muito mais!

Quer começar agora?`,
      options: [
        { label: "🚀 Fazer Login", value: "login" },
        { label: "📋 Ver Planos", value: "planos" },
        { label: "🔙 Voltar ao Menu", value: "menu" }
      ]
    },
    suporte: {
      message: `❓ **Suporte e Ajuda:**

Estou aqui para ajudar! Você pode:

• Ver informações sobre planos e preços
• Entender o sistema de créditos
• Aprender a usar as ferramentas
• Tirar dúvidas gerais

Para suporte técnico ou questões específicas, você pode:
• Abrir um ticket no portal de suporte
• Enviar email para suporte@gnosisai.com.br

Como posso ajudar?`,
      options: [
        { label: "🎫 Abrir Suporte", value: "abrir_suporte" },
        { label: "🔙 Voltar ao Menu", value: "menu" }
      ]
    },
    encerrar: {
      message: "Foi um prazer ajudá-lo(a)! Se precisar de algo, estarei aqui. Que Deus abençoe seus estudos! 🙏✨",
      options: []
    },
    ver_planos: {
      message: "Redirecionando para a seção de planos...",
      options: []
    },
    login: {
      message: "Redirecionando para o login do Gnosis.log...",
      options: []
    },
    abrir_suporte: {
      message: "Abrindo portal de suporte em nova aba...",
      options: []
    }
  }
};

export function ChatRebeca() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage("bot", chatData.greeting.message, chatData.greeting.options);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (type: "bot" | "user", text: string, options?: ChatOption[]) => {
    setMessages(prev => [...prev, { type, text, options }]);
  };

  const handleOptionClick = (value: string) => {
    setIsTyping(true);

    setTimeout(() => {
      if (value === "menu") {
        const greeting = chatData.greeting;
        addMessage("bot", greeting.message, greeting.options);
      } else if (value === "ver_planos") {
        const response = chatData.responses[value];
        addMessage("bot", response.message);
        setTimeout(() => {
          window.location.href = "/#planos";
        }, 1000);
      } else if (value === "login") {
        const response = chatData.responses[value];
        addMessage("bot", response.message);
        setTimeout(() => {
          // CORREÇÃO: Redirecionar para /auth (Gnosis.log) em vez de api.manus.im
          window.location.href = "/auth";
        }, 1000);
      } else if (value === "abrir_suporte") {
        const response = chatData.responses[value];
        addMessage("bot", response.message);
        setTimeout(() => {
          window.open("https://help.manus.im", "_blank");
        }, 1000);
      } else if (value === "encerrar") {
        const response = chatData.responses[value];
        addMessage("bot", response.message, response.options);
        setTimeout(() => {
          setIsOpen(false);
        }, 5000);
      } else {
        const response = chatData.responses[value as keyof typeof chatData.responses];
        if (response) {
          addMessage("bot", response.message, response.options);
        } else {
          addMessage("bot", "Desculpe, não entendi sua pergunta. Pode reformular ou escolher uma opção do menu?", chatData.greeting.options);
        }
      }
      setIsTyping(false);
    }, 800);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    addMessage("user", inputText);
    setInputText("");

    const lowerText = inputText.toLowerCase();

    if (lowerText.includes("plano") || lowerText.includes("preço") || lowerText.includes("custo")) {
      handleOptionClick("planos");
    } else if (lowerText.includes("crédito") || lowerText.includes("credito")) {
      handleOptionClick("creditos");
    } else if (lowerText.includes("ferramenta") || lowerText.includes("como usar")) {
      handleOptionClick("ferramentas");
    } else if (lowerText.includes("suporte") || lowerText.includes("ajuda") || lowerText.includes("contato")) {
      handleOptionClick("suporte");
    } else {
      setIsTyping(true);
      setTimeout(() => {
        addMessage("bot", `Desculpe, não encontrei uma resposta específica para sua pergunta. Posso ajudá-lo com:

• Informações sobre planos e preços
• Dúvidas sobre créditos
• Como usar as ferramentas
• Suporte e ajuda geral

Escolha uma opção ou reformule sua pergunta! 😊`, chatData.greeting.options);
        setIsTyping(false);
      }, 800);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#d4af37] hover:bg-[#c49d2e] text-[#1e3a5f] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-[#d4af37]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a7f] p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-[#d4af37] rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#1e3a5f]" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg">Rebeca</h3>
              <p className="text-[#d4af37] text-sm">Assistente Virtual</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[#d4af37] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#f8f6f0] to-white">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-[#1e3a5f] text-white"
                      : "bg-white text-[#1e3a5f] border border-[#d4af37]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  {message.options && message.options.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => handleOptionClick(option.value)}
                          className="w-full text-left px-3 py-2 bg-[#d4af37] hover:bg-[#c49d2e] text-[#1e3a5f] rounded-lg text-sm font-medium transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#d4af37] rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-[#d4af37]">
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua dúvida..."
                className="flex-1 px-3 py-2 border border-[#d4af37] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-sm"
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-[#1e3a5f] hover:bg-[#2a4a7f] text-white"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
