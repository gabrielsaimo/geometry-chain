import { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Dot, HoverLine } from '../types/game';
import {
  isValidMove,
  checkNewTriangles,
  lineExists,
  findDotsInPath,
  checkGameOver,
} from '../utils/gameLogic';

export function useGameLogic() {
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
    setGameOver,
  } = useGameStore();

  const notificationCallback = useRef<((text: string) => void) | null>(null);

  const setNotificationHandler = useCallback((handler: (text: string) => void) => {
    notificationCallback.current = handler;
  }, []);

  const makeMove = useCallback(
    (p1: Dot, p2: Dot) => {
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
          addLine({ p1: start, p2: end, player: currentPlayer });
          
          // Verificar novos triângulos
          const newTriangles = checkNewTriangles(
            start,
            end,
            [...lines, { p1: start, p2: end, player: currentPlayer }],
            triangles,
            currentPlayer,
            players[currentPlayer].color
          );
          
          totalTriangles += newTriangles.length;
          newTriangles.forEach(t => addTriangle(t));
          segmentsAdded++;
        }
      }

      if (segmentsAdded === 0) return;

      // Atualizar pontuação
      if (totalTriangles > 0) {
        incrementScore(currentPlayer, totalTriangles);
        if (notificationCallback.current) {
          notificationCallback.current(`+${totalTriangles} Triângulo${totalTriangles > 1 ? 's' : ''}!`);
        }
      }

      // Próximo jogador
      nextPlayer();

      // Verificar fim de jogo
      const totalScore = players.reduce((sum, p) => sum + p.score, 0) + totalTriangles;
      if (checkGameOver(totalScore, setup.gridSize)) {
        setGameOver(true);
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
      setGameOver,
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
