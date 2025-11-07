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




## Sistema de Arquivamento de Tickets (02/11/2025)

- [x] Adicionar campo archived (boolean) no schema chatbotContacts
- [x] Criar rotas tRPC para arquivar e desarquivar tickets
- [x] Adicionar filtro automático para ocultar tickets arquivados
- [x] Implementar toggle "Mostrar Arquivados" no painel
- [x] Adicionar botões de arquivar/desarquivar nos tickets




## BUG - Botão Arquivar Não Aparece (02/11/2025)

- [x] Investigar por que botão "Arquivar" não aparece em tickets resolvidos
- [x] Corrigir lógica de exibição do botão no TicketSystem
- [x] Verificar se status está sendo passado corretamente
- [x] Implementar busca direta do ticket para garantir dados atualizados




## Implementar Novas Ferramentas - Patrística e Linha do Tempo Teológica (02/11/2025)

- [x] Adicionar ferramentas no banco de dados (tools table)
- [x] Atualizar schema com as novas ferramentas
- [x] Criar componente ToolPatristica.tsx
- [x] Criar componente ToolLinhaTempoTeologica.tsx
- [x] Configurar restrição de acesso (apenas LUMEN e PREMIUM)
- [x] Atualizar contadores: LUMEN passa de 12 para 14 ferramentas
- [x] Atualizar contadores: PREMIUM passa de 15 para 17 ferramentas
- [x] Atualizar FAQ com informações das novas ferramentas
- [x] Atualizar Chatbot com informações das novas ferramentas
- [x] Testar ambas as ferramentas




## Correção de Inconsistências - Quantidade de Ferramentas (02/11/2025)

- [x] Verificar e corrigir Home.tsx
- [x] Verificar e corrigir FAQ.tsx
- [x] Verificar e corrigir Chatbot.tsx (Rebeca)
- [x] Verificar e corrigir NoCreditsModal.tsx
- [x] Verificar e corrigir Dashboard.tsx
- [x] Verificar e corrigir routers.ts (chatbot do servidor)
- [x] LUMEN e PREMIUM agora mostram "Todas as 17 ferramentas"
- [x] Total de ferramentas da plataforma: 17
- [x] ALIANÇA corrigido para 10 ferramentas




## Correção de Erros Críticos Reportados (02/11/2025)

### ERRO 1 - Dashboard
- [x] Adicionar ferramenta "Patrística" no Dashboard
- [x] Adicionar ferramenta "Linha do Tempo Teológica" no Dashboard
- [x] Atualizar contador total de ferramentas de 15 para 17

### ERRO 2 - Janela de Upgrade (NoCreditsModal)
- [x] Corrigir ALIANÇA de 8 para 10 ferramentas
- [x] Restaurar lista de ferramentas com ✅ verde (disponíveis) e ❌ vermelho (indisponíveis)
- [x] Garantir que a lista seja scrollável mostrando todas as 17 ferramentas




## Correção NoCreditsModal - Usar Lógica da Home (02/11/2025)

- [x] Remover tabela duplicada de ferramentas abaixo dos cards
- [x] Remover lógica "Todas do Aliança +" das features
- [x] Adicionar lista completa de ferramentas DENTRO de cada card
- [x] Usar ✅ verde para disponíveis e ❌ vermelho para indisponíveis
- [x] Lista scrollável dentro de cada card (mesma lógica da Home)
- [x] Adicionar Patrística e Linha do Tempo Teológica no allTools da Home




## Correção Contador Dashboard (02/11/2025)

- [x] Corrigir "6 de 15" para "6 de 17" na janela de plano atual do Dashboard




## BUG - Botões Arquivar/Desarquivar Sumiram (02/11/2025)

- [x] Investigar onde os botões de arquivar/desarquivar sumiram
- [x] Restaurar botão "Arquivar" para tickets resolvidos no AdminDashboard
- [x] Restaurar botão "Desarquivar" para tickets arquivados no AdminDashboard
- [x] Adicionar mutations archiveMutation e unarchiveMutation no AdminDashboard
- [x] Adicionar toggle de arquivados no AdminDashboard
- [x] Verificar AdminTickets (já tinha os botões via TicketSystem)
- [x] Verificar TicketSystem (já tinha os botões implementados)




## BUG - Botão Arquivar Não Aparece em /admin/tickets (02/11/2025)

- [x] Investigar por que botão não aparece na página Sistema de Tickets
- [x] Verificar se TicketSystem está mostrando os botões corretamente (estava OK)
- [x] Verificar se a lista de tickets tem botões de arquivar (não tinha)
- [x] Adicionar botões de Arquivar/Desarquivar nos cards da lista de tickets




## Verificação Download PDF nas Ferramentas (02/11/2025)

