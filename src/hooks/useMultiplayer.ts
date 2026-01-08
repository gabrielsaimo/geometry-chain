import { useRef, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, type GameMessage } from '../config/supabase';
import { useOnlineStore } from '../store/onlineStore';
import { useGameStore } from '../store/gameStore';
import type { OnlinePlayer } from '../types/online';

// Singleton de conexão: precisa sobreviver à troca de telas (OnlineRoom -> GameBoard)
// Senão cada tela cria um hook separado e perde o canal.
let sharedChannel: RealtimeChannel | null = null;
let sharedMyPlayerId = '';
let sharedMyPlayerName = '';
let sharedMyColor = '';
let sharedRoomId: string | null = null;
let sharedIsHost = false;
let sharedExpectClose = false;
let sharedReconnectAttempts = 0;
let sharedReconnectInFlight = false;

function sortOnlinePlayers(list: OnlinePlayer[]) {
  return [...list].sort((a, b) => {
    const hostA = a.isHost ? 1 : 0;
    const hostB = b.isHost ? 1 : 0;
    if (hostA !== hostB) return hostB - hostA;
    return a.id.localeCompare(b.id);
  });
}

function processIncomingMessage(message: GameMessage) {
  console.log('📨 Mensagem recebida:', message);
  console.log('🔑 Meu ID:', sharedMyPlayerId, '| ID da mensagem:', message.playerId);

  switch (message.type) {
    case 'PLAYER_JOIN':
      console.log('👋 Jogador entrou:', message.payload);
      break;

    case 'MOVE':
      console.log('🎯 MOVIMENTO RECEBIDO DE OUTRO JOGADOR!', message.payload);
      window.dispatchEvent(
        new CustomEvent('online-game-message', {
          detail: message,
        })
      );
      break;

    case 'START_GAME':
      console.log('🎮 Jogo iniciado pelo host!');
      useOnlineStore.getState().setGameStarted(true);
      break;

    case 'RESET':
      console.log('🔄 Jogo resetado');
      useGameStore.getState().resetGame();
      break;

    case 'UPDATE_SCORE':
      console.log('📊 Pontuação atualizada:', message.payload);
      if (message.payload.players) {
        useOnlineStore.getState().setPlayers(message.payload.players);
      }
      break;

    case 'PLAYER_LEAVE':
      console.log('👋 Jogador saiu:', message.payload);
      useOnlineStore.getState().removePlayer(message.payload.playerId);
      break;
  }
}

async function safeUnsubscribe(channel: RealtimeChannel) {
  try {
    sharedExpectClose = true;
    await channel.unsubscribe();
  } catch {
    // ignore
  } finally {
    sharedExpectClose = false;
  }
}

