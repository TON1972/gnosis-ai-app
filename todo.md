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

