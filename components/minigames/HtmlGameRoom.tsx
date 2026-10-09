'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Copy, Maximize2, Mic, MicOff, Minimize2, Sparkles, Users, Volume2, VolumeX, X } from 'lucide-react';
import { useWebRtcVoice, type PuzzleRoomRole } from '@/components/puzzle/useWebRtcVoice';

export type HtmlGameRoomMessage = Record<string, unknown>;
export type HtmlGameRoomPeer = { id: string; name: string };
export type HtmlGameRoomApi = {
  src: string;
  title: string;
  role: PuzzleRoomRole;
  roomCode: string;
  localPeerId: string;
  playerName: string;
  setPlayerName: (name: string) => void;
  joinedPlayers: HtmlGameRoomPeer[];
  voice: ReturnType<typeof useWebRtcVoice>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  postToGame: (type: string, data?: Record<string, unknown>) => void;
  sendRoomMessage: (data: Record<string, unknown>, targetPeerId?: string) => boolean;
  broadcastGameMessage: (payload: Record<string, unknown>) => boolean;
  registerRoomMessageHandler: (handler: ((data: HtmlGameRoomMessage) => void) | null) => void;
  registerGameMessageHandler: (handler: ((data: HtmlGameRoomMessage) => void) | null) => void;
  createRoom: () => void;
  joinRoomWithCode: (code: string) => boolean;
};

const HtmlGameRoomContext = createContext<HtmlGameRoomApi | null>(null);

export function useHtmlGameRoom() {
  const context = useContext(HtmlGameRoomContext);
  if (!context) throw new Error('useHtmlGameRoom harus digunakan di dalam HtmlGameRoom.');
  return context;
}

function normalizeRoom(value: string, prefix: string) {
  const token = value.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(new RegExp(`^${prefix}`, 'i'), '');
  return token.length >= 4 ? `${prefix}-${token.slice(0, 20)}` : '';
}

type HtmlGameRoomProps = {
  src: string;
  title: string;
  roomPrefix: string;
  invitePath: string;
  backHref?: string;
  maxPlayers?: number;
  initialRoomCode?: string;
  roomNote?: string;
  roomEntryMode?: 'external' | 'game';
  children?: ReactNode;
};

