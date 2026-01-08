import { memo, useState, useCallback } from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { useOnlineStore } from '../store/onlineStore';
import styles from './OnlineRoom.module.css';

interface OnlineRoomProps {
  onClose: () => void;
}

const OnlineRoom = memo(({ onClose }: OnlineRoomProps) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { createRoom, joinRoom, leaveRoom, startGame, roomId, isHost, players } = useMultiplayer();
  const { connected } = useOnlineStore();

  // Não precisamos mais do callback onGameStart aqui,
  // o App.tsx monitora o estado e muda a tela automaticamente

  const handleCreateRoom = useCallback(async () => {
    if (!playerName.trim()) return;
    await createRoom(playerName);
  }, [playerName, createRoom]);

  const handleJoinRoom = useCallback(async () => {
    if (!playerName.trim() || !roomIdInput.trim()) return;
    await joinRoom(roomIdInput, playerName);
  }, [playerName, roomIdInput, joinRoom]);

  const handleCopyRoomId = useCallback(() => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [roomId]);

  const handleLeave = useCallback(async () => {
    await leaveRoom();
    onClose();
  }, [leaveRoom, onClose]);

  const handleStart = useCallback(async () => {
    if (players.length >= 2) {
      console.log('🎮 Iniciando jogo...');
      await startGame();
      // O App.tsx mudará a tela automaticamente quando isGameStarted=true
    }
  }, [players, startGame]);

  return (
    <div className={styles['online-modal']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2 className={styles.title}>Multiplayer Online</h2>
          <button className={styles['close-btn']} onClick={onClose}>×</button>
        </div>

        {!connected ? (
          <>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${tab === 'create' ? styles.active : ''}`}
                onClick={() => setTab('create')}
              >
                Criar Sala
              </button>
              <button
                className={`${styles.tab} ${tab === 'join' ? styles.active : ''}`}
                onClick={() => setTab('join')}
              >
                Entrar em Sala
              </button>
            </div>

            {tab === 'create' ? (
              <div className={styles.form}>
                <div className={styles['input-group']}>
                  <label className={styles.label}>Seu Nome</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Digite seu nome"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={20}
                  />
                </div>

                <button
                  className={styles.btn}
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim()}
                >
                  Criar Sala
                </button>

                <p className={styles.hint}>
                  Você será o host da sala. Compartilhe o código com seus amigos!
                </p>
              </div>
            ) : (
              <div className={styles.form}>
                <div className={styles['input-group']}>
                  <label className={styles.label}>Seu Nome</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Digite seu nome"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={20}
                  />
                </div>

                <div className={styles['input-group']}>
                  <label className={styles.label}>Código da Sala</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Cole o código da sala"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                  />
                </div>

                <button
                  className={styles.btn}
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomIdInput.trim()}
                >
                  Entrar na Sala
                </button>

                <p className={styles.hint}>
                  Peça o código da sala para o host e cole acima.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.status}>
              <div className={styles['status-dot']} />
              <span>Conectado</span>
            </div>

            <div className={styles['room-info']}>
              <div className={styles['room-id']}>
                <span className={styles['room-id-text']}>{roomId}</span>
                <button className={styles['copy-btn']} onClick={handleCopyRoomId}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>

              <div className={styles['players-list']}>
                <div className={styles['players-title']}>
                  Jogadores ({players.length}/4)
                </div>
                {players.map((player) => (
                  <div key={player.id} className={styles['player-item']}>
                    <div
                      className={styles['player-color']}
                      style={{ backgroundColor: player.color }}
                    />
                    <span className={styles['player-name']}>{player.name}</span>
                    {player.isHost && (
                      <span className={styles['host-badge']}>HOST</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <button
                className={styles.btn}
                onClick={handleStart}
                disabled={players.length < 2}
              >
                Iniciar Jogo ({players.length >= 2 ? 'Pronto' : 'Aguardando jogadores'})
              </button>
            )}

            {!isHost && (
              <div className={styles.hint} style={{ textAlign: 'center' }}>
                Aguardando o host iniciar o jogo...
              </div>
            )}

            <button className={styles['leave-btn']} onClick={handleLeave}>
              Sair da Sala
            </button>
          </>
        )}
      </div>
    </div>
  );
});

OnlineRoom.displayName = 'OnlineRoom';

export default OnlineRoom;
