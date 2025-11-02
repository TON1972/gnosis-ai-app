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



## Bug de Responsividade Mobile

- [x] Corrigir informações truncadas e sobrepostas na versão mobile
- [x] Ajustar centralização de elementos em telas pequenas
- [x] Garantir que todos os componentes sejam responsivos (Home, Dashboard, FAQ, ToolPage)



## Correção de Centralização

- [x] Corrigir centralização da seção "Contextualização Brasileira Exclusiva" em mobile



## Bug Mobile

- [x] Botão "Upgrade de Plano" na versão mobile não abre o NoCreditsModal (funciona no desktop) - CORRIGIDO



## Integrações Essenciais para Deploy

### 1. Integração com LLM (ChatGPT)
- [ ] Verificar se invokeLLM já está funcionando nas ferramentas
- [ ] Testar geração de conteúdo em todas as 15 ferramentas
- [ ] Adicionar tratamento de erros e fallbacks

### 2. Gateway de Pagamento
- [x] Escolher gateway (Stripe ou Mercado Pago) - MERCADO PAGO ESCOLHIDO
- [x] Implementar checkout de assinaturas
- [x] Implementar compra de créditos avulsos
- [x] Webhooks para confirmação de pagamento
- [ ] Cancelamento e reembolso (implementar depois se necessário)

### 3. Sistema de Emails
- [ ] Configurar serviço de email (SendGrid/Resend)
- [ ] Email de boas-vindas
- [ ] Email de confirmação de pagamento
- [ ] Email de renovação de assinatura
- [ ] Email de créditos baixos

### 4. Sistema de Assinaturas
- [ ] Renovação automática mensal
- [ ] Atualização de créditos mensais
- [ ] Expiração de créditos iniciais (30 dias)
- [ ] Upgrade/downgrade de planos

### 5. Testes Finais
- [ ] Testar fluxo completo de cadastro
- [ ] Testar uso de todas as ferramentas
- [ ] Testar pagamentos (sandbox)
- [ ] Testar responsividade
- [ ] Teste de carga




## Pagamento Anual com Desconto

- [x] Adicionar campo yearlyPrice no schema de plans
- [x] Atualizar seed para incluir preços anuais (16,6% desconto)
- [x] Adicionar toggle Mensal/Anual na Home
- [x] Adicionar toggle Mensal/Anual no NoCreditsModal
- [x] Atualizar payment router para suportar billingPeriod
- [x] Atualizar checkout Mercado Pago para criar assinaturas anuais
- [x] Atualizar webhook handler para processar pagamentos anuais
- [x] Testar fluxo completo de pagamento an## Bugs Reportados (29/10/2025 - 01:00)

- [x] BUG: Plano FREE mostrando 0 de 15 ferramentas (deveria ser 6 de 15) - RESOLVIDO
- [x] BUG: Todas as ferramentas bloqueadas no Dashboard para usuário FREE - RESOLVIDO
- [ ] BUG: Erro ao processar pagamento no Mercado Pago ("Erro ao processar pagamento. Tente novamente.") - EM PROGRESSO- [ ] BUG: Créditos diários não renovam automaticamente (deveria adicionar 50 créditos/dia para FREE)



## Novos Bugs Reportados (29/10/2025 - 05:00)

- [ ] BUG: Créditos iniciais (500) e diários (50) do plano FREE sumiram
- [ ] BUG: Checkout Mercado Pago desconfigurado (valores errados, sem botões, sem PIX)
- [ ] BUG: Sistema de renovação diária de créditos não funciona automaticamente



## Novas Features Solicitadas (29/10/2025 - 06:20)

- [ ] Aceitar cartão de débito virtual de qualquer banco (não apenas CAIXA)
- [ ] Implementar PIX para pagamentos mensais (não anuais)
- [ ] Implementar PIX para compra de créditos avulsos



## Feature: Dois Tipos de Checkout (29/10/2025 - 06:42)

