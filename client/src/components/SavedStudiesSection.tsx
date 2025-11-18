import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Download, Trash2, Clock, BookText, FileText, Eye, Copy, CheckCircle, Share2 } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShareButton from "@/components/ShareButton";

export default function SavedStudiesSection() {
  const { data: savedStudies, refetch } = trpc.studies.list.useQuery();
  const deleteStudyMutation = trpc.studies.delete.useMutation();
  const [expandedStudyId, setExpandedStudyId] = useState<number | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!selectedStudy) return;
    navigator.clipboard.writeText(selectedStudy.output);
    setCopied(true);
    toast.success("Conteúdo copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este estudo?")) return;

    try {
      await deleteStudyMutation.mutateAsync({ id });
      toast.success("Estudo excluído!");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir");
      console.error(error);
    }
  };

  const handleDownloadTxt = (study: any) => {
    const blob = new Blob([study.output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${study.toolName.replace(/\s+/g, '_')}_${new Date(study.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("TXT baixado!");
  };

  const handleDownloadPdf = (study: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 7;
    let y = margin;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(study.toolName, margin, y);
    y += lineHeight * 2;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${new Date(study.createdAt).toLocaleDateString('pt-BR')}`, margin, y);
    y += lineHeight * 2;

    doc.setFontSize(11);
    const lines = doc.splitTextToSize(study.output, maxWidth);
    
    for (let i = 0; i < lines.length; i++) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], margin, y);
      y += lineHeight;
    }

    doc.save(`${study.toolName.replace(/\s+/g, '_')}_${new Date(study.createdAt).toISOString().split('T')[0]}.pdf`);
    toast.success("PDF baixado!");
  };

  if (!savedStudies || savedStudies.length === 0) {
    return null;
  }

  return (
    <>
      {/* Modal de Visualização */}
      <Dialog open={!!selectedStudy} onOpenChange={() => setSelectedStudy(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1e3a5f]">
              {selectedStudy?.toolName}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#8b6f47]">
              {selectedStudy && new Date(selectedStudy.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedStudy && (
            <>
              <div className="bg-[#FFFACD] border-2 border-[#d4af37] rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-[#1e3a5f] mb-2">Entrada:</p>
                <p className="text-sm text-[#8b6f47] whitespace-pre-wrap">{selectedStudy.input}</p>
              </div>

              <div className="bg-white border-2 border-[#d4af37] rounded-lg p-6 mb-4">
                <p className="text-sm font-semibold text-[#1e3a5f] mb-3">Resultado:</p>
                <div className="prose prose-sm max-w-none text-[#1e3a5f] whitespace-pre-wrap">
                  {selectedStudy.output}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleCopy}
                  className="flex-1 min-w-[120px] bg-[#1e3a5f] text-white hover:bg-[#d4af37] font-semibold shadow-lg"
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
                  onClick={() => handleDownloadTxt(selectedStudy)}
                  className="flex-1 min-w-[120px] bg-[#1e3a5f] text-white hover:bg-[#d4af37] font-semibold shadow-lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Baixar TXT
                </Button>
                <Button
                  onClick={() => handleDownloadPdf(selectedStudy)}
                  className="flex-1 min-w-[120px] bg-[#1e3a5f] text-white hover:bg-[#d4af37] font-semibold shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
                <ShareButton
                  title={selectedStudy.toolName}
                  url={window.location.origin}
                  content={`Entrada:\n${selectedStudy.input}\n\nResultado:\n${selectedStudy.output}`}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-white/90 rounded-2xl p-4 shadow-xl border-4 border-[#d4af37]">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#d4af37]">
          <BookText className="w-5 h-5 text-[#1e3a5f]" />
          <h3 className="text-lg font-bold text-[#1e3a5f]">
            Meus Estudos
          </h3>
        </div>

        <div className="saved-studies-list space-y-3 max-h-[500px] overflow-y-auto">
          {savedStudies.map((study) => (
            <div
              key={study.id}
              className="bg-[#FFFACD] border-2 border-[#d4af37] rounded-lg p-3"
            >
              <div className="mb-2">
                <h4 className="text-sm font-bold text-[#1e3a5f] mb-1">
                  {study.toolName}
                </h4>
                <p className="text-xs text-[#8b6f47] line-clamp-2 mb-2">
                  {study.input}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#8b6f47]">
                  <Clock className="w-3 h-3" />
                  {new Date(study.createdAt).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </div>
              </div>

              <div className="flex gap-1 md:gap-1 gap-0.5">
                <Button
                  onClick={() => setSelectedStudy(study)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 md:h-8 h-7 text-xs md:text-xs text-[10px] px-1 md:px-3 border-[#d4af37] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-white"
                >
                  <Eye className="w-3 h-3 md:mr-1 mr-0.5" />
                  Ver
                </Button>
                <Button
                  onClick={() => handleDownloadTxt(study)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 md:h-8 h-7 text-xs md:text-xs text-[10px] px-1 md:px-3 border-[#d4af37] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-white"
                >
                  <FileText className="w-3 h-3 md:mr-1 mr-0.5" />
                  TXT
                </Button>
                <Button
                  onClick={() => handleDownloadPdf(study)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 md:h-8 h-7 text-xs md:text-xs text-[10px] px-1 md:px-3 border-[#d4af37] text-[#1e3a5f] hover:bg-[#d4af37] hover:text-white"
                >
                  <Download className="w-3 h-3 md:mr-1 mr-0.5" />
                  PDF
                </Button>
                <Button
                  onClick={() => handleDelete(study.id)}
                  variant="outline"
                  size="sm"
                  className="h-8 md:h-8 h-7 px-2 md:px-2 px-1.5 border-red-500 text-red-600 hover:bg-red-500 hover:text-white flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#8b6f47] mt-3 pt-3 border-t border-[#d4af37]">
          Total: {savedStudies.length} {savedStudies.length === 1 ? 'estudo' : 'estudos'}
        </p>
      </div>
    </>
  );
}