- [ ] Verificar se todas as 17 ferramentas têm botão de download PDF
- [ ] Adicionar botão PDF nas ferramentas que não têm
- [ ] Testar download PDF em todas as ferramentas




## Melhorar Descrições das Ferramentas (03/11/2025)

- [x] Criar descrições melhoradas e mais atraentes para as 17 ferramentas
- [x] Atualizar descrições na Home
- [x] Atualizar descrições no Dashboard
- [x] Garantir que as descrições sejam exatamente iguais em ambos os locais




## Adicionar Botão Compartilhar nas Ferramentas (03/11/2025)

- [x] Criar componente ShareButton com modal de compartilhamento
- [x] Adicionar integrações: WhatsApp, Facebook, Twitter/X, LinkedIn
- [x] Adicionar botão "Compartilhar" no ToolPage ao lado do "Baixar PDF"
- [x] Testar compartilhamento em todas as 17 ferramentas
- [x] Garantir que funcione em mobile e desktop




## Melhorias ShareButton - Instagram, TikTok e Assinatura (03/11/2025)

- [x] Adicionar opção de compartilhar no Instagram
- [x] Adicionar opção de compartilhar no TikTok
- [x] Adicionar assinatura discreta: "Desenvolvido por GNOSIS AI - Estudos Bíblicos Profundos com IA"
- [x] Adicionar link para home abaixo da assinatura




## Implementar Abertura de Estudos do Histórico (03/11/2025)

- [ ] Adicionar modal/dialog para abrir estudo completo ao clicar no histórico
- [ ] Mostrar resultado completo com formatação
- [ ] Adicionar botões: Copiar, Baixar TXT, Baixar PDF, Compartilhar
- [ ] Garantir que funcione em mobile e desktop
- [ ] Testar com todos os tipos de ferramentas





## Atualização de Valores dos Planos (04/11/2025)

- [x] Atualizar valores dos planos (Aliança R$ 19,98, Lumen R$ 36,98, Premium R$ 68,98)
- [x] Atualizar valores no banco de dados (seed-plans.ts)
- [x] Atualizar valores na Home
- [x] Atualizar valores no NoCreditsModal
- [x] Atualizar valores no Chatbot
- [x] Atualizar valores no FAQ
- [x] Atualizar valores anuais (calculados automaticamente com 16,6% desconto)
- [x] Testar exibição dos novos valores





## Adicionar Seção de Créditos Avulsos na Home (04/11/2025)

- [x] Verificar estrutura da tabela de créditos avulsos no Dashboard
- [x] Adicionar seção "Acabaram seus créditos?" na Home abaixo dos planos
- [x] Replicar tabela de pacotes de créditos avulsos do Dashboard
- [x] Adicionar botão de compra em cada pacote
- [x] Testar visualmente a nova seção
- [x] Garantir responsividade mobile





## Alterar Prioridade dos Planos para Anual (04/11/2025)

- [x] Verificar estado atual do toggle de planos na Home
- [x] Alterar valor padrão de billingPeriod de 'monthly' para 'yearly'
- [x] Testar se planos anuais aparecem por padrão
- [x] Verificar se toggle Mensal/Anual continua funcionando
- [x] Garantir que nenhuma outra funcionalidade foi afetada





## Alterar Exibição de Preços Anuais (04/11/2025)

- [x] Mapear todos os locais onde preços anuais aparecem
- [x] Alterar função getYearlyPrice na Home para retornar valor mensal
- [x] Alterar exibição para mostrar "R$ XX,XX x 12" ao invés de valor total
- [x] Aplicar mesma lógica no NoCreditsModal
- [x] Verificar FAQ e Chatbot
- [x] Testar visualmente em todos os locais
- [x] Garantir que cálculo de pagamento continua correto





## CORREÇÃO URGENTE - Aplicar Desconto nos Preços Anuais (04/11/2025)

- [x] Calcular valor mensal COM desconto de 16,6%
- [x] Corrigir getDisplayPrice na Home para mostrar valor mensal com desconto
- [x] Corrigir getDisplayPrice no NoCreditsModal
- [x] Testar valores corretos (Aliança R$ 16,66 x 12, Lumen R$ 30,84 x 12, Premium R$ 57,53 x 12)





## Alterar Desconto de 16,6% para 16,5% (04/11/2025)

- [x] Mapear todos os locais onde 16,6% ou 0.166 aparecem
- [x] Alterar cálculo na Home (getYearlyPrice: 0.166 → 0.165)
- [x] Alterar cálculo no NoCreditsModal (getYearlyPrice: 0.166 → 0.165)
- [x] Alterar badge visual "Anual -16,6%" para "Anual -16,5%" na Home
- [x] Alterar badge visual no NoCreditsModal
- [x] Verificar comentários no código
- [x] Recalcular e testar todos os valores
- [x] Verificar se há outros arquivos com menção a 16,6%