async function connectOrReconnectToRoom(params: {
  roomId: string;
  playerId: string;
  playerName: string;
  color: string;
  isHost: boolean;
}) {
  const { roomId, playerId, playerName, color, isHost } = params;

  if (sharedReconnectInFlight) return;
  sharedReconnectInFlight = true;

  try {
    if (sharedChannel) {
      await safeUnsubscribe(sharedChannel);
      sharedChannel = null;
    }

    const channel = supabase.channel(roomId, {
      config: {
        broadcast: { self: false, ack: false },
        presence: { key: playerId },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('🔄 Presença atualizada:', state);

        const onlinePlayers: OnlinePlayer[] = Object.values(state)
          .flat()
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            color: p.color,
            isHost: p.isHost,
          }));

        useOnlineStore.getState().setPlayers(sortOnlinePlayers(onlinePlayers));
      })
      .on('broadcast', { event: 'game-action' }, ({ payload }) => {
        processIncomingMessage(payload as GameMessage);
      });

    sharedChannel = channel;

    await channel.subscribe(async (status) => {
      console.log('📡 Status de subscrição:', status);

      if (status === 'SUBSCRIBED') {
        sharedReconnectAttempts = 0;
        useOnlineStore.getState().setConnected(true);
        console.log('✅ Conectado ao canal:', roomId);

        await channel.track({
          id: playerId,
          name: playerName,
          color,
          isHost,
          online_at: new Date().toISOString(),
        });
      }

      if (status === 'CLOSED') {
        // Se foi um close esperado (unsubscribe), não é erro.
        if (sharedExpectClose) return;

        console.error('❌ Canal fechado inesperadamente (CLOSED)');
        useOnlineStore.getState().setConnected(false);

        // Reconnect com backoff simples
        if (!sharedRoomId || !sharedMyPlayerId) return;
        if (sharedReconnectAttempts >= 5) {
          console.error('❌ Reconnect excedeu tentativas');
          return;
        }

        sharedReconnectAttempts += 1;
        const delay = Math.min(500 * sharedReconnectAttempts, 4000);
        console.log(`🔁 Tentando reconectar em ${delay}ms (tentativa ${sharedReconnectAttempts})...`);

        setTimeout(() => {
          // evitar loop se já reconectou
          if (useOnlineStore.getState().connected) return;
          connectOrReconnectToRoom({
            roomId: sharedRoomId!,
            playerId: sharedMyPlayerId,
            playerName: sharedMyPlayerName,
            color: sharedMyColor,
            isHost: sharedIsHost,
          });
        }, delay);
      }

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('❌ Erro/timeout ao conectar:', status);
        useOnlineStore.getState().setConnected(false);
      }
    });
  } finally {
    sharedReconnectInFlight = false;
  }
}

