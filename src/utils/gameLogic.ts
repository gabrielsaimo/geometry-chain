import type { Dot, Line, Triangle, ValidationResult } from '../types/game';

/**
 * Gera uma grade hexagonal com coordenadas cúbicas
 */
export function generateHexGrid(
  size: number,
  canvasWidth: number,
  canvasHeight: number
): Dot[] {
  const dots: Dot[] = [];
  
  const contentWidth = canvasWidth - 40;
  const contentHeight = canvasHeight - 40;
  
  const spacingX = contentWidth / (size * 2.2);
  const spacingY = contentHeight / (size * 2 * 0.866 + 1);
  const spacing = Math.min(spacingX, spacingY);

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  let id = 0;
  for (let q = -size; q <= size; q++) {
    for (let r = -size; r <= size; r++) {
      const s = -q - r;
      if (Math.abs(q) <= size && Math.abs(r) <= size && Math.abs(s) <= size) {
        const px = centerX + spacing * (q + r / 2);
        const py = centerY + spacing * (r * 0.866);

        dots.push({ x: px, y: py, q, r, id: id++ });
      }
    }
  }
  
  return dots;
}

/**
 * Valida se um movimento é válido
 */
export function isValidMove(
  p1: Dot,
  p2: Dot,
  lineLength: number,
  lines: Line[]
): ValidationResult {
  const targetDist = lineLength - 1;

  const dq = p2.q - p1.q;
  const dr = p2.r - p1.r;
  const ds = (-p2.q - p2.r) - (-p1.q - p1.r);

  // 1. Colinear
  const isCollinear = dq === 0 || dr === 0 || ds === 0;
  if (!isCollinear) return { valid: false };

  // 2. Distância
  const dist = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
  if (dist !== targetDist) return { valid: false };

  // 3. Pontos Intermediários
  const path = getPointsOnLine(p1, p2, dist);

  // 4. Deve criar algo novo
  let hasNewSegment = false;
  for (let i = 0; i < path.length - 1; i++) {
    if (!lineExists(path[i], path[i + 1], lines)) {
      hasNewSegment = true;
      break;
    }
  }

  if (!hasNewSegment) return { valid: false };

  return { valid: true, path };
}

/**
 * Retorna os pontos intermediários de uma linha
 */
function getPointsOnLine(p1: Dot, p2: Dot, dist: number): Dot[] {
  const pts: Dot[] = [];
  for (let i = 0; i <= dist; i++) {
    const t = i / dist;
    const q = Math.round(p1.q + (p2.q - p1.q) * t);
    const r = Math.round(p1.r + (p2.r - p1.r) * t);
    
    // Nota: precisamos passar o array de dots aqui
    pts.push({ x: 0, y: 0, q, r, id: -1 }); // Temporário
  }
  return pts;
}

/**
 * Busca pontos específicos na grade
 */
export function findDotsInPath(
  path: { q: number; r: number }[],
  allDots: Dot[]
): Dot[] {
  return path
    .map(p => allDots.find(d => d.q === p.q && d.r === p.r))
    .filter((d): d is Dot => d !== undefined);
}

/**
 * Verifica se uma linha já existe
 */
export function lineExists(p1: Dot, p2: Dot, lines: Line[]): boolean {
  return lines.some(
    l =>
      (l.p1.id === p1.id && l.p2.id === p2.id) ||
      (l.p1.id === p2.id && l.p2.id === p1.id)
  );
}

/**
 * Verifica novos triângulos formados
 */
export function checkNewTriangles(
  p1: Dot,
  p2: Dot,
  lines: Line[],
  triangles: Triangle[],
  currentPlayer: number,
  playerColor: string
): Triangle[] {
  const newTriangles: Triangle[] = [];
  const neighbors1 = getConnectedNeighbors(p1, lines);
  const neighbors2 = getConnectedNeighbors(p2, lines);
  const common = neighbors1.filter(n1 =>
    neighbors2.some(n2 => n2.id === n1.id)
  );

  for (const p3 of common) {
    if (!triangleExists(p1, p2, p3, triangles)) {
      newTriangles.push({
        pts: [p1, p2, p3],
        player: currentPlayer,
        color: playerColor,
      });
    }
  }
  
  return newTriangles;
}

/**
 * Retorna vizinhos conectados por linhas
 */
function getConnectedNeighbors(p: Dot, lines: Line[]): Dot[] {
  const neighbors: Dot[] = [];
  for (const l of lines) {
    if (l.p1.id === p.id) neighbors.push(l.p2);
    else if (l.p2.id === p.id) neighbors.push(l.p1);
  }
  return neighbors;
}

/**
 * Verifica se um triângulo já existe
 */
function triangleExists(
  p1: Dot,
  p2: Dot,
  p3: Dot,
  triangles: Triangle[]
): boolean {
  const ids = [p1.id, p2.id, p3.id].sort().join(',');
  return triangles.some(t => {
    const tIds = t.pts.map(p => p.id).sort().join(',');
    return tIds === ids;
  });
}

/**
 * Encontra o ponto mais próximo de uma posição
 */
export function getClosestDot(
  pos: { x: number; y: number },
  dots: Dot[],
  gridSize: number
): Dot | null {
  let closest: Dot | null = null;
  let minDist = Infinity;
  const interactR = gridSize > 4 ? 20 : 30;

  for (const dot of dots) {
    const dx = dot.x - pos.x;
    const dy = dot.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < interactR && dist < minDist) {
      minDist = dist;
      closest = dot;
    }
  }
  
  return closest;
}

/**
 * Verifica se o jogo terminou
 */
export function checkGameOver(
  totalScore: number,
  gridSize: number
): boolean {
  const maxTriangles = 6 * (gridSize * gridSize);
  return totalScore >= maxTriangles;
}
