# Project TODO

## Correções Identificadas na Checagem

- [x] Adicionar 2 perguntas ao FAQ para completar 30 perguntas (JÁ TINHA 30)
- [x] Corrigir lógica de desbloqueio de ferramentas no Dashboard (FREE deve ter 4 ferramentas disponíveis)
- [x] Adicionar créditos iniciais para usuários novos do plano FREE (500 créditos)

## Bug Crítico em Investigação

- [x] Dashboard mostra 0 ferramentas e 0 créditos mesmo com dados no banco (RESOLVIDO)
- [x] Query tRPC plans.getTools não retorna dados (RESOLVIDO - problema era IDs inconsistentes)
- [x] Query tRPC credits.balance não retorna créditos (RESOLVIDO)



## Correções Solicitadas pelo Usuário

- [x] 1. Corrigir logo em todas as páginas (Logo da GNOSIS AI agora aparece corretamente)
- [x] 2. Substituir "Gnose" por "GNOSIS AI" em todas as páginas (Não havia ocorrências)
- [x] 3. Substituir "Livre" por "FREE" no plano gratuito (Já está correto como FREE)
- [x] 4. Substituir "peças" por "ferramentas" nos planos Aliança, Lumen e GNOSIS Premium (Já está correto como ferramentas)
- [x] 5. Adicionar 3 ferramentas na seção "Ferramentas Principais" (total 9): Exegese, Teologia Sistemática, Linguagem Ministerial



## Novas Alterações de Planos

- [x] FREE: Adicionar 2 ferramentas (Estudos Doutrinários + Análise Teológica Comparada) - Total: 6 ferramentas
- [x] Aliança: Adicionar 2 ferramentas (Religiões Comparadas + Linguagem Ministerial) - Total: 10 ferramentas



## Bug Crítico

- [x] Novos usuários não recebem plano FREE automaticamente ao se cadastrar (Dashboard mostra 0 ferramentas) - CORRIGIDO



## Alteração de Interface

- [x] Remover informação "Custo: X créditos" da página de ferramentas (manter apenas "Saldo disponível")



## Nova Funcionalidade

- [x] Adicionar botões "Upgrade de Plano" e "Comprar Créditos Avulsos" no CreditsPanel (abaixo da ordem de uso)



## Correção

- [x] Botão "Upgrade de Plano" deve abrir o NoCreditsModal (mesmo comportamento do botão "Comprar Créditos Avulsos")




## 🐛 BUG CRÍTICO - Rota /auth retorna 404 (29/11/2025)

- [ ] Investigar por que a rota /auth não está funcionando
- [ ] Verificar se a rota está registrada no App.tsx
- [ ] Verificar se o componente Auth.tsx existe
- [ ] Testar rota localmente
- [ ] Corrigir erro 404

- [x] Investigar por que a rota /auth não está funcionando
- [x] Verificar se a rota está registrada no App.tsx
- [x] Verificar se o componente Auth.tsx existe
- [x] Testar rota localmente
- [x] Corrigir erro 404
- [x] Recriar arquivo Auth.tsx
- [x] Recriar arquivo gnosislog.ts
- [x] Adicionar rotas de login/register no routers.ts
- [x] Adicionar campo password no schema
- [x] Adicionar jwtSecret no ENV
- [x] Adicionar rota /auth no App.tsx
- [x] Testar página de login/cadastro
