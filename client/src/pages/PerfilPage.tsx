import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import DashboardMobileMenu from "@/components/DashboardMobileMenu";
import NoCreditsModal from "@/components/NoCreditsModal";
import { User, CreditCard, Package } from "lucide-react";

export default function PerfilPage() {
  const { user, logout, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const { data: credits } = trpc.credits.get.useQuery();
  const { data: activePlan } = trpc.subscriptions.getActivePlan.useQuery();

  // Scroll ao topo ao carregar
  React.useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#0f1f3a] flex items-center justify-center">
        <div className="text-[#d4af37] text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#0f1f3a] flex items-center justify-center">
        <div className="text-[#d4af37] text-xl">Você precisa fazer login para acessar esta página.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#0f1f3a]">
      {/* Header */}
      <header className="bg-[#1e3a5f] border-b border-[#d4af37]/20 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <span className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
                <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 object-contain" loading="lazy" />
                <h1 className="hidden md:block text-3xl font-bold text-[#d4af37]">{APP_TITLE}</h1>
                <h1 className="block md:hidden text-3xl font-bold text-[#d4af37]">GNOSIS AI</h1>
              </span>
            </Link>
            
            {/* Ícone de Perfil e Menu Hambúrguer */}
            <div className="flex items-center gap-3">
              <Link href="/perfil">
                <button className="p-2 text-[#d4af37] hover:bg-[#2a4a7f] rounded-lg transition-colors" aria-label="Meu Perfil">
                  <User className="w-6 h-6" />
                </button>
              </Link>
              
              <DashboardMobileMenu 
                user={user}
                onLogout={logout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[#d4af37] mb-8 text-center">Meu Perfil</h1>

          {/* Dados do Usuário */}
          <Card className="bg-[#2a4a7f] border-[#d4af37]/20 p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                <User className="w-10 h-10 text-[#d4af37]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#d4af37]">{user.name || "Usuário"}</h2>
                <p className="text-gray-300">{user.email || "email@exemplo.com"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plano Atual */}
              <div className="bg-[#1e3a5f] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Plano Atual</h3>
                <p className="text-xl font-bold text-[#d4af37]">
                  {activePlan?.plan?.name || "FREE"}
                </p>
              </div>

              {/* Créditos Disponíveis */}
              <div className="bg-[#1e3a5f] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Créditos Disponíveis</h3>
                <p className="text-xl font-bold text-[#d4af37]">
                  {credits?.total?.toLocaleString() || "0"}
                </p>
              </div>

              {/* Método de Login */}
              <div className="bg-[#1e3a5f] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Método de Login</h3>
                <p className="text-lg text-gray-300">
                  {user.loginMethod || "Email"}
                </p>
              </div>

              {/* Função */}
              <div className="bg-[#1e3a5f] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Função</h3>
                <p className="text-lg text-gray-300">
                  {user.role === 'admin' || user.role === 'super_admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            </div>
          </Card>

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Botão Planos e Preços / Compra de Créditos */}
            <Button
              onClick={() => setShowModal(true)}
              className="bg-[#d4af37] hover:bg-[#b8941f] text-[#1e3a5f] font-bold py-6 text-lg flex items-center justify-center gap-3"
            >
              <Package className="w-6 h-6" />
              Planos e Créditos
            </Button>

            {/* Botão Voltar ao Dashboard */}
            <Link href="/dashboard">
              <Button
                className="w-full bg-[#2a4a7f] hover:bg-[#1e3a5f] text-[#d4af37] font-bold py-6 text-lg border-2 border-[#d4af37] flex items-center justify-center gap-3"
              >
                <CreditCard className="w-6 h-6" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Modal de Planos e Créditos */}
      <NoCreditsModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

