# GNOSIS AI - TODO

## 🚨 PROBLEMA ATUAL

- [ ] Chat Rebeca voltou a redirecionar para api.manus.im (erro 404)
- [ ] ONTEM funcionava! Redirecionava para /auth (Gnosis.log)
- [ ] Código correto foi perdido no push errado de hoje
- [ ] Precisa recuperar a correção que funcionou ontem

## 🔄 PLANO DE AÇÃO

1. [ ] Inspecionar código do deploy 2uaxqQbYs em produção
2. [ ] Encontrar qual era a correção aplicada ontem
3. [ ] Aplicar a mesma correção no código local
4. [ ] Testar localmente
5. [ ] Fazer commit e push correto
6. [ ] Testar em produção

## 📝 INFORMAÇÕES TÉCNICAS

- Deploy correto: 2uaxqQbYs (commit 18144dc)
- Erro atual: GET https://api.manus.im/oauth/authorize?client_id=Ab5C8Nq9pGbzQm4EwPJGu4 404 (Not Found)
- Chat Rebeca aparece em todas as páginas
- Botão "Fazer login" do Chat Rebeca deve redirecionar para /auth

## ✅ CONCLUÍDO

- [x] Deploy 2uaxqQbYs promovido para produção
- [x] Site voltou ao normal (header, planos, FAQ)
- [x] Botão "Entrar" do header já redireciona para /auth


## 🎯 SOLUÇÃO ENCONTRADA

- [x] Criar componente ChatRebeca.tsx personalizado
- [x] Substituir chat injetado pelo sistema Manus
- [x] Botão "Fazer login" deve redirecionar para /auth (Gnosis.log)
- [x] Manter mesmas funcionalidades e visual
- [x] Adicionar componente em App.tsx ou main.tsx