- [ ] Criar função createManualPaymentCheckout (pagamento único com PIX)
- [ ] Adicionar toggle "Renovação Automática" vs "Pagamento Manual" no NoCreditsModal
- [ ] Atualizar webhook para processar pagamentos manuais (não criar assinatura recorrente)
- [ ] Adicionar lógica de expiração após 30 dias para pagamentos manuais




## BUGS CRÍTICOS REPORTADOS (30/10/2025 - 10:30)

- [x] BUG CRÍTICO: Créditos não aparecem no Dashboard (existem no banco mas UI mostra 0) - RESOLVIDO
- [x] BUG CRÍTICO: Dashboard mostra "0 de 15 ferramentas" para plano FREE (deveria ser "6 de 15 ferramentas") - RESOLVIDO
- [x] BUG: Sistema de renovação diária de créditos não está funcionando - TESTADO E FUNCIONANDO
- [ ] TESTE: Validar fluxo completo de pagamento (checkout → webhook → ativação → créditos → ferramentas)





## Correções na Home (30/10/2025 - 20:30)

- [x] 1. Cabeçalho: "FAQ" → "PERGUNTAS FREQUENTES" e "DASHBOARD" → "PAINEL DE CONTROLE"
- [x] 2. Adicionar botão "Perguntas Frequentes" ao lado de "Começar Agora"
- [x] 3. Adicionar botão "Perguntas Frequentes" acima da seção "Contextualização Brasileira"
- [x] 4. Botão "Começar Agora" deve redirecionar para página de cadastro/login
- [x] 5. Botão do plano FREE deve redirecionar para página de cadastro/login
- [ ] 6. Botões "Assinar Agora" dos planos pagos devem redirecionar para checkout de pagamento
- [x] 7. Link "Perguntas Frequentes" no rodapé deve ir para topo da página FAQ
- [x] 8. Link "Planos e Preços" no rodapé deve ir para seção de planos na Home





## Novas Correções (30/10/2025 - 23:35)

- [x] Corrigir link "Perguntas Frequentes" no rodapé da Home para ir ao TOPO da página FAQ
- [x] Implementar cabeçalho fixo (sticky header) em TODAS as páginas da GNOSIS AI





## Nova Funcionalidade (30/10/2025 - 23:59)

- [x] Adicionar opção de download em PDF nas ferramentas (além do .txt atual)





## Nova Funcionalidade - Histórico de Estudos (31/10/2025 - 00:30)

- [x] Criar tabela savedStudies no banco de dados
- [x] Salvar automaticamente estudos gerados
- [x] Criar seção "Meus Estudos" no Dashboard
- [x] Implementar visualização de estudos salvos
- [x] Adicionar botões de download (TXT/PDF) nos estudos salvos
- [x] Implementar exclusão de estudos
- [ ] Adicionar filtros por ferramenta e data (opcional - não implementado)





## Correção - Histórico de Estudos (31/10/2025 - 01:25)

- [x] Exibir TODOS os estudos salvos com scroll (não apenas 3)
- [x] Limitar histórico a 100 estudos mais recentes
- [x] Remover automaticamente estudos antigos quando ultrapassar 100





## Alteração - Créditos Avulsos (31/10/2025 - 01:55)

- [x] Atualizar quantidade de créditos dos pacotes avulsos (reduzir pela metade)





## Alteração - Créditos dos Planos (31/10/2025 - 02:00)

- [x] Atualizar créditos dos planos no banco de dados
- [x] Atualizar exibição dos créditos na Home
- [x] Atualizar exibição dos créditos no NoCreditsModal
- [x] Atualizar FAQ com novos valores





## Correção - Renovação de Créditos Iniciais (31/10/2025 - 10:15)

- [x] Implementar renovação automática de créditos iniciais para planos pagos a cada 30 dias
- [x] Garantir que plano FREE NÃO renova créditos iniciais





