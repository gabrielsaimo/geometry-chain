import { useState, memo } from 'react';
import { useGameStore } from '../store/gameStore';
import { COLORS, GRID_SIZE_MAP } from '../types/game';
import styles from './SetupScreen.module.css';

interface SetupScreenProps {
  onStart: () => void;
  onOnlineClick: () => void;
}

const SetupScreen = memo(({ onStart, onOnlineClick }: SetupScreenProps) => {
  const { setup, updateSetup, setPlayers } = useGameStore();
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: setup.playerCount }, (_, i) => `Jogador ${i + 1}`)
  );

  const handlePlayerCountChange = (count: 2 | 3 | 4) => {
    updateSetup({ playerCount: count });
    setPlayerNames(Array.from({ length: count }, (_, i) => `Jogador ${i + 1}`));
  };

  const handleLineLengthChange = (length: 3 | 4 | 5 | 6) => {
    let gridSize: 3 | 4 | 5;
    if (length === 3) gridSize = 3;
    else if (length >= 6) gridSize = 5;
    else gridSize = 4;

    updateSetup({ lineLength: length, gridSize });
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    setPlayers(playerNames);
    onStart();
  };

  return (
    <div className={styles['setup-screen']}>
      <div className={styles.header}>
        <h1 className={styles.title}>GEOMETRY CHAIN</h1>
        <p className={styles.subtitle}>Configuração da Partida</p>
      </div>

      <div className={styles['form-group']}>
        <label className={styles.label}>Número de Jogadores</label>
        <div className={styles['segmented-control']}>
          {([2, 3, 4] as const).map(n => (
            <button
              key={n}
              className={`${styles['segment-btn']} ${setup.playerCount === n ? styles.active : ''}`}
              onClick={() => handlePlayerCountChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className={styles['form-group']}>
        <label className={styles.label}>Nomes</label>
        <div className={styles['player-inputs']}>
          {playerNames.map((name, i) => (
            <div key={i} className={styles['player-row']}>
              <div
                className={styles['color-dot']}
                style={{ backgroundColor: COLORS[i] }}
              />
              <input
                type="text"
                className={styles.input}
                placeholder={`Nome do Jogador ${i + 1}`}
                value={name}
                onChange={(e) => handleNameChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles['form-group']}>
        <label className={styles.label}>Regra: Pontos para Conectar</label>
        <div className={styles['segmented-control']}>
          {([3, 4, 5, 6] as const).map(n => (
            <button
              key={n}
              className={`${styles['segment-btn']} ${setup.lineLength === n ? styles.active : ''}`}
              onClick={() => handleLineLengthChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className={styles.hint}>
          Tamanho do tabuleiro: {GRID_SIZE_MAP[setup.gridSize].name}
        </div>
      </div>

      <div className={styles['buttons-group']}>
        <button className={styles['start-btn']} onClick={handleStart}>
          INICIAR JOGO LOCAL
        </button>
        
        <button className={styles['online-btn']} onClick={onOnlineClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          JOGAR ONLINE
        </button>
      </div>
    </div>
  );
});

SetupScreen.displayName = 'SetupScreen';

export default SetupScreen;
