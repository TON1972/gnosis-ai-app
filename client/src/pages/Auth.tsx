/**
 * 🔐 Gnosis.log - Página de Autenticação
 * Sistema proprietário de autenticação da GNOSIS AI
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, BookOpen } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // Mutations
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Login realizado com sucesso!");
        // Recarrega a página para atualizar o contexto de autenticação
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error("Erro ao fazer login: " + error.message);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Cadastro realizado com sucesso!");
        // Recarrega a página para atualizar o contexto de autenticação
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar: " + error.message);
    },
  });

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    loginMutation.mutate({
      email: loginEmail,
      password: loginPassword,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
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

    registerMutation.mutate({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    });
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
                    disabled={loginMutation.isPending}
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
                    disabled={loginMutation.isPending}
                    className="border-[#d4af37]/30 focus:border-[#d4af37]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#1e3a5f] font-crimson font-bold"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
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
                    disabled={registerMutation.isPending}
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
                    disabled={registerMutation.isPending}
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
                    disabled={registerMutation.isPending}
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
                    disabled={registerMutation.isPending}
                    className="border-[#d4af37]/30 focus:border-[#d4af37]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#1e3a5f] font-crimson font-bold"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
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
              className="text-sm text-[#1e3a5f]/70 hover:text-[#1e3a5f] font-crimson underline"
            >
              Voltar para a página inicial
            </button>
          </div>

          {/* Powered by Gnosis.log */}
          <div className="mt-4 text-center">
            <p className="text-xs text-[#1e3a5f]/50 font-crimson">
              Protegido por <span className="font-bold">Gnosis.log</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
