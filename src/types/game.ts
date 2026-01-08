// Tipos do jogo com type safety completo

export interface Dot {
  x: number;
  y: number;
  q: number;
  r: number;
  id: number;
}

export interface Line {
  p1: Dot;
  p2: Dot;
  player: number;
}

export interface Triangle {
  pts: [Dot, Dot, Dot];
  player: number;
  color: string;
}

export interface Player {
  name: string;
  color: string;
  score: number;
}

export interface GameSetup {
  playerCount: 2 | 3 | 4;
  lineLength: 3 | 4 | 5 | 6;
  gridSize: 3 | 4 | 5;
}

export interface HoverLine {
  p1: Dot;
  p2: Dot | { x: number; y: number };
  valid: boolean;
  intermediary?: Dot[];
}

export interface ValidationResult {
  valid: boolean;
  path?: Dot[];
}

export const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'] as const;

export const GRID_SIZE_MAP: Record<number, { name: string; maxTriangles: number }> = {
  3: { name: 'Pequeno (Rápido)', maxTriangles: 54 },
  4: { name: 'Padrão', maxTriangles: 96 },
  5: { name: 'Grande (Longo)', maxTriangles: 150 },
};
