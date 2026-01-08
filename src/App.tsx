import { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import WinnerModal from './components/WinnerModal';
import OnlineRoom from './components/OnlineRoom';
import { useGameStore } from './store/gameStore';
import { useOnlineStore } from './store/onlineStore';

function App() {
  const [screen, setScreen] = useState<'setup' | 'game' | 'online'>('setup');
  const { resetGame, setOnlinePlayers } = useGameStore();
  const { connected, isGameStarted, players: onlinePlayers } = useOnlineStore();

  // Se estiver conectado e o jogo iniciar, mudar para tela de jogo
  useEffect(() => {
    if (connected && isGameStarted && screen === 'online') {
      console.log('🎮 Mudando para tela de jogo...');
      console.log('👥 Jogadores online:', onlinePlayers);
      console.log('📊 Quantidade de jogadores:', onlinePlayers.length);
      
      // Sincronizar jogadores da sala online com o gameStore
      if (onlinePlayers.length > 0) {
        const mappedPlayers = onlinePlayers.map(p => ({
          name: p.name,
          color: p.color
        }));
        console.log('✅ Sincronizando jogadores:', mappedPlayers);
        setOnlinePlayers(mappedPlayers);
        
        // Verificar se foi setado corretamente
        setTimeout(() => {
          const gameState = useGameStore.getState();
          console.log('🔍 Players no gameStore:', gameState.players);
        }, 100);
      } else {
        console.error('❌ Nenhum jogador online para sincronizar!');
      }
      
      setScreen('game');
    }
  }, [connected, isGameStarted, screen, onlinePlayers, setOnlinePlayers]);

  const handleStart = () => {
    setScreen('game');
  };

  const handleOnlineClick = () => {
    setScreen('online');
  };

  const handleOnlineClose = () => {
    setScreen('setup');
  };

  const handleBack = () => {
    // Resetar estado online ao voltar
    useOnlineStore.getState().setGameStarted(false);
    setScreen('setup');
  };

  const handlePlayAgain = () => {
    resetGame();
  };

  return (
    <>
      {screen === 'setup' && (
        <SetupScreen onStart={handleStart} onOnlineClick={handleOnlineClick} />
      )}
      {screen === 'game' && <GameBoard onBack={handleBack} />}
      {screen === 'online' && (
        <OnlineRoom onClose={handleOnlineClose} />
      )}
      <WinnerModal onPlayAgain={handlePlayAgain} onBackToMenu={handleBack} />
    </>
  );
}

export default App;
