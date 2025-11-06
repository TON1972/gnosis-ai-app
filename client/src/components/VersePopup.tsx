import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function VersePopup() {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Auto-close after 4 seconds if not hovered
    const timer = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(false);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [isHovered]);

  // Close when mouse leaves and timer expired
  useEffect(() => {
    if (!isHovered && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isHovered, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right duration-500">
      {/* Pop-up Card */}
      <div
        className="bg-gradient-to-br from-[#FFFACD] to-[#F0E68C] rounded-2xl p-6 shadow-2xl border-4 border-[#d4af37] max-w-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="space-y-3">
          {/* Verse Text */}
          <div className="text-[#1e3a5f] leading-relaxed space-y-2">
            <p className="text-sm">
              <sup className="text-xs font-bold">14</sup> Por causa disto me ponho de joelhos perante o Pai de nosso Senhor Jesus Cristo,
            </p>
            <p className="text-sm">
              <sup className="text-xs font-bold">15</sup> Do qual toda a família nos céus e na terra toma o nome,
            </p>
            <p className="text-sm">
              <sup className="text-xs font-bold">16</sup> Para que, segundo as riquezas da sua glória, vos conceda que sejais fortalecidos com poder pelo seu Espírito no homem interior;
            </p>
            <p className="text-sm">
              <sup className="text-xs font-bold">17</sup> Para que Cristo habite pela fé nos vossos corações; a fim de, estando enraizados e fundados em amor,
            </p>
            <p className="text-sm">
              <sup className="text-xs font-bold">18</sup> Poderdes perfeitamente compreender, com todos os santos, qual seja a largura, e o comprimento, e a altura, e a profundidade,
            </p>
            <p className="text-sm">
              <sup className="text-xs font-bold">19</sup> E conhecer o amor de Cristo, que excede todo o entendimento, para que sejais cheios de toda a plenitude de Deus.
            </p>
          </div>

          {/* Reference */}
          <div className="text-right">
            <p className="text-xs font-bold text-[#8b6f47] italic">
              (Efésios 3:14-19)
            </p>
          </div>
        </div>
      </div>

      {/* Discrete Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="flex items-center gap-1 text-xs text-[#8b6f47] hover:text-[#1e3a5f] transition-colors opacity-60 hover:opacity-100"
        aria-label="Fechar versículo"
      >
        <X className="w-3 h-3" />
        <span>Fechar</span>
      </button>
    </div>
  );
}

