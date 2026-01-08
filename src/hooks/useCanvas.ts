import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateHexGrid, getClosestDot } from '../utils/gameLogic';
import type { Dot, HoverLine } from '../types/game';

interface CanvasInteractionState {
  selectedDot: Dot | null;
  hoverLine: HoverLine | null;
  isDrawing: boolean;
}

export function useCanvas(
  onMove: (p1: Dot, p2: Dot) => void,
  onValidateHover: (p1: Dot, p2: Dot) => HoverLine
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionRef = useRef<CanvasInteractionState>({
    selectedDot: null,
    hoverLine: null,
    isDrawing: false,
  });
  
  const { setup, dots, lines, triangles, players, currentPlayer, isGameOver, setDots } = useGameStore();

  // Inicializar grid quando canvas estiver pronto
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const newWidth = rect.width;
      const newHeight = rect.height;
      
      // Só atualizar se o tamanho mudou significativamente
      if (Math.abs(canvas.width - newWidth) > 1 || Math.abs(canvas.height - newHeight) > 1) {
        canvas.width = newWidth;
        canvas.height = newHeight;

        const newDots = generateHexGrid(setup.gridSize, canvas.width, canvas.height);
        setDots(newDots);
      }
    };

    // Atualizar tamanho inicial
    updateCanvasSize();

    // Observar mudanças de tamanho (incluindo fullscreen)
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [setup.gridSize, setDots]);

  // Função de desenho otimizada
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Triângulos
    triangles.forEach(t => {
      ctx.beginPath();
      ctx.moveTo(t.pts[0].x, t.pts[0].y);
      ctx.lineTo(t.pts[1].x, t.pts[1].y);
      ctx.lineTo(t.pts[2].x, t.pts[2].y);
      ctx.closePath();
      ctx.fillStyle = t.color + '80';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = t.color;
      ctx.stroke();
    });

    // Linhas
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
    lines.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l.p1.x, l.p1.y);
      ctx.lineTo(l.p2.x, l.p2.y);
      ctx.strokeStyle = players[l.player]?.color || '#fff';
      ctx.stroke();
    });

    // Linha de preview
    const { selectedDot, hoverLine } = interactionRef.current;
    if (selectedDot && hoverLine) {
      ctx.beginPath();
      ctx.moveTo(hoverLine.p1.x, hoverLine.p1.y);
      
      const p2 = hoverLine.p2;
      ctx.lineTo(p2.x, p2.y);
      
      ctx.lineWidth = 6;
      ctx.strokeStyle = hoverLine.valid
        ? players[currentPlayer].color
        : '#64748b';
      ctx.setLineDash(hoverLine.valid ? [] : [5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pontos intermediários
      if (hoverLine.valid && hoverLine.intermediary) {
        ctx.fillStyle = players[currentPlayer].color;
        hoverLine.intermediary.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    // Pontos
    const dotR = 6;
    dots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dotR, 0, Math.PI * 2);

      if (selectedDot && selectedDot.id === dot.id) {
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = players[currentPlayer].color;
      } else if (selectedDot && hoverLine?.valid && 'id' in hoverLine.p2 && hoverLine.p2.id === dot.id) {
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
      } else {
        ctx.fillStyle = '#475569';
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [dots, lines, triangles, players, currentPlayer]);

  // Atualizar desenho quando estado mudar
  useEffect(() => {
    draw();
  }, [draw]);

  // Handlers de interação
  const getPos = useCallback((e: MouseEvent | TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    // Calcular coordenadas considerando o scaling do canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handleStart = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (isGameOver) return;
      e.preventDefault();

      const pos = getPos(e);
      const dot = getClosestDot(pos, dots, setup.gridSize);

      if (dot) {
        interactionRef.current.selectedDot = dot;
        interactionRef.current.isDrawing = true;
        draw();
      }
    },
    [isGameOver, getPos, dots, setup.gridSize, draw]
  );

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (isGameOver) return;
      e.preventDefault();

      const pos = getPos(e);
      const { selectedDot } = interactionRef.current;

      if (selectedDot) {
        const targetDot = getClosestDot(pos, dots, setup.gridSize);

        if (targetDot && targetDot.id !== selectedDot.id) {
          const validated = onValidateHover(selectedDot, targetDot);
          interactionRef.current.hoverLine = validated;
        } else {
          interactionRef.current.hoverLine = {
            p1: selectedDot,
            p2: pos,
            valid: false,
          };
        }
      } else {
        const dot = getClosestDot(pos, dots, setup.gridSize);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = dot ? 'pointer' : 'default';
        }
      }

      draw();
    },
    [isGameOver, getPos, dots, setup.gridSize, onValidateHover, draw]
  );

  const handleEnd = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (isGameOver) return;
      e.preventDefault();

      const { selectedDot, hoverLine } = interactionRef.current;

      if (selectedDot && hoverLine?.valid && 'id' in hoverLine.p2) {
        onMove(selectedDot, hoverLine.p2);
      }

      interactionRef.current.selectedDot = null;
      interactionRef.current.hoverLine = null;
      interactionRef.current.isDrawing = false;
      draw();
    },
    [isGameOver, onMove, draw]
  );

  // Adicionar event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleStart as any);
    canvas.addEventListener('mousemove', handleMove as any);
    canvas.addEventListener('mouseup', handleEnd as any);
    canvas.addEventListener('touchstart', handleStart as any, { passive: false });
    canvas.addEventListener('touchmove', handleMove as any, { passive: false });
    canvas.addEventListener('touchend', handleEnd as any, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleStart as any);
      canvas.removeEventListener('mousemove', handleMove as any);
      canvas.removeEventListener('mouseup', handleEnd as any);
      canvas.removeEventListener('touchstart', handleStart as any);
      canvas.removeEventListener('touchmove', handleMove as any);
      canvas.removeEventListener('touchend', handleEnd as any);
    };
  }, [handleStart, handleMove, handleEnd]);

  return { canvasRef, draw };
}
