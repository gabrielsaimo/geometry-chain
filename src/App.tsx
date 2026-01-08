import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import WinnerModal from './components/WinnerModal';
import OnlineRoom from './components/OnlineRoom';
import { useGameStore } from './store/gameStore';

function App() {
  const [screen, setScreen] = useState<'setup' | 'game' | 'online'>('setup');
  const { resetGame } = useGameStore();

  const handleStart = () => {
    setScreen('game');
  };

  const handleOnlineClick = () => {
    setScreen('online');
  };

  const handleOnlineClose = () => {
    setScreen('setup');
  };

  const handleOnlineStart = () => {
    setScreen('game');
  };

  const handleBack = () => {
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
        <OnlineRoom onClose={handleOnlineClose} onStartGame={handleOnlineStart} />
      )}
      <WinnerModal onPlayAgain={handlePlayAgain} onBackToMenu={handleBack} />
    </>
  );
}

export default App;
