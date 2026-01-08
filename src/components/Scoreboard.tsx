import { memo } from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './Scoreboard.module.css';

const Scoreboard = memo(() => {
  const { players, currentPlayer } = useGameStore();

  return (
    <div className={styles.scoreboard}>
      {players.map((player, i) => (
        <div
          key={i}
          className={`${styles['player-card']} ${i === currentPlayer ? styles.active : ''}`}
          style={{
            color: player.color,
            backgroundColor: i === currentPlayer ? 'rgba(30, 41, 59, 1)' : 'rgba(30, 41, 59, 0.5)',
          }}
        >
          <div className={styles['turn-indicator']} />
          <div className={styles['player-name']}>{player.name}</div>
          <div className={styles['player-score']}>{player.score}</div>
        </div>
      ))}
    </div>
  );
});

Scoreboard.displayName = 'Scoreboard';

export default Scoreboard;
