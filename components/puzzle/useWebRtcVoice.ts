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

export function useWebRtcVoice(
  roomCode: string,
  isActive: boolean,
  role: PuzzleRoomRole,
  playerName: string,
  onDataMessage?: (data: any) => void,
) {
  const [connectionStatus, setConnectionStatus] = useState<PuzzleRoomStatus>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [playerList, setPlayerList] = useState<string[]>([playerName]);
  const [localVolume, setLocalVolume] = useState(0);
  const [voiceBands, setVoiceBands] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [remoteVolume, setRemoteVolume] = useState(0);
  const [audioPlaybackBlocked, setAudioPlaybackBlocked] = useState(false);

  const peerRef = useRef<any>(null);
  const roleRef = useRef(role);
  const playerNameRef = useRef(playerName);
  const onDataMessageRef = useRef(onDataMessage);
  const dataConnectionsRef = useRef<DataConnectionLike[]>([]);
  const mediaCallsRef = useRef<MediaCallLike[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const silentStreamRef = useRef<MediaStream | null>(null);
  const silentAudioContextRef = useRef<AudioContext | null>(null);
  const meterAudioContextRef = useRef<AudioContext | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const transferMapRef = useRef(new Map<string, AssetTransfer>());
  const isMicOnRef = useRef(false);
  const analyserRefs = useRef<{ local: AnalyserNode | null; remote: AnalyserNode | null }>({ local: null, remote: null });
  const rafRef = useRef<number | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      context.createMediaStreamSource(stream).connect(analyser);
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

  const sendMessage = useCallback((data: Record<string, any>) => {
    const connections = dataConnectionsRef.current.filter((connection) => connection.open);
    if (!connections.length) return false;

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
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('aria-hidden', 'true');
        audio.style.display = 'none';
        audio.srcObject = stream;
        document.body.appendChild(audio);
        audioElementsRef.current.push(audio);
        audio.play().then(() => setAudioPlaybackBlocked(false)).catch(() => setAudioPlaybackBlocked(true));
        attachMeter(stream, false);
        (call as any).__audio = audio;
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

    const deliver = (data: any) => {
      if (!data || typeof data !== 'object') return;
      if (data.type === '__ping__') {
        const connection = connections.find((item) => item.open);
        try { connection?.send({ type: '__pong__', ts: data.ts }); } catch {}
        return;
      }
      if (data.type === '__pong__') {
        if (typeof data.ts === 'number') setPingMs(Math.max(1, Date.now() - data.ts));
        return;
      }
      if (data.type === '__hello__') {
        const remoteName = String(data.name || 'Teman').slice(0, 24);
        setPlayerList([playerNameRef.current, remoteName]);
        const connection = connections.find((item) => item.peer === data.peerId) || connections[0];
        try { connection?.send({ type: '__welcome__', name: playerNameRef.current }); } catch {}
        onDataMessageRef.current?.({ ...data, type: '__player_join__', name: remoteName });
        return;
      }
      if (data.type === '__welcome__') {
        const remoteName = String(data.name || 'Host').slice(0, 24);
        setPlayerList([playerNameRef.current, remoteName]);
        onDataMessageRef.current?.({ ...data, type: '__player_welcome__', name: remoteName, players: [remoteName] });
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
            onDataMessageRef.current?.({ ...transfer.message, customImageSrc: image });
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
      onDataMessageRef.current?.(data);
    };

    const setupDataConnection = (connection: DataConnectionLike) => {
      if (!connections.includes(connection)) connections.push(connection);
      dataConnectionsRef.current = connections;
      connection.on('open', () => {
        if (!alive) return;
        if (role === 'host' && connections.filter((item) => item.open).length > 1) {
          try { connection.send({ type: '__room_full__' }); connection.close?.(); } catch {}
          return;
        }
        setConnectionStatus('connected');
        setConnectionError(null);
        try {
          connection.send({ type: '__hello__', name: playerNameRef.current, peerId: connection.peer });
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
      connection.on('data', deliver);
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
          setPlayerList([playerNameRef.current]);
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

        peer.on('open', () => {
          if (!alive) return;
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
  }, [isActive, role, roomCode, makeSilentStream, startMeter]);

  const toggleMic = useCallback(async (): Promise<ToggleMicResult> => {
    if (isMicOn) {
      const silentTrack = makeSilentStream().getAudioTracks()[0];
      mediaCallsRef.current.forEach((call) => {
        const sender = call.peerConnection?.getSenders().find((item) => item.track?.kind === 'audio');
        if (sender) void sender.replaceTrack(silentTrack || null).catch(() => {});
      });
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setIsMicOn(false);
      return { action: 'turned_off' };
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      return { action: 'error', errorName: 'NotSupportedError', errorMessage: 'Browser tidak mendukung mikrofon. Buka situs melalui HTTPS atau localhost.' };
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
        const sender = call.peerConnection?.getSenders().find((item) => item.track?.kind === 'audio');
        if (sender && track) void sender.replaceTrack(track).catch(() => {});
      });
      audioElementsRef.current.forEach((audio) => {
        audio.play().then(() => setAudioPlaybackBlocked(false)).catch(() => setAudioPlaybackBlocked(true));
      });
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
  }, [isMicOn, makeSilentStream, startMeter]);

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
  };
}
