import { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useOnlineStore } from '../store/onlineStore';
import type { Dot, HoverLine } from '../types/game';
import {
  isValidMove,
  checkNewTriangles,
  lineExists,
  findDotsInPath,
  checkGameOver,
} from '../utils/gameLogic';

export function useGameLogic(sendMove?: (p1: Dot, p2: Dot, playerIndex: number) => Promise<void>) {
  const {
    setup,
    players,
    currentPlayer,
    dots,
    lines,
    triangles,
    addLine,
    addTriangle,
    incrementScore,
    nextPlayer,
    setCurrentPlayer,
    setGameOver,
  } = useGameStore();

  const { connected } = useOnlineStore();
  const notificationCallback = useRef<((text: string) => void) | null>(null);

  const setNotificationHandler = useCallback((handler: (text: string) => void) => {
    notificationCallback.current = handler;
  }, []);

  const makeMove = useCallback(
    async (p1: Dot, p2: Dot, isRemote = false, remotePlayerIndex?: number) => {
      const activePlayer = isRemote && typeof remotePlayerIndex === 'number'
        ? remotePlayerIndex
        : currentPlayer;

      const validation = isValidMove(p1, p2, setup.lineLength, lines);
      if (!validation.valid || !validation.path) return;

      const path = findDotsInPath(validation.path, dots);
      let totalTriangles = 0;
      let segmentsAdded = 0;

      // Adicionar linhas
      for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];

        if (!lineExists(start, end, lines)) {
          addLine({ p1: start, p2: end, player: activePlayer });
          
          // Verificar novos triângulos
          const newTriangles = checkNewTriangles(
            start,
            end,
            [...lines, { p1: start, p2: end, player: activePlayer }],
            triangles,
            activePlayer,
            players[activePlayer]?.color || '#ffffff'
          );
          
          totalTriangles += newTriangles.length;
          newTriangles.forEach(t => addTriangle(t));
          segmentsAdded++;
        }
      }

      if (segmentsAdded === 0) return;

      // Atualizar pontuação
      if (totalTriangles > 0) {
        incrementScore(activePlayer, totalTriangles);
        if (notificationCallback.current) {
          notificationCallback.current(`+${totalTriangles} Triângulo${totalTriangles > 1 ? 's' : ''}!`);
        }
      }

      // Próximo jogador
      if (isRemote) {
        const next = players.length > 0 ? (activePlayer + 1) % players.length : 0;
        setCurrentPlayer(next);
      } else {
        nextPlayer();
      }

      // Verificar fim de jogo
      const totalScore = players.reduce((sum, p) => sum + p.score, 0) + totalTriangles;
      if (checkGameOver(totalScore, setup.gridSize)) {
        setGameOver(true);
      }

      // Se não for movimento remoto e estiver online, enviar para outros jogadores
      if (!isRemote && connected && sendMove) {
        const moverIndex = activePlayer;
        console.log('📤 ENVIANDO MOVIMENTO PARA OUTROS JOGADORES!');
        console.log('📍 P1:', p1);
        console.log('📍 P2:', p2);
        console.log('🌐 Connected:', connected);
        await sendMove(p1, p2, moverIndex);
        console.log('✅ Movimento enviado com sucesso');
      } else {
        console.log('⏭️ Movimento remoto ou offline, não enviando:', {
          isRemote,
          connected,
          hasSendMove: !!sendMove
        });
      }
    },
    [
      setup.lineLength,
      setup.gridSize,
      lines,
      dots,
      triangles,
      currentPlayer,
      players,
      addLine,
      addTriangle,
      incrementScore,
      nextPlayer,
      setCurrentPlayer,
      setGameOver,
      connected,
      sendMove,
    ]
  );

  const validateHoverLine = useCallback(
    (p1: Dot, p2: Dot): HoverLine => {
      const validation = isValidMove(p1, p2, setup.lineLength, lines);
      
      if (validation.valid && validation.path) {
        const path = findDotsInPath(validation.path, dots);
        return {
          p1,
          p2,
          valid: true,
          intermediary: path,
        };
      }
      
      return {
        p1,
        p2,
        valid: false,
      };
    },
    [setup.lineLength, lines, dots]
  );

  return {
    makeMove,
    validateHoverLine,
    setNotificationHandler,
  };
}