## Nova Funcionalidade - Sistema de Controle de Inadimplência (31/10/2025 - 10:25)

- [x] Adicionar campos de controle de vencimento na tabela subscriptions
- [x] Criar função para verificar status de pagamento (pago/vencido/bloqueado)
- [x] Criar componente de banner piscante de aviso de vencimento
- [x] Implementar período de graça de 24 horas
- [x] Implementar bloqueio de ferramentas após 24h de inadimplência
- [x] Criar query tRPC para verificar status de assinatura
- [x] Integrar banner em todas as páginas do Dashboard
- [x] Implementar desbloqueio automático ao confirmar pagamento
- [x] Adicionar lógica para planos mensais e anuais





## Nova Funcionalidade - Painel de Administrador (31/10/2025 - 10:35)

- [x] Criar rota protegida /admin (apenas para role=admin)
- [x] Criar página AdminDashboard.tsx
- [x] Implementar estatísticas de usuários (total, FREE, pagos)
- [x] Criar calendário financeiro com vencimentos e valores por dia)
- [x] Implementar lista de inadimplentes com atualização automática
- [x] Criar filtro de inadimplentes por período
- [x] Implementar botão "Enviar para Todos" (emails) - UI pronta, backend pendente
- [x] Implementar botão "Enviar por Data" com seleção de período - UI pronta, backend pendente
- [ ] Criar template de email de cobrança personalizado - PENDENTE
- [x] Adicionar queries tRPC para dados administrativos
- [ ] Implementar envio de emails via backend - PENDENTE





## Melhorias Administrativas (31/10/2025 - 03:40)

- [x] Adicionar link "ADMIN" no cabeçalho (visível apenas para administradores)
- [x] Criar role "super_admin" para Administrador Gestor
- [x] Promover usuário TON CECILIO a super_admin
- [x] Criar seção de gerenciamento de administradores no painel admin
- [x] Implementar formulário para adicionar novos administradores
- [x] Implementar seleção de níveis de acesso para cada administrador





## BUG - Gerenciamento de Administradores (31/10/2025 - 04:05)

- [x] Seção de gerenciamento de administradores não aparece para super_admin no painel admin
- [x] Verificar se o role está sendo passado corretamente do backend para o frontend
- [x] Corrigir verificação de role no AdminDashboard





## Nova Funcionalidade - Atualizar Sessão (31/10/2025 - 04:25)

- [x] Criar mutation tRPC para recarregar dados do usuário
- [x] Adicionar botão "Atualizar Sessão" no AdminDashboard
- [x] Implementar lógica de refresh dos dados do usuário





## Correção Final - Gerenciamento de Administradores (31/10/2025 - 04:50)

- [x] Simplificar verificação de role para sempre mostrar gerenciamento para super_admin
- [x] Remover logs de debug
- [ ] Testar visibilidade da seção (aguardando teste do usuário)





## CORREÇÃO CRÍTICA - Role Super Admin (31/10/2025 - 12:00)

- [x] Verificar TODOS os usuários no banco de dados
- [x] Deletar usuários duplicados (deletados 4 duplicados, mantido apenas ID 1)
- [x] Garantir que TON CECILIO tenha role super_admin
- [x] Modificar lógica do upsertUser para SEMPRE definir owner como super_admin
- [ ] Testar acesso ao painel administrativo (aguardando teste do usuário)





## Sistema de Tickets - Filtro por Permissão (02/11/2025)

- [x] Implementar filtro de tickets por permissão (admin vê só seus tickets, super_admin vê todos)
- [x] Adicionar badge mostrando "Meus Tickets" vs "Todos os Tickets"




## Sistema de Status para Tickets (02/11/2025)

- [x] Atualizar labels de status (Aberto, Em Andamento, Resolvido)
- [x] Rota tRPC para atualizar status já existia
- [x] Adicionar dropdown de status no painel AdminTickets
- [x] Implementar cores diferentes para cada status

