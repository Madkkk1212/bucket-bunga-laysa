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


async function getRobustAudioStream(): Promise<MediaStream> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('NOT_SUPPORTED');
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  }
}

async function getNativeRttMs(pc?: RTCPeerConnection): Promise<number | null> {
  if (!pc || typeof pc.getStats !== 'function') return null;
  try {
    const stats = await pc.getStats();
    let selectedRtt: number | null = null;
    stats.forEach((report) => {
      if (
        report.type === 'candidate-pair' &&
        report.state === 'succeeded' &&
        typeof report.currentRoundTripTime === 'number' &&
        report.currentRoundTripTime > 0
      ) {
        selectedRtt = Math.round(report.currentRoundTripTime * 1000);
      }
    });
    return selectedRtt;
  } catch {
    return null;
  }
}

function applyAudioBitrateOptimization(pc: RTCPeerConnection) {
  try {
    const sender = getAudioSender(pc);
    if (!sender) return;
    const params = sender.getParameters();
    if (!params.encodings || params.encodings.length === 0) {
      params.encodings = [{}];
    }
    // Set maxBitrate 24kbps: jernih untuk suara manusia, hemat data 75% sehingga game tidak ngelag
    params.encodings[0].maxBitrate = 24_000;
    (params.encodings[0] as any).priority = 'high';
    (params.encodings[0] as any).networkPriority = 'high';
    sender.setParameters(params).catch(() => {});
  } catch {}
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
    const timer = setTimeout(() => {
      const conns = dataConnectionsRef.current.filter((c) => c.open);
      if (conns.length > 0 && localPeerIdRef.current) {
        conns.forEach((c) => {
          try {
            c.send({
              type: '__player_name_update__',
              peerId: localPeerIdRef.current,
              name: playerName,
            });
          } catch {}
        });
        if (roleRef.current === 'host') {
          const currentPlayers = [
            { id: localPeerIdRef.current, name: playerName },
            ...conns.map((c) => ({
              id: String((c as any).__remotePeerId || c.peer || ''),
              name: String((c as any).__remoteName || 'Teman'),
            })),
          ].filter((item, index, list) => item.id && list.findIndex((p) => p.id === item.id) === index);
          conns.forEach((c) => {
            try { c.send({ type: '__peer_list__', players: currentPlayers, maxPlayers }); } catch {}
          });
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [playerName, maxPlayers]);
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
        (c) => !(c.dataChannel && c.dataChannel.bufferedAmount > 16 * 1024),
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
        let chunkIndex = 0;
        // Paced chunk sending: beri jeda 12ms agar buffer WebRTC tidak meledak & audio voice tetap jernih
        const sendNextChunk = () => {
          if (chunkIndex >= chunks || !connection.open) return;
          for (let b = 0; b < 2 && chunkIndex < chunks; b += 1) {
            connection.send({
              type: '__asset_chunk__',
              transferId,
              index: chunkIndex,
              total: chunks,
              chunk: image.slice(chunkIndex * ASSET_CHUNK_SIZE, (chunkIndex + 1) * ASSET_CHUNK_SIZE),
            });
            chunkIndex += 1;
          }
          if (chunkIndex < chunks) {
            setTimeout(sendNextChunk, 12);
          }
        };
        setTimeout(sendNextChunk, 10);
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
    const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
    let guestReconnectTimer: ReturnType<typeof setTimeout> | null = null;

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
      if (call.peerConnection) {
        applyAudioBitrateOptimization(call.peerConnection);
        call.peerConnection.oniceconnectionstatechange = () => {
          if (call.peerConnection?.iceConnectionState === 'failed') {
            try { (call.peerConnection as any).restartIce?.(); } catch {}
          }
        };
      }
      call.on('stream', (stream: MediaStream) => {
        if (!alive) return;
        let audio = (call as any).__audio as HTMLAudioElement | undefined;
        if (!audio) {
          audio = document.createElement('audio');
          audio.autoplay = true;
          audio.setAttribute('playsinline', 'true');
          audio.setAttribute('aria-hidden', 'true');
          audio.style.position = 'fixed';
          audio.style.top = '-9999px';
          audio.style.left = '-9999px';
          audio.style.width = '1px';
          audio.style.height = '1px';
          audio.style.opacity = '0.01';
          audio.style.pointerEvents = 'none';
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
        if (typeof data.ts === 'number') {
          const rawRtt = Math.max(1, Date.now() - data.ts);
          setPingMs((prev) => {
            if (prev === null) return rawRtt;
            if (rawRtt > prev * 2.8 && prev < 200) return prev;
            return Math.round(prev * 0.5 + rawRtt * 0.5);
          });
        }
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
      if (data.type === '__player_leave__') {
        const leavePeerId = String(data.fromPeerId || source?.peer || '');
        if (leavePeerId) {
          const oldTimer = disconnectTimers.get(leavePeerId);
          if (oldTimer) {
            clearTimeout(oldTimer);
            disconnectTimers.delete(leavePeerId);
          }
        }
        if (role === 'host') {
          const connIdx = connections.findIndex((c) => c.peer === leavePeerId || (c as any).__remotePeerId === leavePeerId);
          if (connIdx >= 0) {
            try { connections[connIdx].close?.(); } catch {}
            connections.splice(connIdx, 1);
            dataConnectionsRef.current = connections;
          }
          const remainingPlayers = [
            playerNameRef.current,
            ...connections.filter((item) => item.open && item.peer !== leavePeerId).map((item) => String((item as any).__remoteName || 'Teman')),
          ];
          setPlayerList(remainingPlayers);
          connections.filter((item) => item.open && item.peer !== leavePeerId).forEach((conn) => {
            try { conn.send({ type: '__player_leave__', fromPeerId: leavePeerId }); } catch {}
          });
        } else if (role === 'guest') {
          if (data.isHost || leavePeerId === hostId) {
            setConnectionStatus('error');
            setConnectionError('Host telah keluar atau menutup room.');
          }
        }
        onDataMessageRef.current?.({ ...data, fromPeerId: leavePeerId });
        return;
      }
      if (data.type === '__player_name_update__') {
        const remoteName = String(data.name || 'Teman').slice(0, 24);
        const remotePeerId = String(data.peerId || source?.peer || '');
        const sourceConnection = source || connections.find((item) => (item as any).__remotePeerId === remotePeerId || item.peer === remotePeerId);
        if (sourceConnection) {
          (sourceConnection as any).__remoteName = remoteName;
          if (remotePeerId) (sourceConnection as any).__remotePeerId = remotePeerId;
        }
        if (role === 'host') {
          const currentPlayers = [
            { id: localPeerIdRef.current || hostId, name: playerNameRef.current },
            ...connections.filter((item) => item.open).map((item) => ({
              id: String((item as any).__remotePeerId || item.peer || ''),
              name: String((item as any).__remoteName || 'Teman'),
            })),
          ].filter((item, index, list) => item.id && list.findIndex((peerItem) => peerItem.id === item.id) === index);
          setPlayerList(currentPlayers.map((item) => item.name));
          connections.filter((item) => item.open && item !== source).forEach((connection) => {
            try { connection.send(data); } catch {}
          });
          connections.filter((item) => item.open).forEach((connection) => {
            try { connection.send({ type: '__peer_list__', players: currentPlayers, maxPlayers }); } catch {}
          });
        } else {
          setPlayerList((prev) => {
            if (prev.length <= 1) return [playerNameRef.current, remoteName];
            return [playerNameRef.current, remoteName, ...prev.slice(2)];
          });
        }
        onDataMessageRef.current?.({ ...data, fromPeerId: source?.peer || remotePeerId });
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
          // Grace period: Beri waktu 12 detik jika teman hanya beralih aplikasi sebentar (balas chat WA)
          const peerId = String(connection.peer || (connection as any).__remotePeerId || '');
          if (peerId) {
            setConnectionError('Teman terputus sebentar (menunggu s/d 12 detik)…');
            const oldTimer = disconnectTimers.get(peerId);
            if (oldTimer) clearTimeout(oldTimer);
            const timer = setTimeout(() => {
              if (!alive) return;
              const remainingPlayers = [playerNameRef.current, ...connections.filter((item) => item.open).map((item) => String((item as any).__remoteName || 'Teman'))];
              setPlayerList(remainingPlayers);
              setConnectionError(null);
              onDataMessageRef.current?.({ type: '__player_leave__', fromPeerId: peerId });
              disconnectTimers.delete(peerId);
            }, 12_000);
            disconnectTimers.set(peerId, timer);
          }
        } else {
          // Guest: Jika host terputus, coba reconnect maksimal 12 detik sebelum otomatis keluar dari room
          setConnectionStatus('connecting');
          setConnectionError('Koneksi ke host terputus sebentar. Menyambungkan kembali (12s)…');
          if (guestReconnectTimer) clearTimeout(guestReconnectTimer);
          const reconnectDeadline = Date.now() + 12_000;
          const attemptReconnect = () => {
            if (!alive || roleRef.current !== 'guest') return;
            if (connections.some((c) => c.open)) return;
            if (Date.now() >= reconnectDeadline) {
              setConnectionStatus('error');
              setConnectionError('Host telah keluar atau room ditutup. Silakan buat atau gabung room baru.');
              onDataMessageRef.current?.({ type: '__player_leave__', isHost: true, fromPeerId: hostId });
              return;
            }
            reconnectGuest();
            guestReconnectTimer = setTimeout(attemptReconnect, 2000);
          };
          guestReconnectTimer = setTimeout(attemptReconnect, 1500);
        }
      });
    };

    const reconnectGuest = () => {
      if (!alive || role !== 'guest' || !peer || peer.destroyed) return;
      if (connections.some((c) => c.open)) return;
      setConnectionStatus('connecting');
      setConnectionError('Menyambungkan kembali ke host…');
      if (peer.disconnected) {
        try { peer.reconnect(); } catch {}
      }
      try {
        const newConn = peer.connect(hostId, { reliable: true, serialization: 'json' });
        setupDataConnection(newConn);
      } catch {}
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (peer && peer.disconnected && !peer.destroyed) {
          try { peer.reconnect(); } catch {}
        }
        if (role === 'guest' && alive) {
          const hasOpen = connections.some((c) => c.open);
          if (!hasOpen) {
            reconnectGuest();
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pageshow', handleVisibility);

    const handleUnload = () => {
      try {
        const leaveMsg = {
          type: '__player_leave__',
          intentional: true,
          isHost: role === 'host',
          fromPeerId: localPeerIdRef.current,
        };
        connections.filter((c) => c.open).forEach((conn) => {
          try { conn.send(leaveMsg); } catch {}
        });
      } catch {}
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

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
              // 1. Direct Low-Latency STUN (Prioritas 1: Direct P2P 15ms - 35ms ultra low ping)
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun.relay.metered.ca:80' },
              { urls: 'stun:stun.relay.metered.ca:443' },
              { urls: 'stun:stun.cloudflare.com:3478' },

              // 2. High-speed Singapore TURN Relay UDP (45ms - 75ms jika butuh relay CGNAT)
              {
                urls: 'turn:sg.relay.metered.ca:443',
                username: '41a1c8a977fea4ccb5f38235',
                credential: '+v+MPqS3XPKujs6B',
              },
              {
                urls: 'turn:sg.relay.metered.ca:80',
                username: '41a1c8a977fea4ccb5f38235',
                credential: '+v+MPqS3XPKujs6B',
              },

              // 3. Fallback TURN Relay TCP (hanya sebagai cadangan darurat jika UDP diblokir)
              {
                urls: 'turn:sg.relay.metered.ca:80?transport=tcp',
                username: '41a1c8a977fea4ccb5f38235',
                credential: '+v+MPqS3XPKujs6B',
              },
              {
                urls: 'turns:sg.relay.metered.ca:443?transport=tcp',
                username: '41a1c8a977fea4ccb5f38235',
                credential: '+v+MPqS3XPKujs6B',
              },
            ],
            iceCandidatePoolSize: 10,
            iceTransportPolicy: 'all',
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
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

    pingTimerRef.current = setInterval(async () => {
      const openConns = connections.filter((item) => item.open);
      if (openConns.length > 0) {
        // Cek hardware/native RTT langsung dari engine WebRTC browser (bebas dari lag rendering JavaScript)
        const activePc = mediaCallsRef.current[0]?.peerConnection || (openConns[0] as any)?.peerConnection;
        if (activePc) {
          const nativeRtt = await getNativeRttMs(activePc);
          if (typeof nativeRtt === 'number' && nativeRtt > 0) {
            setPingMs((prev) => (prev === null ? nativeRtt : Math.round(prev * 0.4 + nativeRtt * 0.6)));
          }
        }

        // Tetap kirim ping-pong SCTP untuk menjaga NAT pinhole terbuka dua arah
        openConns.forEach((conn) => {
          try { conn.send({ type: '__ping__', ts: Date.now() }); } catch {}
        });
      } else {
        setPingMs(null);
      }
    }, 1_000);

    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pageshow', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      clearTimeout(timeout);
      if (guestReconnectTimer) clearTimeout(guestReconnectTimer);
      disconnectTimers.forEach((timer) => clearTimeout(timer));
      disconnectTimers.clear();
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

    // ── Matikan Mic (Mute) ──
    if (isMicOnRef.current) {
      // PENTING UNTUK BEDA JARINGAN: Jangan destroy track atau kirim silent oscillator!
      // Cukup set track.enabled = false agar WebRTC tetap kirim keepalive packet (~1kbps),
      // sehingga port NAT mapping di Telkomsel/XL/Indosat TIDAK KADALUARSA / DROP!
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }
      setIsMicOn(false);
      isMicOnRef.current = false;
      setVoiceBands([0, 0, 0, 0]);
      setLocalVolume(0);
      setIsSpeaking(false);
      sendMessage({ type: '__mic_toggle__', peerId: localPeerIdRef.current, isMicOn: false });
      return { action: 'turned_off' };
    }

    // ── Nyalakan Mic (Unmute) ──
    try {
      let stream = localStreamRef.current;
      const liveTrack = stream?.getAudioTracks().find((t) => t.readyState === 'live');

      if (liveTrack && stream) {
        // Track sudah ada, nyalakan kembali seketika (0ms delay, zero packet loss)
        liveTrack.enabled = true;
        setIsMicOn(true);
        isMicOnRef.current = true;
        startMeter(stream, true);
        sendMessage({ type: '__mic_toggle__', peerId: localPeerIdRef.current, isMicOn: true });
        return { action: 'turned_on' };
      }

      // Track belum pernah diizinkan, minta akses mic pertama kali
      stream = await getRobustAudioStream();
      localStreamRef.current = stream;
      const newTrack = stream.getAudioTracks()[0];
      if (newTrack) newTrack.enabled = true;
      setIsMicOn(true);
      isMicOnRef.current = true;
      startMeter(stream, true);

      // Pasang track ke semua call aktif
      mediaCallsRef.current.forEach((call) => {
        const pc = call.peerConnection;
        if (pc && newTrack) {
          const sender = getAudioSender(pc);
          if (sender) {
            void sender.replaceTrack(newTrack).catch(() => {});
            applyAudioBitrateOptimization(pc);
          } else {
            try { pc.addTrack(newTrack, stream!); } catch {}
          }
        }
      });

      // Jika guest belum punya media call ke host, mulai call langsung dengan mic aktif
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

      sendMessage({ type: '__mic_toggle__', peerId: localPeerIdRef.current, isMicOn: true });
      return { action: 'turned_on' };
    } catch (error: any) {
      const errorName = error?.name || 'UnknownError';
      const message = errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError'
        ? 'Izin mikrofon diblokir. Izinkan mikrofon di pengaturan browser.'
        : errorName === 'NotFoundError'
          ? 'Mikrofon tidak terdeteksi pada perangkat ini.'
          : errorName === 'NotReadableError'
            ? 'Mikrofon sedang digunakan aplikasi lain.'
            : 'Mikrofon gagal diaktifkan. Pastikan izin browser diberikan.';
      return { action: 'error', errorName, errorMessage: message };
    }
  }, [roomCode, sendMessage, startMeter]);

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
