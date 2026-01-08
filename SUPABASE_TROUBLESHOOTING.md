# 🔍 Guia de Verificação do Supabase

## ❌ Erro: "Código da sala inválido ou expirado"

Este erro geralmente significa que o Realtime do Supabase não está configurado corretamente.

---

## ✅ Checklist de Configuração

### 1. Verificar Realtime está Habilitado

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Abra seu projeto: **ekefogiqjroatkczryzw**
3. No menu lateral, vá em **Settings** (⚙️)
4. Clique em **API**
5. Role até encontrar **"Realtime"**
6. Certifique-se que está **ENABLED** (habilitado)

**Se estiver desabilitado:**
- Clique em **Enable Realtime**
- Salve as configurações
- Aguarde 1-2 minutos para propagar

---

### 2. Verificar Configuração de Broadcast

No painel do Supabase:

1. **Settings** → **API** → **Realtime**
2. Verifique se **Broadcast** está habilitado
3. Verifique se **Presence** está habilitado

Ambos precisam estar ✅ **ENABLED**

---

### 3. Testar Conectividade

Abra o console do navegador (F12) e execute:

```javascript
// Copie e cole no console
const { createClient } = window.supabase;
const client = createClient(
  'https://ekefogiqjroatkczryzw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZWZvZ2lxanJvYXRrY3pyeXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDk4MzksImV4cCI6MjA4MjYyNTgzOX0.QQk4GThmJfu_ZueZQu1ssBBGDxwtT67khT1g8j3MzzA'
);

const channel = client.channel('test-room');
channel.subscribe((status) => {
  console.log('Status:', status);
  if (status === 'SUBSCRIBED') {
    console.log('✅ Supabase funcionando!');
  } else {
    console.error('❌ Erro:', status);
  }
});
```

**Resultado esperado:** `✅ Supabase funcionando!`

---

### 4. Verificar Logs no Console

Quando você tenta criar/entrar numa sala, deve ver:

**Ao Criar Sala:**
```
🔌 Supabase configurado: https://ekefogiqjroatkczryzw.supabase.co
🔑 Realtime habilitado
✅ Criando sala: room_xxx
🔑 Player ID: player_xxx
📡 Status de subscrição (criar): SUBSCRIBED
✅ Conectado ao canal: room_xxx
```

**Ao Entrar em Sala:**
```
🔗 Entrando na sala: room_xxx
🔑 Player ID: player_xxx
📡 Status de subscrição: SUBSCRIBED
✅ Conectado à sala: room_xxx
```

**Se você vê outros status:**
- `CHANNEL_ERROR` → Realtime não habilitado ou URL/KEY errados
- `TIMED_OUT` → Problema de rede ou firewall
- `CLOSED` → Conexão perdida

---

### 5. Problemas Comuns

#### Erro: "CHANNEL_ERROR"
**Causa:** Realtime não habilitado no projeto  
**Solução:**
1. Vá em Settings → API → Realtime
2. Clique em Enable
3. Aguarde 2 minutos
4. Tente novamente

#### Erro: "TIMED_OUT"
**Causa:** Firewall ou problema de rede  
**Solução:**
1. Tente em outra rede (4G/5G)
2. Desative VPN temporariamente
3. Verifique se firewall não bloqueia WebSocket

#### Erro: "Invalid API Key"
**Causa:** Chave anon incorreta  
**Solução:**
1. Vá em Settings → API
2. Copie a **anon/public** key
3. Atualize em `src/config/supabase.ts`

---

### 6. Teste Rápido no Próprio Jogo

1. Abra o jogo em **duas abas** do navegador
2. Aba 1: Crie uma sala
3. **Se aparecer código da sala** → ✅ Está funcionando!
4. **Se aparecer erro** → Verifique console (F12)
5. Copie o código
6. Aba 2: Entre na sala com o código
7. **Se conectar** → ✅ Tudo OK!

---

### 7. Dashboard do Supabase - O Que Verificar

#### Em Settings → API:

**URL do Projeto:**
```
https://ekefogiqjroatkczryzw.supabase.co
```

**Anon Key (pública):**
```
eyJhbGciOiJI...
```

**Status do Realtime:**
- ✅ Broadcast: Enabled
- ✅ Presence: Enabled
- ✅ Postgres Changes: Enabled (opcional para este projeto)

**Rate Limits:**
- Connections: 200 (free tier)
- Messages per second: 100 (free tier)

---

### 8. Resetar Configuração (Se Nada Funcionar)

1. No Supabase Dashboard:
   - Settings → API → Realtime
   - **Disable** realtime
   - Aguarde 30 segundos
   - **Enable** realtime novamente

2. No seu projeto:
```bash
cd /Users/gabrielespindola/Documents/geometry-chain-react
rm -rf node_modules/.vite
npm run build
npm run dev
```

3. Limpe cache do navegador:
   - F12 → Application → Clear Storage → Clear Site Data
   - Recarregue a página

---

### 9. Alternativa: Usar Projeto Demo

Se você quiser testar rapidamente, pode usar temporariamente um projeto demo público:

Em `src/config/supabase.ts`, substitua temporariamente por:

```typescript
const SUPABASE_URL = 'https://fmxqjxzhgnnrjzlppuah.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZteHFqeHpoZ25ucmp6bHBwdWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ3MzQ0MDAsImV4cCI6MjAyMDMxMDQwMH0.7_-XC8aNqtL-K3m7MKmZhCGFWKZCdqP8J6ck6dYGKCs';
```

Este é um projeto demo que já tem Realtime habilitado. Use apenas para testar!

---

### 10. Suporte

Se após seguir todos os passos ainda não funcionar:

1. **Verifique logs completos:**
   - F12 → Console
   - Copie TODOS os logs que aparecem
   
2. **Verifique Network:**
   - F12 → Network → WS (WebSocket)
   - Veja se há conexões WebSocket sendo estabelecidas

3. **Teste status do Supabase:**
   - Acesse: https://status.supabase.com
   - Verifique se todos os serviços estão operacionais

---

## ✅ Resultado Esperado

Quando tudo estiver funcionando, você verá:

1. ✅ Sala criada com código
2. ✅ Outros jogadores conseguem entrar
3. ✅ Lista de jogadores atualiza em tempo real
4. ✅ Host consegue iniciar o jogo
5. ✅ Jogo sincroniza entre todos os jogadores

**Status:** Pronto para jogar! 🎮
