# 🚀 Deploy na Vercel - Guia Completo

## 📋 Pré-requisitos

- Conta no GitHub
- Conta na Vercel (gratuita)
- Projeto commitado no Git

---

## 🎯 Método 1: Deploy via Vercel Dashboard (Mais Fácil)

### Passo 1: Prepare o Repositório

```bash
cd "/Users/gabrielespindola/Documents/Geometry game/geometry-chain-react"

# Inicializar Git (se ainda não fez)
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: Add fullscreen and online multiplayer"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/SEU-USUARIO/geometry-chain.git
git branch -M main
git push -u origin main
```

### Passo 2: Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório `geometry-chain`
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (já detectado)
   - **Output Directory**: `dist` (já detectado)
   - **Install Command**: `npm install` (já detectado)
6. Clique em **"Deploy"**

🎉 Pronto! Em ~2 minutos seu jogo estará online!

---

## 🎯 Método 2: Deploy via CLI (Mais Rápido)

### Instalar Vercel CLI

```bash
npm install -g vercel
```

### Deploy

```bash
cd "/Users/gabrielespindola/Documents/Geometry game/geometry-chain-react"

# Login (primeira vez)
vercel login

# Deploy de produção
vercel --prod
```

Siga as instruções:
- Set up and deploy? **Y**
- Which scope? Selecione sua conta
- Link to existing project? **N** (primeira vez)
- Project name? `geometry-chain` (ou outro nome)
- In which directory? `./` (já está correto)
- Want to modify settings? **N**

✅ Deploy concluído!

---

## ⚙️ Configuração Avançada (Opcional)

### vercel.json

Crie um arquivo `vercel.json` na raiz do projeto:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

---

## 🌐 Domínio Personalizado

### Adicionar Domínio

1. No Dashboard da Vercel, vá em **Settings**
2. Clique em **Domains**
3. Adicione seu domínio:
   - `geometrychain.com`
   - `www.geometrychain.com`
4. Configure o DNS conforme instruções

### Domínio Gratuito

A Vercel fornece gratuitamente:
- `seu-projeto.vercel.app`
- SSL automático
- CDN global

---

## 🔧 Variáveis de Ambiente (Se necessário)

Se no futuro adicionar APIs:

```bash
# No terminal
vercel env add VITE_API_KEY

# Ou no Dashboard > Settings > Environment Variables
```

No código:
```typescript
const apiKey = import.meta.env.VITE_API_KEY;
```

---

## 📊 Analytics e Monitoring

### Vercel Analytics (Gratuito)

1. No Dashboard, vá em **Analytics**
2. Clique em **Enable**
3. No código, adicione:

```bash
npm install @vercel/analytics
```

```typescript
// src/main.tsx
import { inject } from '@vercel/analytics';

inject();
```

### O que você terá:
- 📈 Pageviews
- 👥 Visitantes únicos
- 🌍 Localização geográfica
- 📱 Dispositivos

---

## 🚀 CI/CD Automático

### Push to Deploy

Após configurar, **cada push** no GitHub faz deploy automático:

```bash
git add .
git commit -m "fix: Correção de bug"
git push

# Vercel detecta e faz deploy automaticamente! 🎉
```

### Branches

- **main** → Production (`geometry-chain.vercel.app`)
- **develop** → Preview (`geometry-chain-git-develop.vercel.app`)
- **feature/xxx** → Preview (`geometry-chain-git-feature-xxx.vercel.app`)

---

## 🧪 Preview Deployments

### Pull Requests

Cada PR ganha uma URL de preview:
- Testa antes de fazer merge
- Compartilha com time
- Automaticamente atualizado

### Comandos

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Ver deployments
vercel ls

# Ver logs
vercel logs geometry-chain
```

---

## 📱 PWA (Próximo passo)

Para transformar em PWA instalável:

### 1. Instalar plugin

```bash
npm install vite-plugin-pwa -D
```

### 2. Configurar vite.config.ts

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Geometry Chain',
        short_name: 'GeoChain',
        description: 'Jogo estratégico de conectar pontos',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

### 3. Deploy

```bash
npm run build
vercel --prod
```

Agora o jogo pode ser instalado no celular! 📱

---

## 🔍 SEO Otimization

### public/index.html

Adicione meta tags:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO -->
  <title>Geometry Chain - Jogo de Estratégia Online</title>
  <meta name="description" content="Jogo estratégico de conectar pontos em grade hexagonal. Jogue sozinho ou online com amigos!">
  <meta name="keywords" content="jogo, estratégia, puzzle, online, multiplayer">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Geometry Chain">
  <meta property="og:description" content="Jogo de estratégia online">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://geometry-chain.vercel.app">
  <meta property="og:image" content="https://geometry-chain.vercel.app/og-image.png">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Geometry Chain">
  <meta name="twitter:description" content="Jogo de estratégia online">
  <meta name="twitter:image" content="https://geometry-chain.vercel.app/og-image.png">
</head>
```

---

## 📊 Performance na Vercel

### Esperado

- ⚡ **First Load**: < 1s
- ⚡ **TTI (Time to Interactive)**: < 2s
- ⚡ **Lighthouse Score**: 95+
- 🌍 **CDN Global**: Edge network
- 📦 **Brotli Compression**: Automático
- 🔒 **SSL**: Automático e gratuito

### Verificar Performance

```bash
# Lighthouse
npm install -g lighthouse

lighthouse https://seu-projeto.vercel.app --view
```

---

## 💰 Custos

### Free Tier (Hobby)
- ✅ Projetos ilimitados
- ✅ 100GB bandwidth/mês
- ✅ Deployments ilimitados
- ✅ SSL grátis
- ✅ CDN global
- ✅ Analytics básico

### Pro ($20/mês)
- 1TB bandwidth
- Analytics avançado
- Password protection
- Suporte prioritário

**Para este projeto, o Free Tier é mais que suficiente! 🎉**

---

## 🐛 Troubleshooting

### Build falha na Vercel

```bash
# Teste localmente primeiro
npm run build

# Se passar local mas falhar na Vercel:
# Verifique versões no package.json
# Limpe cache: Settings > General > Clear Cache
```

### 404 em rotas

Se tiver problemas com rotas, adicione em `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Multiplayer não funciona

Multiplayer P2P **funciona perfeitamente** na Vercel porque:
- ✅ Não precisa de servidor WebSocket
- ✅ P2P direto entre navegadores
- ✅ STUN servers públicos funcionam em qualquer host

---

## ✅ Checklist de Deploy

- [ ] Código commitado no Git
- [ ] Build local funciona (`npm run build`)
- [ ] Testes funcionando
- [ ] README.md atualizado
- [ ] Repositório no GitHub
- [ ] Deploy na Vercel
- [ ] Teste a URL de produção
- [ ] Teste multiplayer online
- [ ] Teste em mobile
- [ ] Configure domínio (opcional)
- [ ] Adicione Analytics (opcional)

---

## 🎉 Resultado Final

Após o deploy, você terá:

- 🌐 Jogo online: `https://geometry-chain.vercel.app`
- ⚡ Ultra-rápido com CDN global
- 🔒 HTTPS automático
- 📱 Funciona em qualquer dispositivo
- 🎮 Multiplayer P2P funcionando
- 🚀 Deploy automático a cada push
- 📊 Analytics (se habilitado)
- 💰 100% gratuito

---

**🚀 Seu jogo está pronto para o mundo! Compartilhe com todos! 🎮**

URL exemplo: `https://geometry-chain.vercel.app`
