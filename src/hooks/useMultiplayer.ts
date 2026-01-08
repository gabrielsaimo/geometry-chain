import { useEffect, useRef, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, type GameMessage } from '../config/supabase';
import { useOnlineStore } from '../store/onlineStore';
import { useGameStore } from '../store/gameStore';
import type { OnlinePlayer } from '../types/online';

export function useMultiplayer() {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const myPlayerIdRef = useRef<string>('');
  
  const {
    roomId,
    isHost,
    players,
    setRoomId,
    setMyPlayerId,
    setIsHost,
    setPlayers,
    removePlayer,
    setConnected,
    reset: resetOnline,
  } = useOnlineStore();

  // Gerar ID único para o jogador
  const generatePlayerId = useCallback(() => {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Criar sala (Host)
  const createRoom = useCallback(async (playerName: string) => {
    try {
      const playerId = generatePlayerId();
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      myPlayerIdRef.current = playerId;
      setMyPlayerId(playerId);
      setRoomId(roomId);
      setIsHost(true);

      console.log('✅ Criando sala:', roomId);
      console.log('🔑 Player ID:', playerId);

      // Criar canal do Supabase Realtime
      const channel = supabase.channel(roomId, {
        config: {
          broadcast: { self: false, ack: false },
          presence: { key: playerId },
        },
      });

      // Configurar presença (quem está online)
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
          
          setPlayers(onlinePlayers);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('✅ Jogador entrou:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('❌ Jogador saiu:', key, leftPresences);
        })
        .on('broadcast', { event: 'game-action' }, ({ payload }) => {
          handleIncomingMessage(payload as GameMessage);
        });

      // Subscrever ao canal
      await channel.subscribe(async (status) => {
        console.log('📡 Status de subscrição (criar):', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao canal:', roomId);
          
          // Enviar presença do host
          await channel.track({
            id: playerId,
            name: playerName,
            color: '#ef4444',
            isHost: true,
            online_at: new Date().toISOString(),
          });
          
          setConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('❌ Erro ao conectar:', status);
          throw new Error(`Erro ao conectar ao canal: ${status}`);
        }
      });

      channelRef.current = channel;
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
      
      myPlayerIdRef.current = playerId;
      setMyPlayerId(playerId);
      setRoomId(roomIdToJoin);
      setIsHost(false);

      console.log('🔗 Entrando na sala:', roomIdToJoin);
      console.log('🔑 Player ID:', playerId);

      // Conectar ao canal existente
      const channel = supabase.channel(roomIdToJoin, {
        config: {
          broadcast: { self: false, ack: false },
          presence: { key: playerId },
        },
      });

      // Configurar presença
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
          
          setPlayers(onlinePlayers);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('✅ Jogador entrou:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('❌ Jogador saiu:', key, leftPresences);
        })
        .on('broadcast', { event: 'game-action' }, ({ payload }) => {
          handleIncomingMessage(payload as GameMessage);
        });

      // Subscrever ao canal
      await channel.subscribe(async (status) => {
        console.log('📡 Status de subscrição:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado à sala:', roomIdToJoin);
          
          // Escolher cor diferente do host
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
          const usedColors = players.map(p => p.color);
          const availableColor = colors.find(c => !usedColors.includes(c)) || colors[0];
          
          // Enviar presença
          await channel.track({
            id: playerId,
            name: playerName,
            color: availableColor,
            isHost: false,
            online_at: new Date().toISOString(),
          });
          
          setConnected(true);
          
          // Notificar entrada
          const joinMessage: GameMessage = {
            type: 'PLAYER_JOIN',
            payload: {
              id: playerId,
              name: playerName,
              color: availableColor,
              isHost: false,
            },
            playerId,
            timestamp: Date.now(),
          };
          
          await channel.send({
            type: 'broadcast',
            event: 'game-action',
            payload: joinMessage,
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('❌ Erro de conexão ao canal:', status);
          throw new Error(`Erro ao conectar: ${status}`);
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('❌ Erro ao entrar na sala:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao entrar na sala: ${errorMsg}\n\nDicas:\n- Verifique se o código está correto\n- O host precisa criar a sala primeiro\n- Tente criar uma nova sala`);
      setConnected(false);
    }
  }, [generatePlayerId, setMyPlayerId, setRoomId, setIsHost, setPlayers, setConnected, players]);

  // Processar mensagens recebidas
  const handleIncomingMessage = useCallback((message: GameMessage) => {
    console.log('📨 Mensagem recebida:', message);
    console.log('🔑 Meu ID:', myPlayerIdRef.current, '| ID da mensagem:', message.playerId);

    switch (message.type) {
      case 'PLAYER_JOIN':
        console.log('👋 Jogador entrou:', message.payload);
        break;

      case 'MOVE':
        // Emitir evento para o GameBoard processar
        console.log('🎯 MOVIMENTO RECEBIDO DE OUTRO JOGADOR!', message.payload);
        console.log('📍 Disparando evento online-game-message...');
        window.dispatchEvent(new CustomEvent('online-game-message', {
          detail: message
        }));
        console.log('✅ Evento disparado');
        break;

      case 'START_GAME':
        console.log('🎮 Jogo iniciado pelo host!');
        // Marcar como iniciado
        useOnlineStore.getState().setGameStarted(true);
        break;

      case 'RESET':
        console.log('🔄 Jogo resetado');
        useGameStore.getState().resetGame();
        break;

      case 'UPDATE_SCORE':
        console.log('📊 Pontuação atualizada:', message.payload);
        if (message.payload.players) {
          setPlayers(message.payload.players);
        }
        break;

      case 'PLAYER_LEAVE':
        console.log('👋 Jogador saiu:', message.payload);
        removePlayer(message.payload.playerId);
        break;
    }
  }, [setPlayers, removePlayer]);

  // Enviar mensagem (broadcast)
  const broadcast = useCallback(async (message: GameMessage) => {
    if (!channelRef.current) {
      console.warn('⚠️ Canal não está conectado');
      return;
    }

    try {
      await channelRef.current.send({
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
  const sendMove = useCallback(async (p1: any, p2: any) => {
    const message: GameMessage = {
      type: 'MOVE',
      payload: { p1, p2 },
      playerId: myPlayerIdRef.current,
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
      playerId: myPlayerIdRef.current,
      timestamp: Date.now(),
    };

    await broadcast(message);
    
    // Marcar como iniciado localmente também
    useOnlineStore.getState().setGameStarted(true);
  }, [isHost, players, broadcast]);

  // Sair da sala
  const leaveRoom = useCallback(async () => {
    if (channelRef.current) {
      try {
        // Notificar saída
        const leaveMessage: GameMessage = {
          type: 'PLAYER_LEAVE',
          payload: { playerId: myPlayerIdRef.current },
          playerId: myPlayerIdRef.current,
          timestamp: Date.now(),
        };

        await channelRef.current.send({
          type: 'broadcast',
          event: 'game-action',
          payload: leaveMessage,
        });

        // Unsubscribe e limpar
        await channelRef.current.unsubscribe();
        channelRef.current = null;
      } catch (error) {
        console.error('❌ Erro ao sair da sala:', error);
      }
    }

    resetOnline();
  }, [resetOnline]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

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
