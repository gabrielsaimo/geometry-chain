# 🎮 Geometry Chain - React 19

Um jogo estratégico de conectar pontos em uma grade hexagonal para formar triângulos. Completamente reescrito em **React 19** com **TypeScript** e tecnologias modernas.

## ✨ Tecnologias Utilizadas

- **React 19** - Framework UI mais recente
- **TypeScript** - Type safety completo
- **Vite** - Build tool ultra-rápido com Rolldown (experimental)
- **Zustand** - Gerenciamento de estado leve e performático
- **CSS Modules** - Estilos escopados e modulares

## 🚀 Características

### Arquitetura Otimizada

- ✅ **Separação de Responsabilidades**: Lógica de negócio separada da UI
- ✅ **Hooks Customizados**: `useGameLogic`, `useCanvas` para reutilização
- ✅ **Type Safety**: Tipos TypeScript rigorosos em todo o código
- ✅ **Performance**: Memoização com `memo`, `useCallback`, `useMemo`
- ✅ **State Management**: Zustand com DevTools para debugging
- ✅ **CSS Modules**: Estilos isolados sem conflitos de classe

### Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── SetupScreen.tsx
│   ├── GameBoard.tsx
│   ├── Scoreboard.tsx
│   └── WinnerModal.tsx
├── hooks/              # Hooks customizados
│   ├── useGameLogic.ts
│   └── useCanvas.ts
├── store/              # Gerenciamento de estado
│   └── gameStore.ts
├── types/              # Definições TypeScript
│   └── game.ts
├── utils/              # Funções utilitárias
│   └── gameLogic.ts
└── App.tsx            # Componente principal
```

## 🎯 Como Funciona

### Gerenciamento de Estado (Zustand)

O estado global é gerenciado com Zustand, oferecendo:
- Performance superior ao Context API
- DevTools integrado para debugging
- API simples e intuitiva
- Atualizações imutáveis automáticas

### Hooks Customizados

**useGameLogic**: Encapsula toda a lógica do jogo
- Validação de movimentos
- Detecção de triângulos
- Sistema de pontuação
- Controle de turnos

**useCanvas**: Gerencia a interação com o canvas
- Renderização otimizada
- Eventos de mouse/touch
- Detecção de colisões
- Feedback visual

### Otimizações Aplicadas

1. **React.memo**: Componentes só re-renderizam quando necessário
2. **useCallback**: Callbacks estáveis para evitar re-renders
3. **useMemo**: Cálculos pesados cacheados
4. **Canvas RAF**: Desenho sincronizado com o browser
5. **Zustand**: Updates granulares do estado

## 📦 Instalação

```bash
cd geometry-chain-react
npm install
```

## 🎮 Executar

```bash
npm run dev
```

Acesse: http://localhost:5173

## 🏗️ Build de Produção

```bash
npm run build
npm run preview
```

## 🎨 Regras do Jogo

1. Escolha o número de jogadores (2-4)
2. Defina quantos pontos conectar (3-6)
3. Clique e arraste entre pontos válidos
4. Forme triângulos para ganhar pontos
5. Jogador com mais triângulos vence!

## 🔧 Diferenças da Versão HTML

### Vantagens da Versão React:

- ✅ **Manutenibilidade**: Código modular e organizado
- ✅ **Type Safety**: Erros detectados em tempo de desenvolvimento
- ✅ **Testabilidade**: Funções puras fáceis de testar
- ✅ **Escalabilidade**: Fácil adicionar novos recursos
- ✅ **Developer Experience**: Hot reload, TypeScript autocomplete
- ✅ **Performance**: Renderizações otimizadas automaticamente
- ✅ **Debugging**: Zustand DevTools, React DevTools

## 📝 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run lint` - Verificar código

## 🎯 Próximas Melhorias

- [ ] Testes unitários com Vitest
- [ ] Animações com Framer Motion
- [ ] Modo online multiplayer
- [ ] Histórico de partidas
- [ ] Temas customizáveis
- [ ] Sons e música

## 📄 Licença

MIT

---

**Desenvolvido com React 19, TypeScript e ❤️**
