# ✅ Checklist de Deploy - Modo Online

## 📋 Pré-Deploy

- [x] PeerJS configurado com servidor público (`0.peerjs.com`)
- [x] HTTPS/SSL configurado (secure: true)
- [x] STUN servers configurados
- [x] Tratamento de erros implementado
- [x] Logs de debug adicionados
- [x] vercel.json criado com CORS
- [x] Build testado localmente (`npm run build`)

## 🚀 Deploy no Vercel

### Via Dashboard:
```bash
# 1. Commit todas as mudanças
git add .
git commit -m "fix: Modo online funcionando com PeerJS"
git push origin main

# 2. Acesse vercel.com
# 3. Import/Update o projeto
# 4. Deploy automático!
```

### Via CLI:
```bash
# Instalar CLI (se não tiver)
npm install -g vercel

# Deploy
vercel --prod
```

## 🧪 Testes Pós-Deploy

### Teste 1: Criar Sala
- [ ] Acesse o site no Vercel
- [ ] Clique em "JOGAR ONLINE"
- [ ] Clique em "Criar Sala"
- [ ] Digite um nome
- [ ] Clique em "Criar Sala"
- [ ] **Resultado esperado**: Código de sala aparece

### Teste 2: Entrar na Sala (mesma aba)
- [ ] Abra o console do navegador (F12)
- [ ] Copie o código da sala
- [ ] Volte e clique em "Sair da Sala"
- [ ] Clique em "Entrar em Sala"
- [ ] Cole o código
- [ ] **Resultado esperado**: Conecta e vê 1 jogador

### Teste 3: Multiplayer Real (2 dispositivos)
- [ ] Dispositivo 1: Crie uma sala
- [ ] Dispositivo 2: Entre na sala com o código
- [ ] **Resultado esperado**: Ambos aparecem na lista
- [ ] Host: Clique em "Iniciar Jogo"
- [ ] **Resultado esperado**: Jogo inicia em ambos

### Teste 4: Erros
- [ ] Tente entrar com código inválido
- [ ] **Resultado esperado**: Mensagem de erro clara
- [ ] Verifique logs no console (F12)
- [ ] **Resultado esperado**: Logs detalhados com 🔗 ✅ ❌

## 🐛 Troubleshooting

### Problema: "Erro ao criar sala"
**Solução:**
1. Verifique console (F12)
2. Se erro de CORS, confirme que `vercel.json` está commitado
3. Se erro de peer, verifique se `0.peerjs.com` está acessível

### Problema: "Não consegue conectar"
**Solução:**
1. Ambos navegadores devem suportar WebRTC
2. Firewall/proxy pode bloquear
3. Tente em rede 4G/5G
4. Verifique se ambos estão na mesma versão do site

### Problema: "Sala expira rápido"
**Solução:**
- Normal! Salas do PeerJS expiram após inatividade
- Crie uma nova sala se necessário
- Future: Implementar keep-alive

## 📊 Monitoramento

### Métricas a Observar:
- Taxa de sucesso de criação de salas
- Taxa de conexão bem-sucedida
- Tempo médio para conectar
- Erros mais comuns no console

### Logs Importantes:
```
✅ Peer criado com ID: xxx        → Sala criada com sucesso
🔗 Tentando conectar ao room: xxx → Tentativa de entrar
✅ Conectado ao host              → Conexão estabelecida
❌ Erro no peer                   → Algo deu errado
```

## 🔄 Próximos Passos

Após confirmar que funciona:
- [ ] Testar com diferentes navegadores
- [ ] Testar em mobile (iOS/Android)
- [ ] Testar com 3-4 jogadores
- [ ] Monitorar erros por 24h
- [ ] Coletar feedback de usuários

## 📝 Notas

### Por que 0.peerjs.com?
- Servidor público gratuito
- Sem necessidade de backend próprio
- HTTPS/WSS já configurado
- Amplamente testado pela comunidade

### Alternativas Futuras:
- PeerJS Cloud (pago, mais estável)
- Servidor próprio com peerjs-server
- Implementar signaling via Firebase/Supabase

## ✅ Status Final

- [x] Código pronto
- [x] Build funcionando
- [x] Documentação completa
- [ ] Deploy realizado
- [ ] Testes pós-deploy OK
- [ ] Usuários testando

---

**Última atualização:** 8 de janeiro de 2026
**Responsável:** GitHub Copilot
**Status:** ✅ Pronto para deploy