export default function HtmlGameRoom({
  src,
  title,
  roomPrefix,
  invitePath,
  backHref = '/minigames',
  maxPlayers = 4,
  initialRoomCode = '',
  roomNote = 'Buat room lalu bagikan undangannya agar teman dapat bergabung.',
  roomEntryMode = 'external',
  children,
}: HtmlGameRoomProps) {
  const router = useRouter();
  const prefix = roomPrefix.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const normalizedInitialRoom = normalizeRoom(initialRoomCode, prefix);
  const [roomCode, setRoomCode] = useState(normalizedInitialRoom);
  const [role, setRole] = useState<PuzzleRoomRole>(normalizedInitialRoom ? 'guest' : 'none');
  const [playerName, setPlayerName] = useState('Pemain');
  const [joinCode, setJoinCode] = useState('');
  const [joinedPlayers, setJoinedPlayers] = useState<HtmlGameRoomPeer[]>([]);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [waitingOpen, setWaitingOpen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const roomHandlerRef = useRef<((data: HtmlGameRoomMessage) => void) | null>(null);
  const gameHandlerRef = useRef<((data: HtmlGameRoomMessage) => void) | null>(null);
  const voiceRef = useRef<ReturnType<typeof useWebRtcVoice> | null>(null);
  const peersRef = useRef(joinedPlayers);
  const playerNameRef = useRef(playerName);
  useEffect(() => { playerNameRef.current = playerName; }, [playerName]);

  const tell = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  }, []);
  const postToGame = useCallback((type: string, data: Record<string, unknown> = {}) => {
    iframeRef.current?.contentWindow?.postMessage({ type, ...data }, window.location.origin);
  }, []);
  const createRoom = useCallback(() => {
    const code = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    peersRef.current = [];
    setJoinedPlayers([]);
    setRoomCode(code);
    setRole('host');
    setWaitingOpen(true);
  }, [prefix]);
  const joinRoomWithCode = useCallback((value: string) => {
    const code = normalizeRoom(value, prefix);
    if (!code) { tell(`Masukkan kode room ${prefix} yang benar (minimal 4 angka/huruf).`); return false; }
    peersRef.current = [];
    setJoinedPlayers([]);
    setRoomCode(code);
    setRole('guest');
    setWaitingOpen(false);
    setJoinCode('');
    return true;
  }, [prefix, tell]);
  const onRoomData = useCallback((data: HtmlGameRoomMessage) => {
    if (data.type === '__player_join__' && role === 'host') {
      setWaitingOpen(false);
      const peer = { id: String(data.fromPeerId || ''), name: String(data.name || 'Pemain') };
      if (peer.id && !peersRef.current.some((item) => item.id === peer.id)) {
        const next = [...peersRef.current, peer];
        peersRef.current = next;
        setJoinedPlayers(next);
      }
    } else if (data.type === '__player_leave__' && role === 'host') {
      const next = peersRef.current.filter((peer) => peer.id !== data.fromPeerId);
      peersRef.current = next;
      setJoinedPlayers(next);
    }
    if (data.type === '__html_game_broadcast__') {
      const fromPeerId = String(data.fromPeerId || '');
      if (role === 'host') {
        peersRef.current.filter((peer) => peer.id !== fromPeerId).forEach((peer) => {
          voiceRef.current?.sendMessage({ type: '__html_game_broadcast__', payload: data.payload, originPeerId: fromPeerId }, peer.id);
        });
      }
      postToGame('html-room:remote', { fromPeerId: String(data.originPeerId || fromPeerId), payload: data.payload });
    }
    roomHandlerRef.current?.(data);
  }, [postToGame, role]);
  const voice = useWebRtcVoice(roomCode, role !== 'none', role, maxPlayers, playerName, onRoomData);
  useEffect(() => { voiceRef.current = voice; }, [voice]);

  const sendRoomMessage = useCallback((data: Record<string, unknown>, targetPeerId?: string) => voice.sendMessage(data, targetPeerId), [voice]);
  const broadcastGameMessage = useCallback((payload: Record<string, unknown>) => sendRoomMessage({ type: '__html_game_broadcast__', payload }), [sendRoomMessage]);
  const registerRoomMessageHandler = useCallback((handler: ((data: HtmlGameRoomMessage) => void) | null) => { roomHandlerRef.current = handler; }, []);
  const registerGameMessageHandler = useCallback((handler: ((data: HtmlGameRoomMessage) => void) | null) => { gameHandlerRef.current = handler; }, []);

  useEffect(() => {
    const updateFullscreen = () => {
      const active = document.fullscreenElement === frameRef.current;
      setIsFullscreen(active);
      postToGame('html-room:fullscreen-state', { active });
    };
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === 'html-room:exit-fullscreen' && document.fullscreenElement === frameRef.current) {
        void document.exitFullscreen();
        return;
      }
      if (event.data?.type === 'html-room:create-room') { createRoom(); return; }
      if (event.data?.type === 'html-room:join-room') { joinRoomWithCode(String(event.data.code || '')); return; }
      if (event.data?.type === 'html-room:broadcast' && role !== 'none') {
        sendRoomMessage({ type: '__html_game_broadcast__', payload: event.data.payload });
        return;
      }
      if (event.data && typeof event.data === 'object') gameHandlerRef.current?.(event.data as HtmlGameRoomMessage);
    };
    document.addEventListener('fullscreenchange', updateFullscreen);
    window.addEventListener('message', handleMessage);
    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreen);
      window.removeEventListener('message', handleMessage);
    };
  }, [createRoom, joinRoomWithCode, postToGame, role, sendRoomMessage]);

  useEffect(() => {
    postToGame('html-room:state', {
      role,
      roomCode,
      localPeerId: voice.localPeerId,
      playerName,
      joinedPlayers,
      playerNames: role === 'host' ? [playerName, ...joinedPlayers.map((peer) => peer.name)] : voice.playerList,
      connectedPlayers: voice.connectedPlayers,
      maxPlayers,
      isHost: role === 'host',
    });
  }, [joinedPlayers, maxPlayers, playerName, postToGame, role, roomCode, voice.connectedPlayers, voice.localPeerId, voice.playerList]);

  const joinRoom = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    joinRoomWithCode(joinCode);
  };
  const leaveRoom = () => {
    peersRef.current = [];
    setJoinedPlayers([]);
    setRoomCode('');
    setRole('none');
    setWaitingOpen(false);
  };
  const copyInvite = async () => {
    const url = `${window.location.origin}${invitePath}?room=${encodeURIComponent(roomCode)}&role=guest`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      tell('Tautan room berhasil disalin.');
      window.setTimeout(() => setCopied(false), 2200);
    } catch { tell(`Bagikan kode room: ${roomCode}`); }
  };
  const toggleMic = async () => {
    const result = await voice.toggleMic();
    if (result.action === 'error') tell(result.errorMessage || 'Mikrofon tidak dapat diaktifkan.');
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frameRef.current?.requestFullscreen();
    } catch { tell('Mode layar penuh tidak didukung browser ini.'); }
  };

    useEffect(() => {
    postToGame('room:ping', { pingMs: voice.pingMs, pingQuality: voice.pingQuality });
  }, [voice.pingMs, voice.pingQuality, postToGame]);
  const roomLabel = role === 'none'
    ? 'Belum ada room online'
    : voice.connectionError || (voice.connectionStatus === 'hosting'
      ? 'Room siap · bagikan undangan'
      : voice.connectionStatus === 'connected' ? 'Room terhubung' : 'Menghubungkan ke room…');
  const api = useMemo<HtmlGameRoomApi>(() => ({
    src, title, role, roomCode, localPeerId: voice.localPeerId, playerName, setPlayerName,
    joinedPlayers, voice, iframeRef, postToGame, sendRoomMessage, broadcastGameMessage, registerRoomMessageHandler, registerGameMessageHandler, createRoom, joinRoomWithCode,
  }), [src, title, role, roomCode, voice, playerName, joinedPlayers, postToGame, sendRoomMessage, broadcastGameMessage, registerRoomMessageHandler, registerGameMessageHandler, createRoom, joinRoomWithCode]);

  return (
    <HtmlGameRoomContext.Provider value={api}>
      <main className="snake-html-page">
        {waitingOpen && role === 'host' && joinedPlayers.length === 0 && (
          <div className="mg-room-wait-backdrop" role="presentation">
            <section className="mg-room-wait-dialog" role="dialog" aria-modal="true" aria-labelledby="mg-room-wait-title">
              <button type="button" className="mg-room-wait-close" onClick={() => setWaitingOpen(false)} aria-label="Tutup popup menunggu"><X size={18} /></button>
              <div className="mg-room-wait-icon"><Users size={25} /><Sparkles size={14} /></div>
              <span className="mg-room-wait-kicker"><i /> ROOM SIAP</span>
              <h2 id="mg-room-wait-title">Menunggu teman bergabung</h2>
              <p>Bagikan kode atau tautan undangan. Game akan siap dimainkan bersama setelah teman masuk.</p>
              <div className="mg-room-wait-code-label">KODE ROOM</div>
              <strong className="mg-room-wait-code">{roomCode}</strong>
              <button type="button" className="mg-room-wait-share" onClick={() => void copyInvite()} disabled={!voice.isHosting && !voice.isConnected}>
                {copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Undangan tersalin' : 'Salin tautan undangan'}
              </button>
              <button type="button" className="mg-room-wait-later" onClick={() => setWaitingOpen(false)}>Lanjut ke game sambil menunggu</button>
              <div className="mg-room-wait-pulse" aria-hidden="true"><span /><span /><span /></div>
            </section>
          </div>
        )}
        <div className="snake-html-toolbar">
          <button type="button" className="snake-html-back" onClick={() => router.push(backHref)} aria-label="Kembali ke Mini Games">
            <ArrowLeft size={18} /><span>Mini Games</span>
          </button>
          <label className="snake-html-name"><span>Nama</span><input value={playerName} onChange={(event) => setPlayerName(event.target.value.slice(0, 20))} maxLength={20} aria-label="Nama pemain" /></label>
          <div className="snake-html-audio" aria-label="Kontrol game dan audio room">
            {/* Real-time P2P Network Ping Badge (Selalu Terlihat) */}
            <div
              className={`snake-html-ping-badge snake-html-ping--${voice.pingQuality}`}
              title={`Latensi P2P: ${voice.pingMs === null ? 'belum terhubung' : `${voice.pingMs}ms`}`}
            >
              <span className="snake-html-ping-dot" />
              <span className="snake-html-ping-val">{voice.pingMs === null ? '—' : `${voice.pingMs}ms`}</span>
            </div>
            <button type="button" className="snake-html-audio-btn snake-html-fullscreen-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Keluar dari layar penuh' : 'Masuk layar penuh'} aria-pressed={isFullscreen}>
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}<span>{isFullscreen ? 'Keluar penuh' : 'Layar penuh'}</span>
            </button>
            <button type="button" className={`snake-html-audio-btn ${voice.isMicOn ? 'is-on' : ''}`} onClick={toggleMic} disabled={role === 'none' || voice.connectionStatus !== 'connected'} aria-pressed={voice.isMicOn} aria-label={voice.isMicOn ? 'Matikan mikrofon' : 'Nyalakan mikrofon'}>
              {voice.isMicOn ? <Mic size={18} /> : <MicOff size={18} />}<span>{voice.isMicOn ? 'Mic aktif' : 'Mic mati'}</span>
            </button>
            <button type="button" className={`snake-html-audio-btn ${voice.isSpeakerOn ? 'is-on' : ''}`} onClick={voice.toggleSpeaker} aria-pressed={!voice.isSpeakerOn} aria-label={voice.isSpeakerOn ? 'Bisukan speaker' : 'Nyalakan speaker'}>
              {voice.isSpeakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}<span>{voice.isSpeakerOn ? 'Speaker aktif' : 'Speaker mute'}</span>
            </button>
          </div>
        </div>

        <section className="snake-html-room" aria-label="Pengaturan room online">
          <div className="snake-html-room-status"><span className={`snake-html-live ${voice.isConnected || voice.isHosting ? 'is-live' : ''}`} />{roomLabel}</div>
          <label className="snake-html-room-name"><span>Peserta room</span><strong>{role === 'host' ? [playerName, ...joinedPlayers.map((peer) => peer.name)].join(' · ') : voice.playerList.join(' · ')}</strong></label>
          {role === 'host' ? (
            <div className="snake-html-room-actions">
              <strong className="snake-html-code">{roomCode}</strong>
              <button type="button" className="snake-html-action" onClick={copyInvite} disabled={!voice.isHosting && !voice.isConnected}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Tersalin' : 'Salin undangan'}</button>
              <button type="button" className="snake-html-action snake-html-action--quiet" onClick={leaveRoom}>Keluar room</button>
            </div>
          ) : role === 'guest' ? (
            <div className="snake-html-room-actions"><strong className="snake-html-code">{roomCode}</strong><button type="button" className="snake-html-action snake-html-action--quiet" onClick={leaveRoom}>Keluar room</button></div>
          ) : (
            <div className="snake-html-room-actions">
              {roomEntryMode === 'game' ? <span className="snake-html-room-note">Pilih “Bersama teman” dari menu game untuk membuat room atau memasukkan kode.</span> : <>
                <button type="button" className="snake-html-action" onClick={createRoom}>Buat room online</button>
                <form onSubmit={joinRoom} className="snake-html-join-form"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder={`Kode ${prefix}`} aria-label={`Kode room ${prefix}`} /><button type="submit" className="snake-html-action">Gabung</button></form>
              </>}
            </div>
          )}
          <p className="snake-html-room-note">{roomNote}</p>
        </section>

        <div ref={frameRef} className={`snake-html-game-frame ${isFullscreen ? 'is-fullscreen' : ''}`}>
          <iframe ref={iframeRef} src={src} title={title} allow="microphone; autoplay; fullscreen" allowFullScreen onLoad={() => {
            postToGame('html-room:fullscreen-state', { active: Boolean(document.fullscreenElement) });
            postToGame('html-room:state', {
              role,
              roomCode,
              localPeerId: voice.localPeerId,
              playerName,
              joinedPlayers,
              playerNames: role === 'host' ? [playerName, ...joinedPlayers.map((peer) => peer.name)] : voice.playerList,
              connectedPlayers: voice.connectedPlayers,
              maxPlayers,
              isHost: role === 'host',
            });
            gameHandlerRef.current?.({ type: 'html-room:iframe-ready' });
          }} />
        </div>
        {notice && <div className="snake-html-toast" role="status">{notice}</div>}
        {children}
      </main>
    </HtmlGameRoomContext.Provider>
  );
}
