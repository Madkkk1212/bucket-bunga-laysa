'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type PuzzleRoomRole = 'none' | 'host' | 'guest';
export type PuzzleRoomStatus = 'idle' | 'connecting' | 'hosting' | 'connected' | 'error';

export interface ToggleMicResult {
  action: 'turned_on' | 'turned_off' | 'error';
  errorName?: string;
  errorMessage?: string;
}

type DataConnectionLike = {
  open?: boolean;
  peer?: string;
  send: (data: unknown) => void;
  close?: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  dataChannel?: RTCDataChannel;
};

type MediaCallLike = {
  peer?: string;
  peerConnection?: RTCPeerConnection;
  answer: (stream?: MediaStream) => void;
  close?: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
};

type AssetTransfer = {
  message: Record<string, any>;
  chunks: string[];
  received: number;
  total: number;
  timer: ReturnType<typeof setTimeout>;
};

const ASSET_CHUNK_SIZE = 12_000;
const MAX_ASSET_CHARS = 10_000_000;

function safeRoomToken(roomCode: string) {
  return roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
}

function getAudioSender(pc: RTCPeerConnection): RTCRtpSender | undefined {
  const direct = pc.getSenders().find((s) => s.track && s.track.kind === 'audio');
  if (direct) return direct;
  const transceiver = pc.getTransceivers().find(
    (t) =>
      t.sender?.track?.kind === 'audio' ||
      t.receiver?.track?.kind === 'audio' ||
      (t as any).kind === 'audio'
  );
  if (transceiver?.sender) return transceiver.sender;
  return pc.getSenders().find((s) => !s.track || s.track.kind === 'audio');
}

