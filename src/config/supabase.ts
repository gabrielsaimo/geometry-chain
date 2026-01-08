import { createClient } from '@supabase/supabase-js';

// Projeto Supabase para o jogo Geometry Chain
// Configuração do projeto em supabase.com
const SUPABASE_URL = 'https://ekefogiqjroatkczryzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZWZvZ2lxanJvYXRrY3pyeXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDk4MzksImV4cCI6MjA4MjYyNTgzOX0.QQk4GThmJfu_ZueZQu1ssBBGDxwtT67khT1g8j3MzzA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface Room {
  id: string;
  host_id: string;
  host_name: string;
  players: RoomPlayer[];
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface RoomPlayer {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  connected: boolean;
}

export interface GameMessage {
  type: 'MOVE' | 'RESET' | 'PLAYER_JOIN' | 'PLAYER_LEAVE' | 'START_GAME' | 'UPDATE_SCORE';
  payload: any;
  playerId: string;
  timestamp: number;
}
