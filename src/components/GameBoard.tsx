import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useOnlineStore } from '../store/onlineStore';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { useCanvas } from '../hooks/useCanvas';
import { useGameLogic } from '../hooks/useGameLogic';
import { useFullscreen } from '../hooks/useFullscreen';
import Scoreboard from './Scoreboard';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  onBack: () => void;
}

const GameBoard = memo(({ onBack }: GameBoardProps) => {
  const { setup, resetGame, dots, currentPlayer, players } = useGameStore();
  const { connected, myPlayerIndex } = useOnlineStore();
  const { sendMove } = useMultiplayer();
  const { makeMove, validateHoverLine, setNotificationHandler } = useGameLogic(connected ? sendMove : undefined);
  const { canvasRef } = useCanvas(makeMove, validateHoverLine);
  const [notification, setNotification] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(gameAreaRef);
  
  // Verificar se é a vez deste jogador
  const isMyTurn = !connected || myPlayerIndex === currentPlayer;

  const handleNotification = useCallback((text: string) => {
    setNotification(text);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 1000);
  }, []);

  useEffect(() => {
    setNotificationHandler(handleNotification);
  }, [setNotificationHandler, handleNotification]);

  // Receber movimentos de outros jogadores (apenas no modo online)
  useEffect(() => {
    if (!connected) {
      console.log('⚠️ Não conectado, listener de movimentos não ativo');
      return;
    }

    console.log('✅ Listener de movimentos online ATIVADO');

    const handleGameMessage = (event: CustomEvent) => {
      console.log('🎉 EVENTO online-game-message CAPTURADO NO GAMEBOARD!');
      const message = event.detail;
      console.log('📦 Detalhes da mensagem:', message);
      
      if (message.type === 'MOVE') {
        console.log('🎯 PROCESSANDO MOVIMENTO DE OUTRO JOGADOR!');
        console.log('📍 Payload:', message.payload);
        const { p1, p2, playerIndex } = message.payload;
        
        console.log('🔍 Procurando dots correspondentes...');
        console.log('📊 Total de dots disponíveis:', dots.length);
        
        // Encontrar os dots correspondentes
        const dot1 = dots.find(d => d.id === p1.id);
        const dot2 = dots.find(d => d.id === p2.id);
        
        console.log('🔍 Dot1 encontrado:', dot1);
        console.log('🔍 Dot2 encontrado:', dot2);
        
        if (dot1 && dot2) {
          console.log('✅ Aplicando movimento remoto...');
          // Aplicar movimento como remoto (não envia de volta)
          makeMove(dot1, dot2, true, playerIndex);
          console.log('✅ Movimento remoto aplicado!');
        } else {
          console.error('❌ Dots não encontrados!', {
            buscando: { p1Id: p1.id, p2Id: p2.id },
            encontrado: { dot1: !!dot1, dot2: !!dot2 }
          });
        }
      }
    };

    window.addEventListener('online-game-message', handleGameMessage as EventListener);
    console.log('👂 Event listener registrado para online-game-message');

    return () => {
      console.log('🔇 Removendo listener de movimentos online');
      window.removeEventListener('online-game-message', handleGameMessage as EventListener);
    };
  }, [connected, dots, makeMove]);

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
        {connected && players[currentPlayer] && (
          <div style={{ 
            marginTop: '6px', 
            padding: '8px 16px', 
            backgroundColor: isMyTurn 
              ? players[currentPlayer].color + '30'
              : '#1e293b',
            border: `2px solid ${players[currentPlayer].color}`,
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            textAlign: 'center',
            maxWidth: '350px',
            margin: '6px auto 0'
          }}>
            {isMyTurn ? (
              <>
                ⭐ SUA VEZ!
                <span style={{ fontSize: '0.75rem', opacity: 0.9, marginLeft: '8px' }}>
                  ({players[currentPlayer].name})
                </span>
              </>
            ) : (
              <>
                ⏳ Aguarde
                <span style={{ fontSize: '0.75rem', opacity: 0.9, marginLeft: '8px' }}>
                  (Vez de: {players[currentPlayer].name})
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className={styles['game-content']}>
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
          </div>
        </div>

        <div className={styles['scoreboard-wrapper']}>
          <Scoreboard />
        </div>
      </div>

      <div className={`${styles.notification} ${showNotification ? styles.show : ''}`}>
        {notification}
      </div>
    </div>
  );
});

GameBoard.displayName = 'GameBoard';

export default GameBoard;