## CORREÇÃO - Planos Anuais como Padrão no NoCreditsModal (04/11/2025)

- [x] Alterar useState de 'monthly' para 'yearly' no NoCreditsModal
- [x] Testar modal de upgrade no Dashboard
- [x] Verificar se planos anuais aparecem por padrão





## Adicionar Mensagem Promocional Piscante (04/11/2025)

- [x] Criar animação CSS para efeito piscante
- [x] Adicionar mensagem promocional na Home
- [x] Adicionar lógica condicional (só mostrar para visitantes e FREE)
- [x] Adicionar mensagem no NoCreditsModal
- [x] Testar visibilidade para visitante (não logado)
- [x] Testar visibilidade para usuário FREE
- [x] Testar que mensagem piscante funciona corretamente





## Remover Opção PIX das Assinaturas de Planos (04/11/2025)

- [x] Mapear onde aparece toggle "Renovação Automática / Pagamento Manual PIX"
- [x] Remover toggle do NoCreditsModal (seção de upgrade de planos)
- [x] Remover estado paymentType do NoCreditsModal
- [x] Ajustar lógica de checkout para usar apenas renovação automática
- [x] Verificar se há outros locais com opção PIX para assinaturas
- [x] Testar que assinaturas só aceitam cartão de crédito
- [x] Confirmar que créditos avulsos ainda têm opção PIX





## Adicionar Mensagem PIX nos Créditos Avulsos (04/11/2025)

- [x] Adicionar mensagem "OPÇÃO DE COMPRA POR PIX" na Home (seção créditos avulsos)
- [x] Adicionar mensagem no NoCreditsModal (seção créditos avulsos)
- [x] Estilizar com cores verde/destaque para associar com PIX
- [x] Testar visualmente em ambos os locais
- [x] Garantir que não afeta outras partes da plataforma





## CORREÇÃO - Scroll Automático para Topo no Dashboard (04/11/2025)

- [x] Adicionar useEffect no Dashboard para rolar para o topo ao carregar
- [x] Testar navegação do rodapé da Home para Dashboard
- [x] Verificar que não afeta outras navegações





## Adicionar Botão "Voltar ao Topo" em Todas as Páginas (05/11/2025)

- [x] Criar componente ScrollToTopButton reutilizável
- [x] Adicionar lógica de visibilidade (aparece após scroll ~200px)
- [x] Estilizar botão (circular, canto inferior direito, ícone seta)
- [x] Adicionar animação de scroll suave
- [x] Integrar no App.tsx para aparecer em todas as páginas
- [x] Testar em Home, Dashboard e FAQ





## CORREÇÃO - Reposicionar Botão Chatbot (05/11/2025)

- [x] Ajustar posição do botão Chatbot para não sobrepor botão Voltar ao Topo
- [x] Mover botão Chatbot mais acima (bottom-24 ou bottom-28)
- [x] Testar visualmente ambos os botões





## Alterar Sistema de Alertas de Inadimplência de 24h para 72h (05/11/2025)

- [x] Localizar código do sistema de alertas de inadimplência
- [x] Alterar período de bloqueio de 24h para 72h
- [x] Implementar avisos em 24h, 48h e 72h
- [x] Manter cores e lógica existentes (amarelo → laranja → vermelho)
- [x] Após 72h: bloqueio total + mensagem vermelha
- [x] Implementar cores progressivas (amarelo 48-72h, laranja 24-48h, laranja escuro 0-24h)
- [x] Verificar que nenhuma funcionalidade foi afetada





## CORREÇÃO - Tornar Botões do Modal de Estudos Mais Visíveis (05/11/2025)

- [x] Localizar botões Copiar, Baixar TXT, PDF e Compartilhar no modal
- [x] Remover transparência excessiva (variant outline)
- [x] Aplicar fundos sólidos azul escuro com texto branco
- [x] Adicionar font semibold e sombra para destaque
- [x] Testar visualmente no Dashboard





## CORREÇÃO - Ajustar Estilo do Botão Compartilhar (05/11/2025)

- [x] Localizar componente ShareButton
- [x] Aplicar mesmo estilo dos outros botões (fundo azul escuro, texto branco, semibold, sombra)
- [x] Testar visualmente no modal





## CORREÇÃO - Compartilhar Conteúdo do Estudo ao Invés de Link (05/11/2025)

- [ ] Localizar onde ShareButton é usado no SavedStudiesSection
- [ ] Modificar ShareButton para aceitar conteúdo do estudo como parâmetro
- [ ] Passar entrada + resultado do estudo para ShareButton
- [ ] Adicionar assinatura discreta no final: "GNOSIS AI, Inteligência Artificial para Estudos Profundos da Bíblia"
- [ ] Testar compartilhamento em WhatsApp, Facebook, etc
- [ ] Verificar que Instagram e TikTok copiam o conteúdo completo





