import { useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { useOnlineStore } from '../store/onlineStore';
import { useGameStore } from '../store/gameStore';
import type { GameAction, MoveAction, OnlinePlayer } from '../types/online';

export function useMultiplayer() {
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  
  const {
    isOnline,
    roomId,
    myPlayerId,
    isHost,
    players,
    setRoomId,
    setMyPlayerId,
    setIsHost,
    addPlayer,
    removePlayer,
    setPlayers,
    setConnected,
    reset: resetOnline,
  } = useOnlineStore();

  // const { currentPlayer, players: gamePlayers } = useGameStore();

  // Criar sala (Host)
  const createRoom = useCallback((playerName: string) => {
    try {
      const peer = new Peer({
        host: '0.peerjs.com',
        port: 443,
        path: '/',
        secure: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ]
        },
        debug: 2,
      });

      peer.on('open', (id) => {
        console.log('✅ Peer criado com ID:', id);
        setMyPlayerId(id);
        setRoomId(id);
        setIsHost(true);
        
        const hostPlayer: OnlinePlayer = {
          id,
          name: playerName,
          color: '#ef4444',
          isHost: true,
        };
        
        setPlayers([hostPlayer]);
        setConnected(true);
      });

      peer.on('connection', (conn) => {
        console.log('🔗 Nova conexão recebida:', conn.peer);
        connectionsRef.current.set(conn.peer, conn);

        conn.on('open', () => {
          console.log('✅ Conexão aberta com:', conn.peer);
        });

        conn.on('data', (data) => {
          handleIncomingData(data as any, conn.peer);
        });

        conn.on('close', () => {
          console.log('❌ Conexão fechada:', conn.peer);
          connectionsRef.current.delete(conn.peer);
          removePlayer(conn.peer);
        });
        
        conn.on('error', (error) => {
          console.error('❌ Erro na conexão:', error);
        });
      });

      peer.on('error', (error) => {
        console.error('❌ Erro no peer (createRoom):', error);
        const errorMsg = error.type === 'peer-unavailable' 
          ? 'Código da sala inválido ou expirado'
          : error.type === 'network'
          ? 'Erro de conexão de rede'
          : error.type || error.message || 'Erro desconhecido';
        alert(`Erro ao criar sala: ${errorMsg}. Tente novamente.`);
        setConnected(false);
      });

      peerRef.current = peer;
    } catch (error) {
      console.error('❌ Erro ao criar peer:', error);
      alert('Erro ao criar sala. Verifique sua conexão e tente novamente.');
      setConnected(false);
    }
  }, [setMyPlayerId, setRoomId, setIsHost, setPlayers, setConnected, removePlayer]);

  // Entrar em sala
  const joinRoom = useCallback((roomId: string, playerName: string) => {
    try {
      const peer = new Peer({
        host: '0.peerjs.com',
        port: 443,
        path: '/',
        secure: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ]
        },
        debug: 2,
      });

      peer.on('open', (myId) => {
        console.log('✅ Meu ID:', myId);
        console.log('🔗 Tentando conectar ao room:', roomId);
        setMyPlayerId(myId);
        setRoomId(roomId);
        setIsHost(false);

        const conn = peer.connect(roomId, {
          reliable: true,
        });
        connectionsRef.current.set(roomId, conn);

        conn.on('open', () => {
          console.log('✅ Conectado ao host');
          setConnected(true);
          
          // Enviar info do jogador ao host
          const joinAction: GameAction = {
            type: 'PLAYER_JOIN',
            payload: {
              id: myId,
              name: playerName,
              color: '#3b82f6',
              isHost: false,
            },
            playerId: myId,
            timestamp: Date.now(),
          };
          
          conn.send(joinAction);
        });

        conn.on('data', (data) => {
          handleIncomingData(data as any, roomId);
        });

        conn.on('close', () => {
          console.log('❌ Desconectado do host');
          setConnected(false);
          connectionsRef.current.delete(roomId);
        });

        conn.on('error', (error) => {
          console.error('❌ Erro na conexão:', error);
          alert(`Erro ao conectar: ${error}. Verifique se o código da sala está correto.`);
          setConnected(false);
        });
      });

      peer.on('error', (error) => {
        console.error('❌ Erro no peer (joinRoom):', error);
        const errorMsg = error.type === 'peer-unavailable' 
          ? 'Código da sala inválido ou expirado'
          : error.type === 'network'
          ? 'Erro de conexão de rede'
          : error.type || error.message || 'Erro desconhecido';
        alert(`Erro: ${errorMsg}. Verifique o código da sala e tente novamente.`);
        setConnected(false);
      });

      peerRef.current = peer;
    } catch (error) {
      console.error('❌ Erro ao criar peer:', error);
      alert('Erro ao entrar na sala. Verifique sua conexão e tente novamente.');
      setConnected(false);
    }
  }, [setMyPlayerId, setRoomId, setIsHost, setConnected]);

  // Processar dados recebidos
  const handleIncomingData = useCallback((action: GameAction, _peerId: string) => {
    console.log('Ação recebida:', action);

    switch (action.type) {
      case 'PLAYER_JOIN':
        if (isHost) {
          // Host adiciona o jogador e envia estado atual
          addPlayer(action.payload);
          
          // Enviar lista atualizada de jogadores para todos
          const updatedPlayers = [...players, action.payload];
          broadcast({
            type: 'UPDATE_SCORE',
            payload: { players: updatedPlayers },
            playerId: myPlayerId || '',
            timestamp: Date.now(),
          });
        } else {
          // Cliente recebe lista atualizada
          if (action.payload.players) {
            setPlayers(action.payload.players);
          }
        }
        break;

      case 'MOVE':
        // Aplicar movimento recebido
        // const moveData = action.payload as MoveAction;
        // useGameLogic.makeMove será chamado externamente
        break;

      case 'RESET':
        // Resetar jogo
        useGameStore.getState().resetGame();
        break;

      case 'UPDATE_SCORE':
        if (action.payload.players) {
          setPlayers(action.payload.players);
        }
        break;
    }
  }, [isHost, players, myPlayerId, addPlayer, setPlayers]);

  // Broadcast para todos os peers
  const broadcast = useCallback((action: GameAction) => {
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(action);
      }
    });
  }, []);

  // Enviar movimento
  const sendMove = useCallback((p1: any, p2: any) => {
    if (!isOnline || !myPlayerId) return;

    const action: GameAction = {
      type: 'MOVE',
      payload: { p1, p2 } as MoveAction,
      playerId: myPlayerId,
      timestamp: Date.now(),
    };

    broadcast(action);
  }, [isOnline, myPlayerId, broadcast]);

  // Deixar sala
  const leaveRoom = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    connectionsRef.current.clear();
    resetOnline();
  }, [resetOnline]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    sendMove,
    broadcast,
    isOnline,
    roomId,
    isHost,
    players: players,
  };
}
