export interface OnlinePlayer {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
}

export interface RoomState {
  roomId: string;
  players: OnlinePlayer[];
  currentTurn: string; // player id
  started: boolean;
}

export interface GameAction {
  type: 'MOVE' | 'RESET' | 'PLAYER_JOIN' | 'PLAYER_LEAVE' | 'START_GAME' | 'UPDATE_SCORE';
  payload: any;
  playerId: string;
  timestamp: number;
}

export interface MoveAction {
  p1: { q: number; r: number; id: number };
  p2: { q: number; r: number; id: number };
}
