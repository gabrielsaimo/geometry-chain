import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Player, GameSetup, Dot, Line, Triangle } from '../types/game';
import { COLORS } from '../types/game';

interface GameState {
  // Setup
  setup: GameSetup;
  
  // Players
  players: Player[];
  currentPlayer: number;
  
  // Game State
  dots: Dot[];
  lines: Line[];
  triangles: Triangle[];
  isGameOver: boolean;
  
  // Actions
  updateSetup: (setup: Partial<GameSetup>) => void;
  setPlayers: (names: string[]) => void;
  setOnlinePlayers: (players: Array<{name: string; color: string}>) => void;
  setDots: (dots: Dot[]) => void;
  addLine: (line: Line) => void;
  addTriangle: (triangle: Triangle) => void;
  incrementScore: (player: number, points: number) => void;
  nextPlayer: () => void;
  setCurrentPlayer: (playerIndex: number) => void;
  resetGame: () => void;
  setGameOver: (value: boolean) => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    (set) => ({
      // Estado inicial
      setup: {
        playerCount: 2,
        lineLength: 4,
        gridSize: 4,
      },
      
      players: [],
      currentPlayer: 0,
      dots: [],
      lines: [],
      triangles: [],
      isGameOver: false,
      
      // Actions
      updateSetup: (newSetup) => 
        set((state) => ({
          setup: { ...state.setup, ...newSetup }
        }), false, 'updateSetup'),
      
      setPlayers: (names) =>
        set(() => ({
          players: names.map((name, i) => ({
            name: name || `Jogador ${i + 1}`,
            color: COLORS[i],
            score: 0,
          }))
        }), false, 'setPlayers'),
      
      setOnlinePlayers: (onlinePlayers) =>
        set(() => ({
          players: onlinePlayers.map((player) => ({
            name: player.name,
            color: player.color,
            score: 0,
          }))
        }), false, 'setOnlinePlayers'),
      
      setDots: (dots) => 
        set({ dots }, false, 'setDots'),
      
      addLine: (line) =>
        set((state) => ({
          lines: [...state.lines, line]
        }), false, 'addLine'),
      
      addTriangle: (triangle) =>
        set((state) => ({
          triangles: [...state.triangles, triangle]
        }), false, 'addTriangle'),
      
      incrementScore: (player, points) =>
        set((state) => ({
          players: state.players.map((p, i) =>
            i === player ? { ...p, score: p.score + points } : p
          )
        }), false, 'incrementScore'),
      
      nextPlayer: () =>
        set((state) => ({
          currentPlayer: (state.currentPlayer + 1) % state.players.length
        }), false, 'nextPlayer'),

      setCurrentPlayer: (playerIndex) =>
        set(() => ({
          currentPlayer: playerIndex
        }), false, 'setCurrentPlayer'),
      
      resetGame: () =>
        set((state) => ({
          currentPlayer: 0,
          lines: [],
          triangles: [],
          isGameOver: false,
          players: state.players.map(p => ({ ...p, score: 0 }))
        }), false, 'resetGame'),
      
      setGameOver: (value) =>
        set({ isGameOver: value }, false, 'setGameOver'),
    }),
    { name: 'GeometryChain' }
  )
);
