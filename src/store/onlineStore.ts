import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OnlinePlayer } from '../types/online';

interface OnlineState {
  isOnline: boolean;
  isGameStarted: boolean;
  roomId: string | null;
  myPlayerId: string | null;
  myPlayerIndex: number; // Índice do jogador no array (0 = primeiro, 1 = segundo)
  isHost: boolean;
  players: OnlinePlayer[];
  connected: boolean;
  
  setOnline: (online: boolean) => void;
  setGameStarted: (started: boolean) => void;
  setRoomId: (roomId: string | null) => void;
  setMyPlayerId: (id: string | null) => void;
  setMyPlayerIndex: (index: number) => void;
  setIsHost: (isHost: boolean) => void;
  setPlayers: (players: OnlinePlayer[]) => void;
  addPlayer: (player: OnlinePlayer) => void;
  removePlayer: (playerId: string) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useOnlineStore = create<OnlineState>()(
  devtools(
    (set) => ({
      isOnline: false,
      isGameStarted: false,
      roomId: null,
      myPlayerId: null,
      myPlayerIndex: -1,
      isHost: false,
      players: [],
      connected: false,
      
      setOnline: (online) => set({ isOnline: online }, false, 'setOnline'),
      
      setGameStarted: (started) => set({ isGameStarted: started }, false, 'setGameStarted'),
      
      setRoomId: (roomId) => set({ roomId }, false, 'setRoomId'),
      
      setMyPlayerId: (id) => set({ myPlayerId: id }, false, 'setMyPlayerId'),
      
      setMyPlayerIndex: (index) => set({ myPlayerIndex: index }, false, 'setMyPlayerIndex'),
      
      setIsHost: (isHost) => set({ isHost }, false, 'setIsHost'),
      
      setPlayers: (players) => set({ players }, false, 'setPlayers'),
      
      addPlayer: (player) =>
        set((state) => ({
          players: [...state.players, player]
        }), false, 'addPlayer'),
      
      removePlayer: (playerId) =>
        set((state) => ({
          players: state.players.filter(p => p.id !== playerId)
        }), false, 'removePlayer'),
      
      setConnected: (connected) => set({ connected }, false, 'setConnected'),
      
      reset: () =>
        set({
          isOnline: false,
          isGameStarted: false,
          roomId: null,
          myPlayerId: null,
          myPlayerIndex: -1,
          isHost: false,
          players: [],
          connected: false,
        }, false, 'reset'),
    }),
    { name: 'OnlineStore' }
  )
);
