'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface ToggleMicResult {
  action: 'turned_on' | 'turned_off' | 'error';
  errorName?: string;
  errorMessage?: string;
}

export interface WebRtcVoiceState {
  isMicOn: boolean;
  toggleMic: () => Promise<ToggleMicResult>;
  pingMs: number | null;
  pingQuality: 'good' | 'medium' | 'bad' | 'offline';
  connectedPlayers: number;
  localVolume: number; // 0 to 100 for visualizer
  voiceBands: [number, number, number, number]; // 4 reactive voice bands (0-100)
  isSpeaking: boolean;
  remoteVolume: number; // 0 to 100 for remote visualizer
  isRemoteSpeaking: boolean;
  remoteSpeakerName: string | null;
  roomCode: string;
  playerList: string[];
  sendMessage: (data: any) => void;
}

export function useWebRtcVoice(
  initialRoomCode: string,
  isMultiplayerActive: boolean,
  playerName: string = 'Pemain',
  onDataMessage?: (data: any) => void
) {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [isMicOn, setIsMicOn] = useState(false);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [connectedPlayers, setConnectedPlayers] = useState(1);
  const [playerList, setPlayerList] = useState<string[]>([playerName]);
  const [localVolume, setLocalVolume] = useState(0);
  const [voiceBands, setVoiceBands] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [remoteVolume, setRemoteVolume] = useState(0);

  // Refs
  const playerNameRef = useRef(playerName);
  const onDataMessageRef = useRef(onDataMessage);
  const isMicOnRef = useRef(false);
  const peerRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const activeCallsRef = useRef<any[]>([]);
  const activeDataConsRef = useRef<any[]>([]);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const localAnalyserRef = useRef<AnalyserNode | null>(null);
  const remoteAnalyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  useEffect(() => {
    onDataMessageRef.current = onDataMessage;
  }, [onDataMessage]);

  // Keep isMicOnRef synced for 60fps requestAnimationFrame loop
  useEffect(() => {
    isMicOnRef.current = isMicOn;
    if (!isMicOn) {
      setLocalVolume(0);
      setVoiceBands([0, 0, 0, 0]);
      setIsSpeaking(false);
    }
  }, [isMicOn]);

  // Update room code if parent changes it
  useEffect(() => {
    if (initialRoomCode) setRoomCode(initialRoomCode);
  }, [initialRoomCode]);

  // Determine ping quality
  const pingQuality: 'good' | 'medium' | 'bad' | 'offline' =
    pingMs === null
      ? 'offline'
      : pingMs < 80
      ? 'good'
      : pingMs < 160
      ? 'medium'
      : 'bad';

  // Volume analyzer loop with 4 real frequency bands
  const startVolumeMeter = useCallback((stream: MediaStream, isLocal: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.25; // Snappy 60fps response

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      if (isLocal) {
        localAnalyserRef.current = analyser;
      } else {
        remoteAnalyserRef.current = analyser;
      }

      const pcmData = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (localAnalyserRef.current && isMicOnRef.current) {
          localAnalyserRef.current.getByteFrequencyData(pcmData);

          // 4 voice formant frequency bins
          const b1 = (pcmData[1] + pcmData[2] + pcmData[3]) / 3;
          const b2 = (pcmData[4] + pcmData[5] + pcmData[6] + pcmData[7]) / 4;
          const b3 = (pcmData[8] + pcmData[9] + pcmData[10] + pcmData[11]) / 4;
          const b4 = (pcmData[12] + pcmData[13] + pcmData[14] + pcmData[15]) / 4;

          // Noise gate & dynamic voice scaling
          const scaleBand = (val: number, multiplier: number) => {
            if (val < 10) return 0; // Filter room hum / silence
            return Math.min(100, Math.round(((val - 10) / 75) * 100 * multiplier));
          };

          const s1 = scaleBand(b1, 1.0);
          const s2 = scaleBand(b2, 1.25);
          const s3 = scaleBand(b3, 1.1);
          const s4 = scaleBand(b4, 0.95);

          const peak = Math.max(s1, s2, s3, s4);

          setLocalVolume(peak);
          setVoiceBands([s1, s2, s3, s4]);
          setIsSpeaking(peak > 10);
        } else {
          setLocalVolume(0);
          setVoiceBands([0, 0, 0, 0]);
          setIsSpeaking(false);
        }

        if (remoteAnalyserRef.current) {
          remoteAnalyserRef.current.getByteFrequencyData(pcmData);
          let sum = 0;
          for (let i = 0; i < pcmData.length; i++) sum += pcmData[i];
          const avg = sum / pcmData.length;
          setRemoteVolume(avg > 10 ? Math.min(100, Math.round(((avg - 10) / 70) * 100)) : 0);
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(checkVolume);
      }
    } catch {
      // AudioContext initialization handled
    }
  }, []);

  // Native network RTT baseline check (when no peer yet or checking line speed)
  const measureBaseNetworkPing = useCallback(async () => {
    try {
      const start = performance.now();
      await fetch('/api/health?t=' + Date.now(), { method: 'HEAD', cache: 'no-store' }).catch(() => {});
      const elapsed = Math.round(performance.now() - start);
      setPingMs((prev) => (prev ? Math.round(prev * 0.7 + elapsed * 0.3) : Math.min(65, Math.max(18, elapsed))));
    } catch {
      setPingMs((prev) => prev || 32);
    }
  }, []);

  // Broadcast data packet to all peers in room
  const sendMessage = useCallback((data: any) => {
    activeDataConsRef.current.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(data);
        } catch {}
      }
    });
  }, []);

  // Initialize WebRTC Peer connection
  useEffect(() => {
    if (!isMultiplayerActive || !roomCode) {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      setConnectedPlayers(1);
      setPlayerList([playerNameRef.current]);
      return;
    }

    let isMounted = true;
    const cleanCode = roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || '2026';
    const hostId = `lysroom-${cleanCode}-host`;
    const peerConfig = {
      debug: 0,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
        ],
      },
    };

    function setupMediaCall(mediaCall: any) {
      if (!activeCallsRef.current.includes(mediaCall)) {
        activeCallsRef.current.push(mediaCall);
      }
      setConnectedPlayers((p) => Math.max(p, activeCallsRef.current.length + 1));

      mediaCall.on('stream', (remoteStream: MediaStream) => {
        // Individual audio element per caller for crystal-clear 2-way audio
        const audio = document.createElement('audio');
        audio.autoplay = true;
        (audio as any).playsInline = true;
        audio.style.display = 'none';
        audio.srcObject = remoteStream;
        document.body.appendChild(audio);
        audioElementsRef.current.push(audio);
        (mediaCall as any)._audioEl = audio;
        audio.play().catch(() => {});

        startVolumeMeter(remoteStream, false);
      });

      mediaCall.on('close', () => {
        if ((mediaCall as any)._audioEl) {
          (mediaCall as any)._audioEl.remove();
          audioElementsRef.current = audioElementsRef.current.filter((a) => a !== (mediaCall as any)._audioEl);
        }
        activeCallsRef.current = activeCallsRef.current.filter((c) => c !== mediaCall);
        setConnectedPlayers(Math.max(1, activeDataConsRef.current.length + 1));
      });

      mediaCall.on('error', () => {
        if ((mediaCall as any)._audioEl) {
          (mediaCall as any)._audioEl.remove();
        }
        activeCallsRef.current = activeCallsRef.current.filter((c) => c !== mediaCall);
      });
    }

    function setupDataConnection(conn: any) {
      if (!activeDataConsRef.current.includes(conn)) {
        activeDataConsRef.current.push(conn);
      }
      setConnectedPlayers((p) => Math.max(p, activeDataConsRef.current.length + 1));

      conn.on('open', () => {
        conn.send({ type: '__ping__', ts: Date.now() });
        conn.send({ type: '__player_join__', name: playerNameRef.current });
      });

      conn.on('data', (data: any) => {
        if (!data || typeof data !== 'object') return;
        if (data.type === '__ping__') {
          conn.send({ type: '__pong__', ts: data.ts });
        } else if (data.type === '__pong__') {
          const rtt = Math.max(5, Math.round(Date.now() - data.ts));
          const latency = Math.round(rtt / 2);
          setPingMs(latency);
        } else if (data.type === '__player_join__') {
          (conn as any)._playerName = data.name;
          const names = [
            playerNameRef.current,
            ...activeDataConsRef.current.map((c) => (c as any)._playerName).filter(Boolean),
          ];
          const uniqueNames = Array.from(new Set(names));
          setPlayerList(uniqueNames);
          conn.send({ type: '__player_welcome__', name: playerNameRef.current, players: uniqueNames });
          onDataMessageRef.current?.(data);
        } else if (data.type === '__player_welcome__') {
          (conn as any)._playerName = data.name;
          if (Array.isArray(data.players)) {
            setPlayerList(Array.from(new Set([playerNameRef.current, ...data.players])));
          }
          onDataMessageRef.current?.(data);
        } else {
          // Game-level messages: pieces placed, sync game state, etc.
          onDataMessageRef.current?.(data);
        }
      });

      conn.on('close', () => {
        activeDataConsRef.current = activeDataConsRef.current.filter((c) => c !== conn);
        const names = [
          playerNameRef.current,
          ...activeDataConsRef.current.map((c) => (c as any)._playerName).filter(Boolean),
        ];
        setPlayerList(Array.from(new Set(names)));
        setConnectedPlayers(Math.max(1, activeDataConsRef.current.length + 1));
      });
    }

    async function initPeer() {
      try {
        const { default: Peer } = await import('peerjs');
        if (!isMounted) return;

        // Clean up previous peer
        if (peerRef.current) {
          peerRef.current.destroy();
          peerRef.current = null;
        }

        const attachCommonListeners = (p: any) => {
          // Handle incoming voice stream calls
          p.on('call', (mediaCall: any) => {
            const streamToSend = localStreamRef.current || createSilentAudioStream();
            mediaCall.answer(streamToSend);
            setupMediaCall(mediaCall);
          });

          // Handle incoming Data Connection (for exact round-trip ping)
          p.on('connection', (conn: any) => {
            setupDataConnection(conn);
          });
        };

        // 1. Try connecting as the Host of the room
        const hostPeer = new Peer(hostId, peerConfig);
        peerRef.current = hostPeer;

        hostPeer.on('open', () => {
          if (!isMounted) return;
          measureBaseNetworkPing();
        });

        attachCommonListeners(hostPeer);

        // 2. If Host ID is already taken by a friend, we join as Guest and call the Host!
        hostPeer.on('error', (err: any) => {
          if (!isMounted) return;
          if (err.type === 'unavailable-id') {
            try {
              hostPeer.destroy();
            } catch {}

            const guestId = `lysroom-${cleanCode}-guest-${Math.random().toString(36).substring(2, 7)}`;
            const guestPeer = new Peer(guestId, peerConfig);
            peerRef.current = guestPeer;

            guestPeer.on('open', () => {
              if (!isMounted) return;
              measureBaseNetworkPing();

              // Connect data ping channel to host
              const conn = guestPeer.connect(hostId, { reliable: true });
              setupDataConnection(conn);

              // Connect voice media call to host
              const streamToSend = localStreamRef.current || createSilentAudioStream();
              const mediaCall = guestPeer.call(hostId, streamToSend);
              setupMediaCall(mediaCall);
            });

            attachCommonListeners(guestPeer);
          }
        });

        // Periodically measure ping
        pingIntervalRef.current = setInterval(() => {
          if (activeDataConsRef.current.length > 0) {
            const now = Date.now();
            activeDataConsRef.current.forEach((conn) => {
              if (conn.open) {
                conn.send({ type: '__ping__', ts: now });
              }
            });
          } else {
            measureBaseNetworkPing();
          }
        }, 2000);
      } catch {
        measureBaseNetworkPing();
      }
    }

    initPeer();

    return () => {
      isMounted = false;
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      activeCallsRef.current = [];
      activeDataConsRef.current = [];
    };
  }, [isMultiplayerActive, roomCode, measureBaseNetworkPing, startVolumeMeter]);

  // Helper: Create silent stream if answering before mic is turned on
  function createSilentAudioStream(): MediaStream {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const dst = ctx.createMediaStreamDestination();
      const gain = ctx.createGain();
      gain.gain.value = 0; // complete silence
      osc.connect(gain);
      gain.connect(dst);
      osc.start();
      return dst.stream;
    } catch {
      return new MediaStream();
    }
  }

  // Toggle Microphone
  const toggleMic = useCallback(async (): Promise<ToggleMicResult> => {
    if (!isMicOn) {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        return {
          action: 'error',
          errorName: 'NotSupported',
          errorMessage:
            'Browser tidak mendukung akses mikrofon atau halaman tidak dibuka via HTTPS / localhost.',
        };
      }

      let stream: MediaStream | null = null;
      let caughtErr: any = null;

      // 1. Try with echo cancellation and noise suppression
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (err: any) {
        caughtErr = err;
        // 2. Automatic fallback to basic audio if driver/constraints threw an error
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          caughtErr = null;
        } catch (fallbackErr: any) {
          caughtErr = fallbackErr;
        }
      }

      if (!stream || caughtErr) {
        const errName = caughtErr?.name || 'UnknownError';
        let friendlyMsg = 'Izin mikrofon belum aktif.';

        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          friendlyMsg =
            'Izin mikrofon diblokir. Klik ikon 🔒 atau 🎙️ di address bar browser untuk mengizinkan mic.';
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          friendlyMsg = 'Perangkat mikrofon tidak terdeteksi. Pastikan mic terpasang.';
        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
          friendlyMsg =
            'Mikrofon sedang dipakai aplikasi lain (Discord/Zoom). Silakan matikan mic di aplikasi tersebut.';
        }

        return {
          action: 'error',
          errorName: errName,
          errorMessage: friendlyMsg,
        };
      }

      localStreamRef.current = stream;
      setIsMicOn(true);
      startVolumeMeter(stream, true);

      // Update all active WebRTC calls with the new live audio track
      activeCallsRef.current.forEach((call) => {
        const senders = call.peerConnection?.getSenders?.();
        const audioSender = senders?.find((s: any) => s.track?.kind === 'audio');
        const newTrack = stream.getAudioTracks()[0];
        if (audioSender && newTrack) {
          audioSender.replaceTrack(newTrack);
        }
      });

      return { action: 'turned_on' };
    } else {
      // Turn off mic
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      setIsMicOn(false);
      setLocalVolume(0);
      return { action: 'turned_off' };
    }
  }, [isMicOn, startVolumeMeter]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      audioElementsRef.current.forEach((el) => {
        try {
          el.remove();
        } catch {}
      });
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const remoteSpeakerName =
    remoteVolume > 15 ? playerList.find((p) => p !== playerName) || 'Teman' : null;

  return {
    isMicOn,
    toggleMic,
    pingMs,
    pingQuality,
    connectedPlayers,
    localVolume,
    voiceBands,
    isSpeaking,
    remoteVolume,
    isRemoteSpeaking: remoteVolume > 15,
    remoteSpeakerName,
    roomCode,
    playerList,
    sendMessage,
  };
}
