import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Send, Loader2, Download, Copy, CheckCircle, Home } from "lucide-react";
import CreditsPanel from "@/components/CreditsPanel";
import NoCreditsModal from "@/components/NoCreditsModal";
import { toast } from "sonner";
import jsPDF from "jspdf";
import SubscriptionWarningBanner from "@/components/SubscriptionWarningBanner";
import ShareButton from "@/components/ShareButton";
import DashboardMobileMenu from "@/components/DashboardMobileMenu";
import "../dashboard-mobile.css";

const TOOLS_INFO: Record<string, { name: string; description: string; placeholder: string; creditCost: number }> = {
  hermeneutica: {
    name: "Hermenêutica",
    description: "Análise de contexto histórico, cultural e literário de passagens bíblicas",
    placeholder: "Digite a referência bíblica ou cole o texto que deseja analisar...\n\nExemplo: João 3:16\nou\nCole o texto completo da passagem",
    creditCost: 50
  },
  exegese: {
    name: "Exegese",
    description: "Interpretação crítica e detalhada verso por verso",
    placeholder: "Digite a passagem bíblica para análise exegética detalhada...\n\nExemplo: Romanos 8:28-30",
    creditCost: 100
  },
  traducoes: {
    name: "Traduções",
    description: "Análise de palavras originais em Hebraico, Aramaico e Grego",
    placeholder: "Digite a referência bíblica ou palavra específica para análise de tradução...\n\nExemplo: João 1:1 - palavra 'Logos'",
    creditCost: 40
  },
  resumos: {
    name: "Resumos",
    description: "Sínteses personalizadas de passagens, capítulos ou livros",
    placeholder: "Digite o que deseja resumir...\n\nExemplo: Resumo do livro de Filipenses\nou\nResumo de Mateus 5-7 (Sermão do Monte)",
    creditCost: 30
  },
  esbocos: {
    name: "Esboços de Pregação",
    description: "Estruturas completas para sermões e mensagens",
    placeholder: "Digite o tema ou passagem para criar um esboço de pregação...\n\nExemplo: Esboço sobre 'O Amor de Deus' baseado em João 3:16",
    creditCost: 60
  },
  estudos_doutrinarios: {
    name: "Estudos Doutrinários",
    description: "Análises teológicas profundas sobre doutrinas específicas",
    placeholder: "Digite a doutrina que deseja estudar...\n\nExemplo: Doutrina da Trindade\nou\nJustificação pela Fé",
    creditCost: 80
  },
  analise_teologica: {
    name: "Análise Teológica Comparada",
    description: "Comparação entre diferentes correntes teológicas",
    placeholder: "Digite o tema para análise comparativa...\n\nExemplo: Calvinismo vs Arminianismo sobre predestinação",
    creditCost: 90
  },
  teologia_sistematica: {
    name: "Teologia Sistemática",
    description: "Estudo organizado e estruturado de temas teológicos",
    placeholder: "Digite o tema de teologia sistemática...\n\nExemplo: Pneumatologia - Doutrina do Espírito Santo",
    creditCost: 70
  },
  religioes_comparadas: {
    name: "Religiões Comparadas",
    description: "Estudo comparativo entre cristianismo e outras religiões",
    placeholder: "Digite o tema ou religião para comparação...\n\nExemplo: Comparar visão cristã e islâmica sobre Jesus",
    creditCost: 85
  },
  contextualizacao_brasileira: {
    name: "Contextualização Brasileira",
    description: "Aplicação das Escrituras ao contexto cultural brasileiro",
    placeholder: "Digite o tema ou passagem para contextualização brasileira...\n\nExemplo: Como aplicar Provérbios 22:6 na educação brasileira",
    creditCost: 55
  },
  referencias_abnt_apa: {
    name: "Gerador de Referências ABNT/APA",
    description: "Formatação acadêmica de citações e referências",
    placeholder: "Cole os dados da fonte bibliográfica...\n\nExemplo:\nAutor: John Stott\nTítulo: A Cruz de Cristo\nEditora: Vida\nAno: 2006",
    creditCost: 20
  },
  linguagem_ministerial: {
    name: "Análise de Linguagem Ministerial",
    description: "Análise retórica e teológica de discursos e sermões",
    placeholder: "Cole o texto do sermão ou discurso para análise...",
    creditCost: 75
  },
  redacao_academica: {
    name: "Assistente de Redação Acadêmica",
    description: "Auxílio na estruturação de trabalhos acadêmicos",
    placeholder: "Descreva seu trabalho acadêmico e o tipo de ajuda que precisa...\n\nExemplo: Preciso estruturar uma monografia sobre 'A Teologia Paulina da Justificação'",
    creditCost: 65
  },
  dados_demograficos: {
    name: "Análise de Dados Demográficos",
    description: "Dados estatísticos sobre igrejas e movimentos religiosos",
    placeholder: "Digite sua consulta sobre dados demográficos...\n\nExemplo: Crescimento evangélico no Brasil nos últimos 20 anos",
    creditCost: 45
  },
  transcricao: {
    name: "Transcrição de Mídia",
    description: "Transcrição de áudios e vídeos de sermões e estudos",
    placeholder: "Cole o link do áudio/vídeo ou faça upload do arquivo...\n\n(Funcionalidade de upload será implementada)",
    creditCost: 100
  },
  patristica: {
    name: "Patrística",
    description: "Explora o pensamento dos Pais da Igreja sobre determinado tema ou texto",
    placeholder: "Digite o tema ou texto bíblico para análise patrística...\n\nExemplo: O que os Pais da Igreja diziam sobre a Trindade\nou\nAnálise patrística de João 1:1",
    creditCost: 75
  },
  linha_tempo_teologica: {
    name: "Linha do Tempo Teológica",
    description: "Gera uma linha do tempo teológica interativa e cronológica sobre qualquer tema ou doutrina",
    placeholder: "Digite o tema ou doutrina para criar a linha do tempo...\n\nExemplo: Evolução da doutrina da Trindade ao longo da história\nou\nHistoria do pensamento sobre a salvação",
    creditCost: 75
  },
  apologetica_avancada: {
    name: "Apologética Avançada",
    description: "Ferramenta de defesa racional e sistemática da fé cristã, com base em filosofia, história, teologia bíblica e evidências empíricas",
    placeholder: "Digite o tema, objeção ou questão apologética que deseja analisar...\n\nExemplo: Como responder à objeção do mal e sofrimento no mundo?\nou\nDefesa da ressurreição de Jesus Cristo\nou\nExistência de Deus - argumento cosmológico",
    creditCost: 120
  },
  "escatologia-biblica": {
    name: "Escatologia Bíblica",
    description: "Análise escatológica profunda com rigor acadêmico em nível de doutorado. Abrange história da interpretação, exegese avançada, sistematização teológica e modelagem hermenêutica.",
    placeholder: "Digite o tema escatológico que deseja analisar...\n\nExemplo: A Parousia de Cristo\nou\nO Milênio em Apocalipse 20\nou\nA Ressurreição dos Mortos\nou\nO Julgamento Final",
    creditCost: 100
  }
};