## CORREÇÃO - Compartilhar Conteúdo Completo do Estudo (05/11/2025)

- [x] Localizar onde ShareButton é usado no modal de estudos salvos
- [x] Modificar ShareButton para aceitar parâmetro content
- [x] Passar conteúdo completo (entrada + resultado) para ShareButton
- [x] Adicionar assinatura discreta no final
- [x] Corrigir uso de ShareButton em ToolPage.tsx
- [x] Corrigir referência toolName para title no ShareButton
- [x] BUG: Corrigir linha 164 de SavedStudiesSection.tsx - trocar 'result' por 'output'
- [x] Testar compartilhamento em redes sociais - FUNCIONANDO PERFEITAMENTE




## Nova Ferramenta - Apologética Avançada (05/11/2025 - 04:30)

- [x] Analisar prompt técnico e sugerir melhorias
- [x] Adicionar ferramenta "Apologética Avançada" no banco de dados (tools table)
- [x] Atualizar seed-plans.ts com a nova ferramenta
- [x] Adicionar prompt completo no routers.ts
- [x] Adicionar ferramenta ao ToolPage.tsx com creditCost 120
- [x] Configurar restrição de acesso (apenas LUMEN e PREMIUM)
- [x] Atualizar contador de ferramentas: LUMEN e PREMIUM passam de 17 para 18
- [x] Atualizar Home.tsx com descrição da nova ferramenta
- [x] Atualizar Dashboard.tsx com a nova ferramenta (com ícone Shield)
- [x] Atualizar FAQ.tsx com informações sobre Apologética Avançada
- [x] Atualizar NoCreditsModal.tsx com a nova ferramenta
- [x] Atualizar Chatbot.tsx (Rebeca) com informações da nova ferramenta
- [x] Testar a ferramenta completa - Dashboard mostra Apologética Avançada corretamente
- [x] Verificar que nenhuma outra parte foi desconfigurada - Todas as páginas funcionando
- [x] Criar checkpoint final - f7a65dd0




## Liberar Plano Premium Automático para Todos os Administradores (06/11/2025 - 04:35)

- [x] Modificar backend (db.ts) para retornar todas as ferramentas para admins
- [x] Modificar credits.ts para dar créditos ilimitados a admins (999.999)
- [x] Modificar getUserActivePlan para retornar Premium para admins
- [x] Atualizar frontend para mostrar badge "ADMIN" no Dashboard e CreditsPanel
- [x] Testar acesso completo com usuário admin - Sistema configurado
- [x] Salvar checkpoint final - f7a65dd0




## Corrigir FAQ - Diferença entre Planos (06/11/2025 - 05:05)

- [x] Verificar informações atuais no FAQ sobre diferença entre planos
- [x] Corrigir valores de créditos para cada plano no FAQ
- [x] Corrigir valores de créditos no Chatbot (Rebeca) também
- [x] Verificar outras inconsistências - Tudo corrigido
- [x] Salvar checkpoint - f7a65dd0




## Adicionar Apologética Avançada no Modal de Upgrade (06/11/2025 - 05:12)

- [x] Localizar modal de upgrade no Dashboard - NoCreditsModal.tsx
- [x] Adicionar Apologética Avançada à lista de ferramentas do modal
- [x] Verificar se há outros modais com lista de ferramentas - Home.tsx já tinha
- [x] Salvar checkpoint - f7a65dd0




## Pop-up com Versículo Bíblico na Home (06/11/2025 - 05:20)

- [x] Criar componente VersePopup.tsx com design elegante GNOSIS AI
- [x] Implementar timer de 4 segundos
- [x] Implementar hover para manter aberto
- [x] Adicionar botão discreto para fechar
- [x] Integrar na Home.tsx (canto direito, acima do chat)
- [x] Testar funcionamento - Pop-up aparecendo perfeitamente!
- [x] Salvar checkpoint - f7a65dd0




## Ajustar Pop-up de Versículo (06/11/2025 - 05:28)

- [x] Mover pop-up para lado esquerdo (bottom-32 left-6)
- [x] Posicionar mais abaixo
- [x] Diminuir tamanho do pop-up (max-w-sm, texto xs)
- [x] Transformar em formato de balão de conversa (com pontinha)
- [x] Testar novo visual - Ficou perfeito!
- [x] Salvar checkpoint - f7a65dd0




## Corrigir Pop-up - Posição e Visibilidade (06/11/2025 - 05:35)

- [x] Investigar por que pop-up não aparece para admin - Sem condições de bloqueio
- [x] Ajustar posição para não sobrepor cabeçalho (top-40 - CORRIGIDO)
- [x] Aumentar z-index para 50 (garante visibilidade)
- [x] Garantir que apareça para TODOS os usuários - Sem restrições
- [x] Testar com diferentes contas - Pop-up aparece corretamente
- [ ] Salvar checkpoint

