import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCanvas } from '../hooks/useCanvas';
import { useGameLogic } from '../hooks/useGameLogic';
import { useFullscreen } from '../hooks/useFullscreen';
import Scoreboard from './Scoreboard';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  onBack: () => void;
}

const GameBoard = memo(({ onBack }: GameBoardProps) => {
  const { setup, resetGame } = useGameStore();
  const { makeMove, validateHoverLine, setNotificationHandler } = useGameLogic();
  const { canvasRef } = useCanvas(makeMove, validateHoverLine);
  const [notification, setNotification] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(gameAreaRef);

  const handleNotification = useCallback((text: string) => {
    setNotification(text);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 1000);
  }, []);

  useEffect(() => {
    setNotificationHandler(handleNotification);
  }, [setNotificationHandler, handleNotification]);

  const handleReset = () => {
    resetGame();
  };

  return (
    <div className={styles['game-container']}>
      <div className={styles.header}>
        <h1 className={styles.title}>GEOMETRY CHAIN</h1>
        <div className={styles['rule-display']}>
          Regra: Conectar {setup.lineLength} pontos
        </div>
      </div>

      <div className={styles.controls}>
        <button className={`${styles.btn} ${styles['btn-danger']}`} onClick={onBack}>
          Sair
        </button>
        <button className={styles.btn} onClick={handleReset}>
          Reiniciar Partida
        </button>
        <button 
          className={`${styles.btn} ${styles['btn-fullscreen']}`} 
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
        >
          {isFullscreen ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
              Sair
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
              Expandir
            </>
          )}
        </button>
      </div>

      <div ref={gameAreaRef} className={styles['game-area-wrapper']}>
        <div className={styles['game-area']}>
          <canvas ref={canvasRef} className={styles.canvas} />
          <div className={`${styles.notification} ${showNotification ? styles.show : ''}`}>
            {notification}
          </div>
        </div>
      </div>

      <Scoreboard />
    </div>
  );
});

GameBoard.displayName = 'GameBoard';

export default GameBoard;
