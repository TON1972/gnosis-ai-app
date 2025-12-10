/**
 * 🔐 Autenticação - GNOSIS AI
 * Login com Google ou Facebook (NextAuth.js)
 */

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function Auth() {
  // Verificar se há erro de OAuth na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    
    if (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    }
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/signin/google?callbackUrl=/dashboard";
  };

  const handleFacebookLogin = () => {
    window.location.href = "/api/auth/signin/facebook?callbackUrl=/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2a4a6f] to-[#1e3a5f] flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 bg-[#FFFACD]/95 border-[#d4af37]/30 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-[#d4af37] to-[#b8941f] p-4 rounded-full">
              <BookOpen className="w-12 h-12 text-[#1e3a5f]" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-cinzel text-[#1e3a5f]">
              {APP_TITLE}
            </CardTitle>
            <CardDescription className="text-[#1e3a5f]/70 font-crimson text-base mt-2">
              Estudos Bíblicos Profundos
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-[#1e3a5f]/80 font-crimson text-sm mb-6">
              Faça login para acessar as ferramentas de estudo bíblico
            </p>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full border-[#d4af37]/30 hover:bg-[#d4af37]/10 font-crimson h-14 text-base"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar com Google
            </Button>

            {/* Facebook OAuth Button */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full border-[#d4af37]/30 hover:bg-[#d4af37]/10 font-crimson h-14 text-base"
              onClick={handleFacebookLogin}
            >
              <svg className="mr-3 h-6 w-6" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continuar com Facebook
            </Button>

            {/* Info adicional */}
            <div className="mt-8 pt-6 border-t border-[#d4af37]/20">
              <p className="text-center text-xs text-[#1e3a5f]/60 font-crimson">
                Ao fazer login, você concorda com nossos{" "}
                <a href="/termos" className="text-[#d4af37] hover:underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="/privacidade" className="text-[#d4af37] hover:underline">
                  Política de Privacidade
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
