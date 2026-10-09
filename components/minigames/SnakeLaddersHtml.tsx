'use client';

import { useCallback, useEffect, useRef } from 'react';
import HtmlGameRoom, { useHtmlGameRoom, type HtmlGameRoomMessage } from '@/components/minigames/HtmlGameRoom';
import { HTML_MINIGAME_CATALOG } from '@/components/minigames/htmlMiniGameCatalog';

type SnakePlayer = { id: string; name: string; color: string; pos: number };
type SnakeSnapshot = { N: number; np: number; L: number[][]; S: number[][]; elev: number[]; players: SnakePlayer[]; turn: number; moves: number; over: boolean; winnerId: string | null };

export default function SnakeLaddersHtml({ initialRoomCode = '', invitePath = '/minigames/ular-tangga' }: { initialRoomCode?: string; invitePath?: string }) {
  const game = HTML_MINIGAME_CATALOG['ular-tangga'];
  return (
    <HtmlGameRoom
      src={game.src}
      title={`Mini Games ${game.title}`}
      roomPrefix={game.roomPrefix}
      invitePath={invitePath}
      initialRoomCode={initialRoomCode}
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
    if (message.type === 'snake:start-request' && room.role === 'host') {
      const np = Number(message.np);
      if (np !== settingsRef.current.np || room.joinedPlayers.length + 1 !== np || !room.localPeerId) {
        const joined = room.joinedPlayers.length + 1;
        const reason = !room.localPeerId
          ? 'Room masih menyambungkan host. Tunggu sebentar lalu tekan Mulai lagi.'
          : np !== settingsRef.current.np
            ? 'Pengaturan pemain belum tersinkron. Pilih jumlah pemain lagi.'
            : `Menunggu peserta · ${joined}/${np} sudah bergabung.`;
        room.postToGame('snake:start-error', { message: reason });
        return;
      }
      const colors = ['#e4572e', '#2e86ab', '#f2b134', '#4f9d69'];
      const players = [
        { id: room.localPeerId, name: room.playerName || 'Host', color: colors[0], pos: 1 },
        ...room.joinedPlayers.map((peer, index) => ({ id: peer.id, name: peer.name, color: colors[(index + 1) % colors.length], pos: 1 })),
      ];
      const state: SnakeSnapshot = {
        N: Number(message.N), np, L: message.L as number[][], S: message.S as number[][],
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
    if (message.type === 'snake:roll-request' && room.role === 'guest') {
      room.sendRoomMessage({ type: '__snake_roll_request__', playerId: message.playerId });
    }
  }, [room, syncRoomState]);

  const onRoomMessage = useCallback((message: HtmlGameRoomMessage) => {
    if (message.type === '__player_join__' && room.role === 'host') {
      const peerId = String(message.fromPeerId || '');
      if (!peerId) return;
      if (room.joinedPlayers.length >= settingsRef.current.np - 1) {
        room.sendRoomMessage({ type: '__room_full__', message: 'Jumlah kursi permainan sudah penuh.' }, peerId);
        return;
      }
      room.sendRoomMessage({ type: '__snake_settings__', ...settingsRef.current }, peerId);
      if (snapshotRef.current) room.sendRoomMessage({ type: '__snake_start__', state: snapshotRef.current }, peerId);
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
    if (message.type === '__snake_game_state__' && room.role === 'guest') {
      snapshotRef.current = message.state as SnakeSnapshot;
      room.postToGame('snake:apply-state', { state: message.state });
      return;
    }
    if (message.type === '__snake_roll_request__' && room.role === 'host') {
      const currentPlayer = snapshotRef.current?.players?.[snapshotRef.current.turn];
      if (currentPlayer?.id === message.fromPeerId) room.postToGame('snake:remote-roll', { playerId: message.fromPeerId });
    }
  }, [room]);

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
