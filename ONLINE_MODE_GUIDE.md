# 🎮 Guia do Modo Multiplayer Online

## ✅ Correções Implementadas

### Problemas Resolvidos:
1. **Servidor PeerJS configurado** - Agora usa `0.peerjs.com` (servidor público e gratuito)
2. **HTTPS/SSL habilitado** - Funciona corretamente no Vercel
3. **Tratamento robusto de erros** - Mensagens claras para o usuário
4. **Logs detalhados** - Facilita debug durante desenvolvimento
5. **Configuração CORS otimizada** - `vercel.json` criado

---

## 🚀 Como Usar o Modo Online

### Para o Host (Criar Sala):

1. Clique em **"Multiplayer Online"** na tela inicial
2. Escolha a aba **"Criar Sala"**
3. Digite seu nome
4. Clique em **"Criar Sala"**
5. **Copie o código da sala** e envie para seus amigos
6. Aguarde os jogadores entrarem
7. Quando tiver 2+ jogadores, clique em **"Iniciar Jogo"**

### Para Convidados (Entrar em Sala):

1. Clique em **"Multiplayer Online"** na tela inicial
2. Escolha a aba **"Entrar em Sala"**
3. Digite seu nome
4. **Cole o código da sala** que o host enviou
5. Clique em **"Entrar na Sala"**
6. Aguarde o host iniciar o jogo

---

## 🔧 Tecnologia Utilizada

- **PeerJS** - WebRTC peer-to-peer
- **Servidor**: `0.peerjs.com` (gratuito, público)
- **STUN Servers**: Google STUN para NAT traversal
- **Protocolo**: HTTPS/WSS (seguro)

---

## 🐛 Solução de Problemas

### Erro: "Código da sala inválido ou expirado"
- Verifique se copiou o código completo
- Peça ao host para recriar a sala
- Código de sala expira após ~5 minutos de inatividade

### Erro: "Erro de conexão de rede"
- Verifique sua conexão com internet
- Alguns firewalls corporativos podem bloquear WebRTC
- Tente usar outra rede (4G/5G funcionam melhor)

### Não consigo conectar com amigos
- Ambos devem estar na versão mais recente
- Limpe o cache do navegador
- Tente recriar a sala
- Use navegadores modernos (Chrome, Firefox, Edge, Safari)

### Host não consegue iniciar o jogo
- Aguarde pelo menos 2 jogadores na sala
- Verifique se todos aparecem na lista de jogadores
- Se necessário, peça para os jogadores saírem e entrarem novamente

---

## 📱 Navegadores Suportados

✅ **Totalmente Suportado:**
- Chrome/Chromium 80+
- Firefox 75+
- Safari 14+ (macOS/iOS)
- Edge 80+

⚠️ **Suporte Limitado:**
- Safari < 14 (algumas funcionalidades podem não funcionar)

❌ **Não Suportado:**
- Internet Explorer

---

## 🌐 Deploy no Vercel

O modo online foi **otimizado para funcionar no Vercel**:

1. **HTTPS obrigatório** ✅ (Vercel fornece SSL automático)
2. **CORS configurado** ✅ (vercel.json incluído)
3. **Servidor PeerJS público** ✅ (não requer backend próprio)
4. **Build otimizado** ✅ (Vite + Vercel)

### Para fazer deploy:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Ou conecte seu repositório GitHub ao Vercel Dashboard.

---

## 🔒 Segurança

- Conexões peer-to-peer criptografadas
- Não armazenamos dados pessoais
- Salas temporárias (expiram automaticamente)
- Código de sala único por sessão

---

## 💡 Dicas de Performance

1. **Use conexão estável** - WiFi ou 4G/5G com boa cobertura
2. **Limite de jogadores** - Máximo 4 jogadores por sala para melhor experiência
3. **Navegadores atualizados** - Sempre use a versão mais recente
4. **Feche abas desnecessárias** - Libera recursos do navegador

---

## 🆘 Suporte

Se continuar tendo problemas:

1. Abra o console do navegador (F12)
2. Veja as mensagens de erro detalhadas
3. Tire uma captura de tela
4. Reporte o problema com os logs

---

## 📝 Limitações Conhecidas

- Salas expiram após inatividade (~5 min)
- Requer conexão constante com internet
- Não funciona offline
- Alguns firewalls corporativos podem bloquear
- Não há sincronização de estado se a conexão cair (será corrigido em versão futura)

---

## 🎯 Próximas Melhorias

- [ ] Reconexão automática
- [ ] Chat entre jogadores
- [ ] Histórico de partidas
- [ ] Modo espectador
- [ ] Servidor PeerJS próprio (opcional)
- [ ] Sincronização de estado persistente

---

**Desenvolvido com ❤️ para funcionar perfeitamente no Vercel!**