export default function ToolPage() {
  const [, params] = useRoute("/tool/:toolId");
  const toolId = params?.toolId || "";
  const toolInfo = TOOLS_INFO[toolId];

  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Scroll para o topo quando a página carregar (método robusto)
  React.useEffect(() => {
    // Método 1: Scroll imediato
    window.scrollTo(0, 0);
    // Método 2: Forçar scroll após pequeno delay
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  }, [toolId]);

  const { data: credits } = trpc.credits.balance.useQuery();
  const { data: subscriptionStatus } = trpc.subscription.status.useQuery();
  const useCreditsMutation = trpc.credits.use.useMutation();
  const generateMutation = trpc.tools.generate.useMutation();
  const saveStudyMutation = trpc.studies.save.useMutation();

  const handleGenerate = async () => {
    console.log('[ToolPage Debug] Starting handleGenerate');
    console.log('[ToolPage Debug] subscriptionStatus:', subscriptionStatus);
    console.log('[ToolPage Debug] credits:', credits);
    
    // Check if subscription is blocked
    if (subscriptionStatus?.isBlocked) {
      console.log('[ToolPage Debug] BLOCKED - subscriptionStatus.isBlocked is true');
      toast.error("Sua conta está bloqueada. Renove sua assinatura para continuar usando as ferramentas.");
      return;
    }

    if (!input.trim()) {
      toast.error("Por favor, insira um texto para análise");
      return;
    }

    if (!credits || credits.total < toolInfo.creditCost) {
      console.log('[ToolPage Debug] INSUFFICIENT CREDITS - credits.total:', credits?.total, 'required:', toolInfo.creditCost);
      setShowNoCreditsModal(true);
      return;
    }
    
    console.log('[ToolPage Debug] Checks passed, calling generateMutation');

    try {
      // Use credits first
      const creditResult = await useCreditsMutation.mutateAsync({
        amount: toolInfo.creditCost,
        toolName: toolInfo.name
      });

      if (!creditResult.success) {
        setShowNoCreditsModal(true);
        return;
      }

      // Generate content with LLM
      const response = await generateMutation.mutateAsync({
        toolId,
        input
      });

      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
      setResult(content);
      
      // Save study automatically
      try {
        await saveStudyMutation.mutateAsync({
          toolName: toolInfo.name,
          input: input,
          output: content,
          creditCost: toolInfo.creditCost,
        });
      } catch (saveError) {
        console.error('Error saving study:', saveError);
        // Don't show error to user, just log it
      }
      
      toast.success(`${toolInfo.name} gerado com sucesso! ${toolInfo.creditCost} créditos usados.`);
    } catch (error) {
      toast.error("Erro ao gerar conteúdo. Tente novamente.");
      console.error(error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Conteúdo copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Arquivo TXT baixado!");
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 7;
    let y = margin;

    // Título
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(toolInfo.name, margin, y);
    y += lineHeight * 2;

    // Data
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
    y += lineHeight * 2;

    // Conteúdo
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(result, maxWidth);
    
    for (let i = 0; i < lines.length; i++) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], margin, y);
      y += lineHeight;
    }

    doc.save(`${toolInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Arquivo PDF baixado!");
  };

  if (!toolInfo) {
    return (
      <div className="min-h-screen bg-gradient-radial from-[#d4af37] via-[#DAA520] to-[#FFFACD] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1e3a5f] mb-4">Ferramenta não encontrada</h1>
          <Link href="/dashboard">
            <span className="text-[#d4af37] hover:underline cursor-pointer">Voltar ao Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tool-page-container min-h-screen bg-gradient-radial from-[#d4af37] via-[#DAA520] to-[#FFFACD]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1e3a5f] shadow-lg border-b-4 border-[#d4af37]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="flex items-center gap-4 cursor-pointer">
                <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 object-contain" loading="lazy" />
                {/* Título completo para desktop */}
                <h1 className="hidden md:block text-3xl font-bold text-[#d4af37]">{APP_TITLE}</h1>
                {/* Título curto para mobile */}
                <h1 className="block md:hidden text-3xl font-bold text-[#d4af37]">GNOSIS AI</h1>
              </span>
            </Link>
            {/* Menu Hambúrguer (Desktop e Mobile) */}
            <DashboardMobileMenu 
              user={user}
              onLogout={() => {
                logout();
                window.location.href = '/';
              }}
            />
          </div>
        </div>
      </header>

      {/* Subscription Warning Banner */}
      <SubscriptionWarningBanner />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="tool-page-grid grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CreditsPanel onNeedCredits={() => setShowNoCreditsModal(true)} />
          </div>

          {/* Tool Interface */}
          <div className="lg:col-span-3">
            {/* Tool Header */}
            <div className="bg-white/90 rounded-2xl p-8 shadow-xl border-4 border-[#d4af37] mb-6">
              <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">
                {toolInfo.name}
              </h2>
              <p className="text-lg text-[#8b6f47] mb-4">
                {toolInfo.description}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#8b6f47]">
                  Saldo disponível: <strong>{credits?.total || 0}</strong> créditos
                </span>
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-white/90 rounded-2xl p-8 shadow-xl border-4 border-[#d4af37] mb-6">
              <label className="block text-lg font-bold text-[#1e3a5f] mb-3">
                Entrada
              </label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={toolInfo.placeholder}
                className="min-h-[200px] border-2 border-[#d4af37] focus:border-[#B8860B] rounded-lg p-4 text-[#1e3a5f]"
              />
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !input.trim()}
                className="mt-4 w-full bg-[#1e3a5f] text-[#d4af37] hover:bg-[#2a4a7f] font-bold text-lg py-6"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Gerar {toolInfo.name}
                  </>
                )}
              </Button>
            </div>

            {/* Result Section */}
            {result && (
              <div className="bg-white/90 rounded-2xl p-8 shadow-xl border-4 border-[#d4af37]">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-bold text-[#1e3a5f]">
                    Resultado
                  </label>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="sm"
                      className="border-[#d4af37] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-white"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownloadTxt}
                      variant="outline"
                      size="sm"
                      className="border-[#d4af37] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar TXT
                    </Button>
                    <Button
                      onClick={handleDownloadPdf}
                      variant="outline"
                      size="sm"
                      className="border-[#d4af37] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </Button>
                    <ShareButton 
                      title={toolInfo.name} 
                      url={`${window.location.origin}/tools/${toolId}`}
                    />
                  </div>
                </div>
                <div className="bg-[#FFFACD] border-2 border-[#d4af37] rounded-lg p-6 whitespace-pre-wrap text-[#1e3a5f]">
                  {result}
                </div>
              </div>
            )}
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

