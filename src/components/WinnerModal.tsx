import { memo, useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './WinnerModal.module.css';

interface WinnerModalProps {
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const WinnerModal = memo(({ onPlayAgain, onBackToMenu }: WinnerModalProps) => {
  const { players, isGameOver } = useGameStore();

  const { winners, sortedPlayers } = useMemo(() => {
    const maxScore = Math.max(...players.map(p => p.score));
    const winnerIndices = players
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.score === maxScore)
      .map(({ i }) => i);
    
    const sorted = [...players].sort((a, b) => b.score - a.score);
    
    return { winners: winnerIndices, sortedPlayers: sorted };
  }, [players]);

  useEffect(() => {
    if (isGameOver) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isGameOver]);

  if (!isGameOver) return null;

  const winnerPlayer = players[winners[0]];
  const isTie = winners.length > 1;

  return (
    <div className={`${styles['modal-overlay']} ${isGameOver ? styles.show : ''}`}>
      <div className={styles['modal-content']}>
        <div className={styles['winner-title']}>Vencedor!</div>
        <div
          className={styles['winner-name']}
          style={{ color: isTie ? '#fff' : winnerPlayer.color }}
        >
          {isTie ? 'Empate!' : winnerPlayer.name}
        </div>

        <div className={styles['final-scores']}>
          {sortedPlayers.map((player, i) => (
            <div key={i} className={styles['score-row']} style={{ color: player.color }}>
              <span>{player.name}</span>
              <span>
                {player.score} <span className={styles['score-label']}>triângulos</span>
              </span>
            </div>
          ))}
        </div>

        <button className={styles['btn-large']} onClick={onPlayAgain}>
          Jogar Novamente
        </button>
        
        <button
          className={`${styles['btn-small']} ${styles['btn-danger']}`}
          onClick={onBackToMenu}
        >
          Menu Principal
        </button>
      </div>
    </div>
  );
});

WinnerModal.displayName = 'WinnerModal';

export default WinnerModal;
