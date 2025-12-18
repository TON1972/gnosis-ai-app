/**
 * 🔐 Autenticação - GNOSIS AI
 * Login com Email/Senha, Google ou Facebook
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Loader2 } from "lucide-react";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // Verificar se há erro de OAuth na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    
    if (error === "google") {
      toast.error("Erro ao fazer login com Google. Tente novamente.");
    } else if (error === "facebook") {
      toast.error("Erro ao fazer login com Facebook. Tente novamente.");
    }
  }, []);

  // Handler de login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Login realizado com sucesso!");
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message || "Erro ao fazer login");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Handler de cadastro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (registerPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Cadastro realizado com sucesso!");
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message || "Erro ao criar conta");
      }
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
              Faça login para acessar as ferramentas de estudo bíblico
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full border-[#d4af37]/30 hover:bg-[#d4af37]/10 font-crimson h-12 text-base"
              onClick={() => {
                window.location.href = "/api/auth/login/google";
              }}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
              className="w-full border-[#d4af37]/30 hover:bg-[#d4af37]/10 font-crimson h-12 text-base"
              onClick={() => {
                window.location.href = "/api/auth/login/facebook";
              }}
            >
              <svg className="mr-3 h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continuar com Facebook
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="relative flex justify-center text-xs uppercase items-center">
              <span className="w-full border-t border-[#d4af37]/30" />

              <span className="px-2 text-[#1e3a5f]/70 font-crimson shrink-0">
                Ou continue com email
              </span>

              <span className="w-full border-t border-[#d4af37]/30" />
            </div>
          </div>

          {/* Email/Password Forms */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="font-crimson">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="font-crimson">
                Cadastrar
              </TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="font-crimson text-[#1e3a5f]">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loading}
                    className="border-[#d4af37]/30 focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="font-crimson text-[#1e3a5f]">
                    Senha
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading}
                    className="border-[#d4af37]/30 focus:border-[#d4af37]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#1e3a5f] font-crimson font-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="font-crimson text-[#1e3a5f]">
                    Nome Completo
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    disabled={loading}
                    className="border-[#d4af37]/30 focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="font-crimson text-[#1e3a5f]">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={loading}
                    className="border-[#d4af37]/30 focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="font-crimson text-[#1e3a5f]">
                    Senha
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={loading}
                    className="border-[#d4af37]/30 focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="font-crimson text-[#1e3a5f]">
                    Confirmar Senha
                  </Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="border-[#d4af37]/30 focus:border-[#d4af37]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#1e3a5f] font-crimson font-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setLocation("/")}
              className="text-sm text-[#1e3a5f]/70 hover:text-[#1e3a5f] font-crimson transition-colors"
            >
              Voltar para a página inicial
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
