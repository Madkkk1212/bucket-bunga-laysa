'use client';

import { useCallback, useEffect, useRef } from 'react';
import HtmlGameRoom, { useHtmlGameRoom, type HtmlGameRoomMessage } from '@/components/minigames/HtmlGameRoom';
import { HTML_MINIGAME_CATALOG } from '@/components/minigames/htmlMiniGameCatalog';

type SnakePlayer = { id: string; name: string; color: string; pos: number };
type SnakeSnapshot = { N: number; np: number; L: number[][]; S: number[][]; elev: number[]; players: SnakePlayer[]; turn: number; moves: number; over: boolean; winnerId: string | null };

export default function SnakeLaddersHtml({
  initialRoomCode = '',
  initialRole,
  invitePath = '/minigames/ular-tangga',
}: {
  initialRoomCode?: string;
  initialRole?: 'host' | 'guest' | 'none';
  invitePath?: string;
}) {
  const game = HTML_MINIGAME_CATALOG['ular-tangga'];
  return (
    <HtmlGameRoom
      src={game.src}
      title={`Mini Games ${game.title}`}
      roomPrefix={game.roomPrefix}
      invitePath={invitePath}
      initialRoomCode={initialRoomCode}
      initialRole={initialRole}
      maxPlayers={game.maxPlayers}
      roomNote={game.roomNote}
      roomEntryMode="game"
    >
      <SnakeLaddersRoomBridge />
    </HtmlGameRoom>
  );
}