export function useWebRtcVoice(
  roomCode: string,
  isActive: boolean,
  role: PuzzleRoomRole,
  maxPlayers: number,
  playerName: string,
  onDataMessage?: (data: any) => void,
) {
  const [connectionStatus, setConnectionStatus] = useState<PuzzleRoomStatus>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [playerList, setPlayerList] = useState<string[]>([playerName]);
  const [localVolume, setLocalVolume] = useState(0);
  const [voiceBands, setVoiceBands] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [remoteVolume, setRemoteVolume] = useState(0);
  const [audioPlaybackBlocked, setAudioPlaybackBlocked] = useState(false);
  const [localPeerId, setLocalPeerId] = useState('');

  const peerRef = useRef<any>(null);
  const roleRef = useRef(role);
  const playerNameRef = useRef(playerName);
  const onDataMessageRef = useRef(onDataMessage);
  const dataConnectionsRef = useRef<DataConnectionLike[]>([]);
  const mediaCallsRef = useRef<MediaCallLike[]>([]);
  const setupCallRef = useRef<((call: MediaCallLike) => void) | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const silentStreamRef = useRef<MediaStream | null>(null);
  const silentAudioContextRef = useRef<AudioContext | null>(null);
  const meterAudioContextRef = useRef<AudioContext | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const transferMapRef = useRef(new Map<string, AssetTransfer>());
  const localPeerIdRef = useRef('');
  const isMicOnRef = useRef(false);
  const isSpeakerOnRef = useRef(true);
  const analyserRefs = useRef<{ local: AnalyserNode | null; remote: AnalyserNode | null }>({ local: null, remote: null });
  const audioSourceNodesRef = useRef<any[]>([]);
  const rafRef = useRef<number | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { isSpeakerOnRef.current = isSpeakerOn; }, [isSpeakerOn]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (peerRef.current) {
        try { peerRef.current.destroy(); } catch {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => { roleRef.current = role; }, [role]);
  useEffect(() => {
    playerNameRef.current = playerName;
    setPlayerList((prev) => {
      if (prev.length <= 1) return [playerName];
      return [playerName, ...prev.slice(1)];
    });
  }, [playerName]);
  useEffect(() => { onDataMessageRef.current = onDataMessage; }, [onDataMessage]);
  useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
  useEffect(() => {
    audioElementsRef.current.forEach((audio) => { audio.muted = !isSpeakerOn; });
  }, [isSpeakerOn]);

  // Global user interaction listener to ensure browser Autoplay Policy does not block incoming audio
  useEffect(() => {
    const unblockAudio = () => {
      audioElementsRef.current.forEach((audio) => {
        if (audio.paused) {
          audio.play().then(() => setAudioPlaybackBlocked(false)).catch(() => {});
        }
      });
      if (meterAudioContextRef.current && meterAudioContextRef.current.state === 'suspended') {
        meterAudioContextRef.current.resume().catch(() => {});
      }
    };
    window.addEventListener('click', unblockAudio, { passive: true });
    window.addEventListener('pointerdown', unblockAudio, { passive: true });
    window.addEventListener('touchstart', unblockAudio, { passive: true });
    window.addEventListener('keydown', unblockAudio, { passive: true });
    return () => {
      window.removeEventListener('click', unblockAudio);
      window.removeEventListener('pointerdown', unblockAudio);
      window.removeEventListener('touchstart', unblockAudio);
      window.removeEventListener('keydown', unblockAudio);
    };
  }, []);

  const makeSilentStream = useCallback(() => {
    if (silentStreamRef.current?.getAudioTracks().some((track) => track.readyState === 'live')) {
      return silentStreamRef.current;
    }
    try {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      const context: AudioContext = silentAudioContextRef.current || new AudioCtor();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const destination = context.createMediaStreamDestination();
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(destination);
      oscillator.start();
      context.resume().catch(() => {});
      silentAudioContextRef.current = context;
      silentStreamRef.current = destination.stream;
      return destination.stream;
    } catch {
      return new MediaStream();
    }
  }, []);

  const startMeter = useCallback((stream: MediaStream, local: boolean) => {
    try {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      const context: AudioContext = meterAudioContextRef.current || new AudioCtor();
      meterAudioContextRef.current = context;
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.35;
      const sourceNode = context.createMediaStreamSource(stream);
      sourceNode.connect(analyser);
      audioSourceNodesRef.current.push(sourceNode);
      if (local) analyserRefs.current.local = analyser;
      else analyserRefs.current.remote = analyser;
      context.resume().catch(() => {});

      const sample = new Uint8Array(analyser.frequencyBinCount);
      let lastUpdate = 0;
      const tick = (now: number) => {
        if (now - lastUpdate > 70) {
          lastUpdate = now;
          const localAnalyser = analyserRefs.current.local;
          if (localAnalyser && isMicOnRef.current) {
            localAnalyser.getByteFrequencyData(sample);
            const bands: [number, number, number, number] = [
              sample[1] + sample[2],
              sample[3] + sample[4] + sample[5],
              sample[6] + sample[7] + sample[8],
              sample[9] + sample[10] + sample[11],
            ].map((value) => Math.min(100, Math.round(value / 2.4))) as [number, number, number, number];
            const peak = Math.max(...bands);
            setVoiceBands(bands);
            setLocalVolume(peak);
            setIsSpeaking(peak > 12);
          } else {
            setVoiceBands([0, 0, 0, 0]);
            setLocalVolume(0);
            setIsSpeaking(false);
          }

          const remoteAnalyser = analyserRefs.current.remote;
          if (remoteAnalyser) {
            remoteAnalyser.getByteFrequencyData(sample);
            const avg = sample.reduce((sum, value) => sum + value, 0) / sample.length;
            setRemoteVolume(avg > 10 ? Math.min(100, Math.round((avg - 10) * 1.4)) : 0);
          } else {
            setRemoteVolume(0);
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
    } catch {
      // Audio playback remains available even if a browser blocks visual metering.
    }
  }, []);

  const sendMessage = useCallback((data: Record<string, any>, targetPeerId?: string) => {
    let connections = dataConnectionsRef.current.filter((connection) => connection.open);
    if (!connections.length) return false;
    if (targetPeerId) {
      const targeted = connections.filter(
        (connection) => connection.peer === targetPeerId || (connection as any).__remotePeerId === targetPeerId,
      );
      if (targeted.length > 0) connections = targeted;
    }

    // Drop intermediate move frames if WebRTC data channel buffer has backpressure (> 48KB)
    if (data.type === '__piece_move__') {
      connections = connections.filter(
        (c) => !(c.dataChannel && c.dataChannel.bufferedAmount > 48 * 1024),
      );
      if (!connections.length) return true;
    }

    const image = typeof data.customImageSrc === 'string' ? data.customImageSrc : '';
    if (image.length > MAX_ASSET_CHARS) {
      connections.forEach((connection) => {
        try { connection.send({ type: '__asset_error__', message: 'Foto terlalu besar untuk dikirim. Gunakan foto di bawah 7 MB.' }); } catch {}
      });
      return false;
    }

    if (image.length <= ASSET_CHUNK_SIZE) {
      connections.forEach((connection) => {
        try { connection.send(data); } catch {}
      });
      return true;
    }

    const transferId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    const chunks = Math.ceil(image.length / ASSET_CHUNK_SIZE);
    const { customImageSrc: _ignoredImage, ...message } = data;
    connections.forEach((connection) => {
      try {
        connection.send({ ...message, assetTransferId: transferId, assetChunkCount: chunks });
        for (let index = 0; index < chunks; index += 1) {
          connection.send({
            type: '__asset_chunk__',
            transferId,
            index,
            total: chunks,
            chunk: image.slice(index * ASSET_CHUNK_SIZE, (index + 1) * ASSET_CHUNK_SIZE),
          });
        }
      } catch {
        try { connection.send({ type: '__asset_error__', message: 'Foto gagal dikirim ke teman. Coba foto yang lebih kecil.' }); } catch {}
      }
    });
    return true;
  }, []);

  useEffect(() => {
    const token = safeRoomToken(roomCode);
    if (!isActive || role === 'none' || !token) {
      setConnectionStatus('idle');
      setConnectionError(null);
      setPingMs(null);
      setPlayerList([playerNameRef.current]);
      setLocalPeerId('');
      return;
    }

    let alive = true;
    let peer: any = null;
    const connections: DataConnectionLike[] = [];
    const calls: MediaCallLike[] = [];
    const transfers = transferMapRef.current;
    const hostId = `lysroom-${token}-host`;
    const guestId = `lysroom-${token}-guest-${Math.random().toString(36).slice(2, 9)}`;
    const startedAt = Date.now();
    const transferTimeouts: ReturnType<typeof setTimeout>[] = [];

    setConnectionStatus(role === 'host' ? 'connecting' : 'connecting');
    setConnectionError(null);
    setPingMs(null);
    setPlayerList([playerNameRef.current]);

    const statusError = (message: string) => {
      if (!alive) return;
      setConnectionStatus('error');
      setConnectionError(message);
    };

    const attachMeter = (stream: MediaStream, isLocal: boolean) => startMeter(stream, isLocal);

    const setupCall = (call: MediaCallLike) => {
      if (calls.some((existing) => existing.peer === call.peer)) {
        call.close?.();
        return;
      }
      calls.push(call);
      mediaCallsRef.current = calls;
      call.on('stream', (stream: MediaStream) => {
        if (!alive) return;
        let audio = (call as any).__audio as HTMLAudioElement | undefined;
        if (!audio) {
          audio = document.createElement('audio');
          audio.autoplay = true;
          audio.setAttribute('playsinline', 'true');
          audio.setAttribute('aria-hidden', 'true');
          audio.style.display = 'none';
          document.body.appendChild(audio);
          audioElementsRef.current.push(audio);
          (call as any).__audio = audio;
        }
        audio.muted = !isSpeakerOnRef.current;
        audio.srcObject = stream;
        const playStream = () => {
          audio?.play().then(() => setAudioPlaybackBlocked(false)).catch(() => setAudioPlaybackBlocked(true));
        };
        playStream();
        stream.getAudioTracks().forEach((track) => {
          track.onunmute = playStream;
        });
        attachMeter(stream, false);
      });
      const removeCall = () => {
        const audio = (call as any).__audio as HTMLAudioElement | undefined;
        audio?.remove();
        audioElementsRef.current = audioElementsRef.current.filter((item) => item !== audio);
        const index = calls.indexOf(call);
        if (index >= 0) calls.splice(index, 1);
        mediaCallsRef.current = calls;
      };
      call.on('close', removeCall);
      call.on('error', () => {
        removeCall();
        if (alive) setConnectionError('Voice terputus. Periksa jaringan dan coba nyalakan mikrofon lagi.');
      });
    };
    setupCallRef.current = setupCall;

    const deliver = (data: any, source?: DataConnectionLike) => {
      if (!data || typeof data !== 'object') return;
      if (data.type === '__ping__') {
        try { source?.send({ type: '__pong__', ts: data.ts }); } catch {}
        return;
      }
      if (data.type === '__pong__') {
        if (typeof data.ts === 'number') setPingMs(Math.max(1, Date.now() - data.ts));
        return;
      }
      if (data.type === '__room_full__') {
        source?.close?.();
        setConnectionStatus('error');
        setConnectionError(String(data.message || 'Kursi pemain di room ini sudah penuh.'));
        onDataMessageRef.current?.(data);
        return;
      }
      if (data.type === '__hello__') {
        const remoteName = String(data.name || 'Teman').slice(0, 24);
        const sourceConnection = source || connections.find((item) => (item as any).__remotePeerId === data.peerId);
        if (sourceConnection) {
          (sourceConnection as any).__remotePeerId = String(data.peerId || sourceConnection.peer || '');
          (sourceConnection as any).__remoteName = remoteName;
        }
        if (role === 'host') {
          const currentPlayers = [
            { id: localPeerIdRef.current || hostId, name: playerNameRef.current },
            ...connections.filter((item) => item.open).map((item) => ({
              id: String((item as any).__remotePeerId || item.peer || ''),
              name: String((item as any).__remoteName || 'Teman'),
            })),
          ].filter((item, index, list) => item.id && list.findIndex((peerItem) => peerItem.id === item.id) === index);
          const names = currentPlayers.map((item) => item.name);
          setPlayerList(names);
          connections.filter((item) => item.open).forEach((connection) => {
            try { connection.send({ type: '__peer_list__', players: currentPlayers, maxPlayers }); } catch {}
          });
          try { sourceConnection?.send({ type: '__welcome__', name: playerNameRef.current, maxPlayers }); } catch {}
        }
        onDataMessageRef.current?.({ ...data, type: '__player_join__', name: remoteName, fromPeerId: sourceConnection?.peer });
        return;
      }
      if (data.type === '__welcome__') {
        const remoteName = String(data.name || 'Host').slice(0, 24);
        setPlayerList([playerNameRef.current, remoteName]);
        onDataMessageRef.current?.({ ...data, type: '__player_welcome__', name: remoteName, players: [remoteName] });
        return;
      }
      if (data.type === '__peer_list__') {
        const peers = Array.isArray(data.players) ? data.players : [];
        const names = peers.map((item: any) => String(item?.name || '')).filter(Boolean);
        setPlayerList(Array.from(new Set(names)));
        if (role === 'guest' && peer && localPeerIdRef.current) {
          peers.forEach((item: any) => {
            const remoteId = String(item?.id || '');
            if (!remoteId || remoteId === localPeerIdRef.current || remoteId === hostId) return;
            if (localPeerIdRef.current.localeCompare(remoteId) < 0 && !calls.some((call) => call.peer === remoteId)) {
              try {
                const mediaCall = peer.call(remoteId, localStreamRef.current || makeSilentStream());
                if (mediaCall) setupCall(mediaCall);
              } catch {
                setConnectionError(`Voice langsung ke ${item?.name || 'teman'} gagal dimulai.`);
              }
            }
          });
        }
        onDataMessageRef.current?.(data);
        return;
      }
      if (data.type === '__asset_error__') {
        onDataMessageRef.current?.(data);
        return;
      }
      if (data.type === '__asset_chunk__') {
        const transfer = transfers.get(data.transferId);
        if (!transfer || !Number.isInteger(data.index) || data.index < 0 || data.index >= transfer.total) return;
        if (!transfer.chunks[data.index]) {
          transfer.chunks[data.index] = String(data.chunk || '');
          transfer.received += 1;
        }
        if (transfer.received === transfer.total) {
          clearTimeout(transfer.timer);
          transfers.delete(data.transferId);
          const image = transfer.chunks.join('');
          if (image.length <= MAX_ASSET_CHARS) {
            onDataMessageRef.current?.({ ...transfer.message, customImageSrc: image, fromPeerId: source?.peer });
          } else {
            onDataMessageRef.current?.({ type: '__asset_error__', message: 'Foto yang diterima terlalu besar.' });
          }
        }
        return;
      }
      if (data.assetTransferId && Number.isInteger(data.assetChunkCount)) {
        const total = data.assetChunkCount;
        if (total < 1 || total > Math.ceil(MAX_ASSET_CHARS / ASSET_CHUNK_SIZE)) return;
        const id = String(data.assetTransferId);
        const timer = setTimeout(() => {
          transfers.delete(id);
          onDataMessageRef.current?.({ type: '__asset_error__', message: 'Pengiriman foto terputus. Minta host kirim ulang.' });
        }, 30_000);
        transferTimeouts.push(timer);
        transfers.set(id, { message: data, chunks: new Array(total), received: 0, total, timer });
        return;
      }
      if (data.type === '__mic_toggle__') {
        if (data.isMicOn) {
          audioElementsRef.current.forEach((audio) => {
            if (audio.paused) {
              audio.play().then(() => setAudioPlaybackBlocked(false)).catch(() => setAudioPlaybackBlocked(true));
            }
          });
          if (meterAudioContextRef.current && meterAudioContextRef.current.state === 'suspended') {
            meterAudioContextRef.current.resume().catch(() => {});
          }
        }
        if (role === 'host' && source) {
          connections.filter((conn) => conn.open && conn !== source).forEach((conn) => {
            try { conn.send(data); } catch {}
          });
        }
        onDataMessageRef.current?.(data);
        return;
      }
      if (
        role === 'host' &&
        source &&
        (data.type === '__piece_placed__' ||
          data.type === '__piece_grab__' ||
          data.type === '__piece_move__' ||
          data.type === '__piece_release__' ||
          data.type === '__piece_wrong__')
      ) {
        connections.filter((connection) => connection.open && connection !== source).forEach((connection) => {
          try { connection.send(data); } catch {}
        });
      }
      onDataMessageRef.current?.({ ...data, fromPeerId: source?.peer });
    };

    const setupDataConnection = (connection: DataConnectionLike) => {
      if (!connections.includes(connection)) connections.push(connection);
      dataConnectionsRef.current = connections;
      connection.on('open', () => {
        if (!alive) return;
        if (role === 'host' && connections.filter((item) => item.open).length > maxPlayers - 1) {
          try { connection.send({ type: '__room_full__' }); connection.close?.(); } catch {}
          return;
        }
        setConnectionStatus('connected');
        setConnectionError(null);
        try {
          connection.send({ type: '__hello__', name: playerNameRef.current, peerId: localPeerIdRef.current });
        } catch {
          statusError('Koneksi room terbuka, tetapi pesan awal gagal dikirim. Coba gabung ulang.');
        }
        if (role === 'guest' && peer && !calls.some((call) => call.peer === hostId)) {
          try {
            const mediaCall = peer.call(hostId, localStreamRef.current || makeSilentStream());
            if (mediaCall) setupCall(mediaCall);
          } catch {
            setConnectionError('Koneksi puzzle aktif, tetapi voice gagal dimulai. Coba nyalakan mikrofon lagi.');
          }
        }
      });
      connection.on('data', (data: any) => deliver(data, connection));
      connection.on('error', (error: any) => {
        const errorText = error?.type === 'peer-unavailable'
          ? 'Room belum tersedia. Pastikan host sudah membuat room dan masih online.'
          : 'Koneksi data room gagal. Coba gabung ulang.';
        statusError(errorText);
      });
      connection.on('close', () => {
        const index = connections.indexOf(connection);
        if (index >= 0) connections.splice(index, 1);
        dataConnectionsRef.current = connections;
        if (!alive) return;
        if (role === 'host') {
          setConnectionStatus('hosting');
          const remainingPlayers = [playerNameRef.current, ...connections.filter((item) => item.open).map((item) => String((item as any).__remoteName || 'Teman'))];
          setPlayerList(remainingPlayers);
          onDataMessageRef.current?.({ type: '__player_leave__', fromPeerId: connection.peer });
        } else {
          setConnectionStatus('error');
          setConnectionError('Koneksi host terputus. Gabung kembali dengan kode room.');
          setPlayerList([playerNameRef.current]);
        }
      });
    };

    const timeout = setTimeout(() => {
      if (alive && role === 'guest' && Date.now() - startedAt >= 12_000 && !connections.some((connection) => connection.open)) {
        statusError('Host tidak ditemukan. Pastikan tautan/kode benar dan host sudah membuka room.');
      }
    }, 12_000);

    (async () => {
      try {
        const { default: Peer } = await import('peerjs');
        if (!alive) return;
      peer = new Peer(role === 'host' ? hostId : guestId, {
          debug: 0,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
          },
        });
        peerRef.current = peer;

        peer.on('open', (peerId: string) => {
          if (!alive) return;
          localPeerIdRef.current = peerId;
          setLocalPeerId(peerId);
          if (role === 'host') {
            setConnectionStatus('hosting');
            setConnectionError(null);
          } else {
            setConnectionStatus('connecting');
            setupDataConnection(peer.connect(hostId, { reliable: true, serialization: 'json' }));
          }
        });
        peer.on('connection', setupDataConnection);
        peer.on('call', (call: MediaCallLike) => {
          try {
            call.answer(localStreamRef.current || makeSilentStream());
            setupCall(call);
          } catch {
            setConnectionError('Voice tidak dapat dijawab. Periksa dukungan WebRTC di browser.');
          }
        });
        peer.on('error', (error: any) => {
          if (!alive) return;
          if (error?.type === 'unavailable-id' && role === 'host') {
            statusError('Kode room sudah dipakai. Buat room baru, lalu bagikan tautannya.');
          } else if (error?.type === 'peer-unavailable' && role === 'guest') {
            statusError('Host belum online atau room tidak ditemukan. Coba lagi setelah host membuka room.');
          } else {
            statusError(`Koneksi room gagal${error?.type ? ` (${error.type})` : ''}. Periksa internet lalu coba lagi.`);
          }
        });
        peer.on('disconnected', () => {
          if (!alive) return;
          setConnectionStatus('connecting');
          try { peer.reconnect(); } catch {}
        });
      } catch {
        statusError('Komponen WebRTC gagal dimuat. Muat ulang halaman dan coba lagi.');
      }
    })();

    pingTimerRef.current = setInterval(() => {
      const connection = connections.find((item) => item.open);
      if (connection) {
        try { connection.send({ type: '__ping__', ts: Date.now() }); } catch {}
      } else {
        setPingMs(null);
      }
    }, 2_000);

    return () => {
      alive = false;
      clearTimeout(timeout);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      transferTimeouts.forEach(clearTimeout);
      transfers.forEach((transfer) => clearTimeout(transfer.timer));
      transfers.clear();
      calls.forEach((call) => { try { call.close?.(); } catch {} });
      connections.forEach((connection) => { try { connection.close?.(); } catch {} });
      if (peer) {
        try { peer.destroy(); } catch {}
      }
      if (peerRef.current === peer) peerRef.current = null;
      dataConnectionsRef.current = [];
      mediaCallsRef.current = [];
      audioElementsRef.current.forEach((audio) => audio.remove());
      audioElementsRef.current = [];
      setConnectionStatus('idle');
      setPingMs(null);
      setRemoteVolume(0);
    };
  }, [isActive, role, roomCode, maxPlayers, makeSilentStream, startMeter]);

  const toggleMic = useCallback(async (): Promise<ToggleMicResult> => {
    const token = safeRoomToken(roomCode);
    const hostId = `lysroom-${token}-host`;

    if (isMicOn) {
      const silentStream = makeSilentStream();
      const silentTrack = silentStream.getAudioTracks()[0];
      mediaCallsRef.current.forEach((call) => {
        try {
          (call as any)._localStream = silentStream;
        } catch {}
        const pc = call.peerConnection;
        if (pc) {
          const sender = getAudioSender(pc);
          if (sender) {
            void sender.replaceTrack(silentTrack || null).catch(() => {});
          }
        }
      });
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setIsMicOn(false);
      sendMessage({ type: '__mic_toggle__', peerId: localPeerIdRef.current, isMicOn: false });
      return { action: 'turned_off' };
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      return { action: 'error', errorName: 'NotSupportedError', errorMessage: 'Browser tidak mendukung mikrofon. Pastikan Anda membuka situs melalui koneksi aman (HTTPS).' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      localStreamRef.current = stream;
      setIsMicOn(true);
      startMeter(stream, true);
      const track = stream.getAudioTracks()[0];

      mediaCallsRef.current.forEach((call) => {
        try {
          (call as any)._localStream = stream;
        } catch {}
        const pc = call.peerConnection;
        if (pc && track) {
          const sender = getAudioSender(pc);
          if (sender) {
            void sender.replaceTrack(track).catch(() => {});
          } else {
            try {
              pc.addTrack(track, stream);
            } catch {}
          }
          const transceiver = pc.getTransceivers().find(
            (t) => t.sender === sender || t.receiver?.track?.kind === 'audio'
          );
          if (transceiver && transceiver.direction !== 'sendrecv') {
            transceiver.direction = 'sendrecv';
          }
        }
      });

      // If guest has no active media call to host yet, initiate call directly with live mic stream
      if (roleRef.current === 'guest' && peerRef.current && !mediaCallsRef.current.some((c) => c.peer === hostId)) {
        try {
          const mediaCall = peerRef.current.call(hostId, stream);
          if (mediaCall && setupCallRef.current) setupCallRef.current(mediaCall);
        } catch (e) {
          console.warn('Failed to call host on toggleMic', e);
        }
      }

      audioElementsRef.current.forEach((audio) => {
        audio.play().then(() => setAudioPlaybackBlocked(false)).catch(() => setAudioPlaybackBlocked(true));
      });

      // Notify peer that mic is active so recipient resumes audio element & AudioContext playback
      sendMessage({ type: '__mic_toggle__', peerId: localPeerIdRef.current, isMicOn: true });

      return { action: 'turned_on' };
    } catch (error: any) {
      const errorName = error?.name || 'UnknownError';
      const message = errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError'
        ? 'Izin mikrofon diblokir. Izinkan mikrofon di pengaturan browser.'
        : errorName === 'NotFoundError'
          ? 'Mikrofon tidak terdeteksi.'
          : errorName === 'NotReadableError'
            ? 'Mikrofon sedang digunakan aplikasi lain.'
            : 'Mikrofon gagal diaktifkan. Periksa izin dan perangkat audio.';
      return { action: 'error', errorName, errorMessage: message };
    }
  }, [isMicOn, makeSilentStream, startMeter, roomCode, sendMessage]);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn((current) => !current);
  }, []);

  useEffect(() => () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    silentStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (silentAudioContextRef.current) void silentAudioContextRef.current.close().catch(() => {});
    if (meterAudioContextRef.current) void meterAudioContextRef.current.close().catch(() => {});
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    audioElementsRef.current.forEach((audio) => audio.remove());
  }, []);

  return {
    connectionStatus,
    connectionError,
    isConnected: connectionStatus === 'connected',
    isHosting: role === 'host' && connectionStatus === 'hosting',
    isMicOn,
    toggleMic,
    isSpeakerOn,
    toggleSpeaker,
    pingMs,
    pingQuality: pingMs === null ? 'offline' as const : pingMs < 80 ? 'good' as const : pingMs < 160 ? 'medium' as const : 'bad' as const,
    connectedPlayers: playerList.length,
    localVolume,
    voiceBands,
    isSpeaking,
    remoteVolume,
    isRemoteSpeaking: remoteVolume > 15,
    remoteSpeakerName: remoteVolume > 15 ? playerList.find((name) => name !== playerName) || 'Teman' : null,
    playerList,
    sendMessage,
    audioPlaybackBlocked,
    localPeerId,
  };
}