export function useMultiplayer() {
  // refs locais apenas para não quebrar assinaturas do React; o estado real é global
  const channelRef = useRef<RealtimeChannel | null>(sharedChannel);
  const myPlayerIdRef = useRef<string>(sharedMyPlayerId);
  
  const {
    roomId,
    isHost,
    players,
    setRoomId,
    setMyPlayerId,
    setIsHost,
    setPlayers,
    setConnected,
    reset: resetOnline,
  } = useOnlineStore();

  // Gerar ID único para o jogador
  const generatePlayerId = useCallback(() => {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // sortOnlinePlayers agora é função global (determinística)

  // Criar sala (Host)
  const createRoom = useCallback(async (playerName: string) => {
    try {
      const playerId = generatePlayerId();
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      sharedMyPlayerId = playerId;
      sharedMyPlayerName = playerName;
      sharedMyColor = '#ef4444';
      sharedRoomId = roomId;
      sharedIsHost = true;
      myPlayerIdRef.current = playerId;
      setMyPlayerId(playerId);
      setRoomId(roomId);
      setIsHost(true);

      console.log('✅ Criando sala:', roomId);
      console.log('🔑 Player ID:', playerId);

      await connectOrReconnectToRoom({
        roomId,
        playerId,
        playerName,
        color: sharedMyColor,
        isHost: true,
      });

      channelRef.current = sharedChannel;
    } catch (error) {
      console.error('❌ Erro ao criar sala:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao criar sala: ${errorMsg}\n\nVerifique:\n- Conexão com internet\n- Configuração do Supabase\n- Console do navegador (F12) para detalhes`);
      setConnected(false);
    }
  }, [generatePlayerId, setMyPlayerId, setRoomId, setIsHost, setPlayers, setConnected]);

  // Entrar em sala
  const joinRoom = useCallback(async (roomIdToJoin: string, playerName: string) => {
    try {
      const playerId = generatePlayerId();
      
      sharedMyPlayerId = playerId;
      sharedMyPlayerName = playerName;
      sharedRoomId = roomIdToJoin;
      sharedIsHost = false;
      myPlayerIdRef.current = playerId;
      setMyPlayerId(playerId);
      setRoomId(roomIdToJoin);
      setIsHost(false);

      console.log('🔗 Entrando na sala:', roomIdToJoin);
      console.log('🔑 Player ID:', playerId);

      // Escolher cor diferente do host (baseado no snapshot atual)
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      const usedColors = players.map(p => p.color);
      const availableColor = colors.find(c => !usedColors.includes(c)) || colors[0];
      sharedMyColor = availableColor;

      await connectOrReconnectToRoom({
        roomId: roomIdToJoin,
        playerId,
        playerName,
        color: sharedMyColor,
        isHost: false,
      });

      channelRef.current = sharedChannel;

      // Notificar entrada (best effort)
      const joinMessage: GameMessage = {
        type: 'PLAYER_JOIN',
        payload: {
          id: playerId,
          name: playerName,
          color: sharedMyColor,
          isHost: false,
        },
        playerId,
        timestamp: Date.now(),
      };
      try {
        if (sharedChannel) {
          await sharedChannel.send({
            type: 'broadcast',
            event: 'game-action',
            payload: joinMessage,
          });
        }
      } catch {
        // ignore
      }
    } catch (error) {
      console.error('❌ Erro ao entrar na sala:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao entrar na sala: ${errorMsg}\n\nDicas:\n- Verifique se o código está correto\n- O host precisa criar a sala primeiro\n- Tente criar uma nova sala`);
      setConnected(false);
    }
  }, [generatePlayerId, setMyPlayerId, setRoomId, setIsHost, setPlayers, setConnected, players]);

  // Enviar mensagem (broadcast)
  const broadcast = useCallback(async (message: GameMessage) => {
    if (!sharedChannel) {
      console.warn('⚠️ Canal não está conectado');
      return;
    }

    try {
      await sharedChannel.send({
        type: 'broadcast',
        event: 'game-action',
        payload: message,
      });
      console.log('📤 Mensagem enviada:', message.type);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
    }
  }, []);

  // Enviar movimento
  const sendMove = useCallback(async (p1: any, p2: any, playerIndex: number) => {
    const message: GameMessage = {
      type: 'MOVE',
      payload: { 
        p1, 
        p2, 
        playerIndex
      },
      playerId: sharedMyPlayerId,
      timestamp: Date.now(),
    };

    await broadcast(message);
  }, [broadcast]);

  // Iniciar jogo (apenas host)
  const startGame = useCallback(async () => {
    if (!isHost) {
      console.warn('⚠️ Apenas o host pode iniciar o jogo');
      return;
    }

    console.log('🎮 Host iniciando jogo...');
    
    const message: GameMessage = {
      type: 'START_GAME',
      payload: { players },
      playerId: sharedMyPlayerId,
      timestamp: Date.now(),
    };

    await broadcast(message);
    
    // Marcar como iniciado localmente também
    useOnlineStore.getState().setGameStarted(true);
  }, [isHost, players, broadcast]);

  // Sair da sala
  const leaveRoom = useCallback(async () => {
    if (sharedChannel) {
      try {
        // Notificar saída
        const leaveMessage: GameMessage = {
          type: 'PLAYER_LEAVE',
          payload: { playerId: sharedMyPlayerId },
          playerId: sharedMyPlayerId,
          timestamp: Date.now(),
        };

        await sharedChannel.send({
          type: 'broadcast',
          event: 'game-action',
          payload: leaveMessage,
        });

        // Unsubscribe e limpar
        await sharedChannel.unsubscribe();
        sharedChannel = null;
        channelRef.current = null;
      } catch (error) {
        console.error('❌ Erro ao sair da sala:', error);
      }
    }

    sharedMyPlayerId = '';
    sharedMyPlayerName = '';
    sharedMyColor = '';
    sharedRoomId = null;
    sharedIsHost = false;
    myPlayerIdRef.current = '';

    resetOnline();
  }, [resetOnline]);

  // Importante: NÃO desconectar automaticamente no unmount.
  // A troca de telas desmonta componentes, mas a partida online precisa continuar.

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    sendMove,
    startGame,
    broadcast,
    roomId,
    isHost,
    players,
  };
}