function SnakeLaddersRoomBridge() {
  const room = useHtmlGameRoom();
  const settingsRef = useRef({ np: 2, N: 10 });
  const snapshotRef = useRef<SnakeSnapshot | null>(null);

  const syncRoomState = useCallback(() => {
    room.postToGame('snake:room-state', {
      role: room.role,
      joinedPeers: room.joinedPlayers,
      localPeerId: room.localPeerId,
      playerName: room.playerName,
    });
  }, [room]);

  useEffect(() => { syncRoomState(); }, [syncRoomState]);

  const onGameMessage = useCallback((message: HtmlGameRoomMessage) => {
    if (message.type === 'html-room:iframe-ready') {
      syncRoomState();
      return;
    }
    if (message.type === 'snake:ready') {
      settingsRef.current = {
        np: Math.max(1, Math.min(4, Number(message.np) || 1)),
        N: Math.max(6, Math.min(12, Number(message.N) || 10)),
      };
      syncRoomState();
      return;
    }
    if (message.type === 'snake:settings') {
      const np = Math.max(2, Math.min(4, Number(message.np) || 2));
      const N = Math.max(6, Math.min(12, Number(message.N) || 10));
      settingsRef.current = { np, N };
      if (room.role === 'host') room.sendRoomMessage({ type: '__snake_settings__', np, N });
      if (room.role === 'host' && room.joinedPlayers.length + 1 > np) {
        room.joinedPlayers.slice(np - 1).forEach((peer) => room.sendRoomMessage({ type: '__room_full__', message: 'Host mengurangi jumlah kursi permainan.' }, peer.id));
      }
      syncRoomState();
      return;
    }
    if (message.type === 'snake:restart-request' && room.role === 'guest') {
      room.sendRoomMessage({ type: '__snake_restart_request__' });
      return;
    }
    if (message.type === 'snake:start-request' && room.role === 'host') {
      const requestedN = Number(message.N) || settingsRef.current.N;
      const joinedCount = room.joinedPlayers.length + 1;
      const np = Math.max(2, joinedCount);
      settingsRef.current = { np, N: requestedN };
      const colors = ['#e4572e', '#2e86ab', '#f2b134', '#4f9d69'];
      const players = [
        { id: room.localPeerId, name: room.playerName || 'Host', color: colors[0], pos: 1 },
        ...room.joinedPlayers.map((peer, index) => ({ id: peer.id, name: peer.name, color: colors[(index + 1) % colors.length], pos: 1 })),
      ];
      const state: SnakeSnapshot = {
        N: requestedN, np: players.length, L: message.L as number[][], S: message.S as number[][],
        elev: message.elev as number[], players, turn: 0, moves: 0, over: false, winnerId: null,
      };
      snapshotRef.current = state;
      room.postToGame('snake:start-online', { state: { ...state, localPeerId: room.localPeerId } });
      room.sendRoomMessage({ type: '__snake_start__', state });
      return;
    }
    if (message.type === 'snake:game-state' && room.role === 'host') {
      snapshotRef.current = message.state as SnakeSnapshot;
      room.sendRoomMessage({ type: '__snake_game_state__', state: message.state });
      return;
    }
    if (message.type === 'snake:dice-roll' && room.role === 'host') {
      room.sendRoomMessage({
        type: '__snake_dice_roll__',
        turnIndex: message.turnIndex,
        diceValue: message.diceValue,
        playerId: message.playerId,
      });
      return;
    }
    if (message.type === 'snake:roll-request' && room.role === 'guest') {
      room.sendRoomMessage({ type: '__snake_roll_request__', playerId: message.playerId });
    }
  }, [room, syncRoomState]);

  const onRoomMessage = useCallback((message: HtmlGameRoomMessage) => {
    if (message.type === '__player_join__' && room.role === 'host') {
      const peerId = String(message.fromPeerId || '');
      if (!peerId) return;
      room.sendRoomMessage({ type: '__snake_settings__', ...settingsRef.current }, peerId);
      if (snapshotRef.current) {
        // Send active snapshot to reconnecting/joining peer
        room.sendRoomMessage({ type: '__snake_start__', state: snapshotRef.current }, peerId);
      }
      return;
    }
    if (message.type === '__snake_restart_request__' && room.role === 'host') {
      room.postToGame('snake:host-restart');
      return;
    }
    if (message.type === '__snake_settings__' && room.role === 'guest') {
      room.postToGame('snake:settings', { np: message.np, N: message.N });
      return;
    }
    if (message.type === '__snake_start__' && room.role === 'guest') {
      const state = message.state as SnakeSnapshot;
      snapshotRef.current = state;
      room.postToGame('snake:start-online', { state: { ...state, localPeerId: room.localPeerId } });
      return;
    }
    if (message.type === '__snake_dice_roll__' && room.role === 'guest') {
      room.postToGame('snake:dice-roll', {
        turnIndex: message.turnIndex,
        diceValue: message.diceValue,
        playerId: message.playerId,
      });
      return;
    }
    if (message.type === '__snake_game_state__' && room.role === 'guest') {
      snapshotRef.current = message.state as SnakeSnapshot;
      room.postToGame('snake:apply-state', { state: message.state });
      return;
    }
    if (message.type === '__player_name_update__') {
      const peerId = String(message.peerId || message.fromPeerId || '');
      const newName = String(message.name || '');
      if (peerId && newName && snapshotRef.current) {
        const target = snapshotRef.current.players.find((p) => p.id === peerId);
        if (target) {
          target.name = newName;
          if (room.role === 'host') {
            room.sendRoomMessage({ type: '__snake_game_state__', state: snapshotRef.current });
          }
        }
      }
      room.postToGame('snake:player-name-update', { playerId: peerId, name: newName });
      return;
    }
    if (message.type === '__snake_roll_request__' && room.role === 'host') {
      const currentTurn = snapshotRef.current?.turn ?? 0;
      const currentPlayer = snapshotRef.current?.players?.[currentTurn];
      const fromPeerId = String(message.fromPeerId || '');
      const playerId = String(message.playerId || '');
      if (currentPlayer && (currentPlayer.id === fromPeerId || currentPlayer.id === playerId || room.joinedPlayers.some((p) => p.id === fromPeerId))) {
        room.postToGame('snake:remote-roll', { playerId: currentPlayer.id });
      }
    }
  }, [room]);

  useEffect(() => {
    if (room.role === 'host' && snapshotRef.current && room.playerName) {
      const hostPlayer = snapshotRef.current.players.find((p) => p.id === room.localPeerId);
      if (hostPlayer && hostPlayer.name !== room.playerName) {
        hostPlayer.name = room.playerName;
        room.sendRoomMessage({ type: '__snake_game_state__', state: snapshotRef.current });
        room.postToGame('snake:player-name-update', { playerId: room.localPeerId, name: room.playerName });
      }
    }
  }, [room.playerName, room.role, room.localPeerId, room]);

  const registerGameMessageHandler = room.registerGameMessageHandler;
  const registerRoomMessageHandler = room.registerRoomMessageHandler;
  useEffect(() => {
    registerGameMessageHandler(onGameMessage);
    return () => registerGameMessageHandler(null);
  }, [onGameMessage, registerGameMessageHandler]);
  useEffect(() => {
    registerRoomMessageHandler(onRoomMessage);
    return () => registerRoomMessageHandler(null);
  }, [onRoomMessage, registerRoomMessageHandler]);

  return null;
}
