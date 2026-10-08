'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown, ArrowLeft, Users, Mic, MicOff, Volume2,
  RefreshCw, Eye, Sparkles, Trophy, Download, Play, Copy, Check,
  Maximize, Minimize
} from 'lucide-react';
import PremiumUnlockModal from '../designer/PremiumUnlockModal';
import { useWebRtcVoice } from './useWebRtcVoice';
import PhotoAdjustModal from './PhotoAdjustModal';

// ═══════════════════════════════════════════════════
// CONFIG & TYPES
// ═══════════════════════════════════════════════════

interface PuzzleGameProps {
  isPremium?: boolean;
  backHref?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface PieceEdges {
  H: number[][];
  V: number[][];
}

interface DragState {
  el: HTMLCanvasElement;
  ox: number;
  oy: number;
  sx: number;
  sy: number;
}

interface ReplayLog {
  t: number;
  id: number;
  x: number;
  y: number;
  ok: boolean;
}

interface RecData {
  log: ReplayLog[];
  init: { x: number; y: number }[];
  pcs: HTMLCanvasElement[];
  guide: HTMLCanvasElement;
  pw: number;
  sw: number;
  sh: number;
  bx: number;
  by: number;
  Bc: number;
  T: { x: number; y: number; w: number; h: number };
  D: number;
}

const UKURAN: [number, string][] = [
  [3, 'Mudah'],
  [4, 'Sedang'],
  [5, 'Sulit'],
  [6, 'Pro'],
  [8, 'Master'],
];

const FLOWER_PRESETS = [
  { id: 'p1', name: 'Mawar Merah', url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc51?w=800&q=85' },
  { id: 'p2', name: 'Lavender', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=85' },
  { id: 'p3', name: 'Bunga Matahari', url: 'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=800&q=85' },
  { id: 'p4', name: 'Tulip', url: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&q=85' },
  { id: 'p5', name: 'Buket Spesial', url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=85' },
];

export default function PuzzleGame({
  isPremium = false,
  backHref = '/minigames',
  isFullscreen = false,
  onToggleFullscreen,
}: PuzzleGameProps) {
  const router = useRouter();

  // VIP Modal state
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Game UI state
  const [inMenu, setInMenu] = useState(true);
  const [gridN, setGridN] = useState<number>(4);
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [customImageEl, setCustomImageEl] = useState<HTMLImageElement | null>(null);

  // In-Game stats
  const [timeStr, setTimeStr] = useState('00:00');
  const [placedCount, setPlacedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(16);
  const [mistakes, setMistakes] = useState(0);
  const [bestTime, setBestTime] = useState<string>('–');
  const [isPeeking, setIsPeeking] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Win Modal state
  const [isWinOpen, setIsWinOpen] = useState(false);
  const [winTimeStr, setWinTimeStr] = useState('');
  const [isRecordingTl, setIsRecordingTl] = useState(false);
  const [tlInfo, setTlInfo] = useState('');

  // Multiplayer & Voice Chat state
  const [playerName, setPlayerName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pj_player_name') || `Pemain-${Math.floor(100 + Math.random() * 900)}`;
    }
    return 'Pemain 1';
  });
  const [playMode, setPlayMode] = useState<'solo' | 'duo' | 'party'>('solo');
  const [playerLimit, setPlayerLimit] = useState<number>(2);
  const [roomCode, setRoomCode] = useState<string>('LYS-2026');
  const [inputJoinCode, setInputJoinCode] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [micGuideModalOpen, setMicGuideModalOpen] = useState<boolean>(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState<boolean>(false);
  const [rawPhotoSrc, setRawPhotoSrc] = useState<string | null>(null);
  const [isConvertingImage, setIsConvertingImage] = useState<boolean>(false);

  // Incoming data message handler reference
  const gameDataHandlerRef = useRef<(data: any) => void>(() => {});
  const handleIncomingData = useCallback((data: any) => {
    gameDataHandlerRef.current?.(data);
  }, []);

  // WebRTC Voice Chat Engine & Real-time Ping Latency
  const voice = useWebRtcVoice(roomCode, playMode !== 'solo', playerName, handleIncomingData);

  // Auto-detect Room invite link (?room=LYS-XXXX)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const r = p.get('room');
      if (r) {
        setRoomCode(r.toUpperCase());
        setPlayMode('duo');
        setPlayerLimit(2);
        setToastMsg(`Bergabung ke Room ${r.toUpperCase()}!`);
        setTimeout(() => setToastMsg(null), 3500);
      }
    }
  }, []);

  // Refs
  const stageRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tlCanvasRef = useRef<HTMLCanvasElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Engine state refs
  const dragRef = useRef<DragState | null>(null);
  const recRef = useRef<RecData | null>(null);
  const srcCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const t0Ref = useRef<number>(0);
  const placedRef = useRef<number>(0);
  const missRef = useRef<number>(0);
  const zRef = useRef<number>(10);
  const lastLogRef = useRef<number>(0);
  const tlRafRef = useRef<number>(0);
  const tlStartRef = useRef<number>(0);
  const DpRef = useRef<number>(8000);

  // DPR multiplier (max 2 for crisp rendering)
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // ═══════════════════════════════════════════════════
  // PROCEDURAL JIGSAW PATH MATH (From puzzle.html)
  // ═══════════════════════════════════════════════════

  const edge = (c: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, t: number) => {
    if (!t) { c.lineTo(bx, by); return; }
    const dx = bx - ax, dy = by - ay;
    const nx = dy * t, ny = -dx * t;
    const p = (u: number, v: number) => [ax + dx * u + nx * v, ay + dy * u + ny * v] as const;

    c.lineTo(...p(0.38, 0));
    c.bezierCurveTo(...p(0.38, 0.08), ...p(0.30, 0.10), ...p(0.30, 0.20));
    c.bezierCurveTo(...p(0.30, 0.33), ...p(0.70, 0.33), ...p(0.70, 0.20));
    c.bezierCurveTo(...p(0.70, 0.10), ...p(0.62, 0.08), ...p(0.62, 0));
    c.lineTo(bx, by);
  };

  const genE = (k: number): PieceEdges => {
    const r = () => (Math.random() < 0.5 ? 1 : -1);
    const H: number[][] = [];
    const V: number[][] = [];
    for (let i = 0; i <= k; i++) {
      H[i] = [];
      V[i] = [];
      for (let j = 0; j <= k; j++) {
        H[i][j] = r();
        V[i][j] = r();
      }
    }
    return { H, V };
  };

  const path = (x: CanvasRenderingContext2D, s: number, r: number, c: number, E: PieceEdges, k: number) => {
    const tp = r ? -E.H[r][c] : 0;
    const bt = r < k - 1 ? E.H[r + 1][c] : 0;
    const lf = c ? -E.V[r][c] : 0;
    const rt = c < k - 1 ? E.V[r][c + 1] : 0;
    x.beginPath();
    x.moveTo(0, 0);
    edge(x, 0, 0, s, 0, tp);
    edge(x, s, 0, s, s, rt);
    edge(x, s, s, 0, s, bt);
    edge(x, 0, s, 0, 0, lf);
    x.closePath();
  };

  const guide = (cv: HTMLCanvasElement, s: number, k: number, E: PieceEdges, dark: number, light: number) => {
    const x = cv.getContext('2d')!;
    const lw = Math.max(1, s * 0.03);
    x.lineJoin = 'round';
    [
      [`rgba(31,41,55,${dark})`, lw * 1.6] as const,
      [`rgba(255,255,255,${light})`, lw * 0.7] as const,
    ].forEach(([col, w]) => {
      x.strokeStyle = col;
      x.lineWidth = w;
      for (let r = 0; r < k; r++) {
        for (let c = 0; c < k; c++) {
          x.save();
          x.translate(c * s, r * s);
          path(x, s, r, c, E, k);
          x.stroke();
          x.restore();
        }
      }
    });
  };

  const showToast = (t: string) => {
    setToastMsg(t);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 1400);
  };

  const fmt = (s: number) =>
    String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

  // ═══════════════════════════════════════════════════
  // PREVIEW RENDERER
  // ═══════════════════════════════════════════════════

  const renderSelectedImage = useCallback(
    (targetW: number): Promise<HTMLCanvasElement> => {
      return new Promise((resolve) => {
        const c = document.createElement('canvas');
        c.width = c.height = targetW;
        const ctx = c.getContext('2d')!;

        if (customImageEl) {
          const m = Math.min(customImageEl.width, customImageEl.height);
          ctx.drawImage(
            customImageEl,
            (customImageEl.width - m) / 2,
            (customImageEl.height - m) / 2,
            m,
            m,
            0,
            0,
            targetW,
            targetW
          );
          resolve(c);
        } else {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const m = Math.min(img.width, img.height);
            ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, targetW, targetW);
            resolve(c);
          };
          img.onerror = () => {
            ctx.fillStyle = '#6366f1';
            ctx.fillRect(0, 0, targetW, targetW);
            resolve(c);
          };
          img.src = FLOWER_PRESETS[selectedPreset].url;
        }
      });
    },
    [customImageEl, selectedPreset]
  );

  const updatePreview = useCallback(async () => {
    const cv = previewCanvasRef.current;
    if (!cv) return;
    const W = 360;
    cv.width = cv.height = W;
    const imgCanvas = await renderSelectedImage(W);
    const ctx = cv.getContext('2d')!;
    ctx.drawImage(imgCanvas, 0, 0);
    guide(cv, W / gridN, gridN, genE(gridN), 0.45, 0.75);
  }, [gridN, renderSelectedImage]);

  useEffect(() => {
    if (inMenu) {
      updatePreview();
    }
  }, [inMenu, gridN, selectedPreset, customImageEl, updatePreview]);

  // ═══════════════════════════════════════════════════
  // FILE UPLOAD (VIP GATED)
  // ═══════════════════════════════════════════════════

  const handleCustomPhotoClick = () => {
    if (!isPremium) {
      setIsVipModalOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const onFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    if (!f) return;

    // Reset input so selecting the same file triggers onChange
    ev.target.value = '';

    const name = f.name.toLowerCase();
    const allowedExtensions = ['.heic', '.heif', '.jpg', '.jpeg', '.png', '.jp2', '.j2k', '.jpf', '.jpx', '.jpm'];
    const hasAllowedExt = allowedExtensions.some((ext) => name.endsWith(ext));
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/heic',
      'image/heif',
      'image/jp2',
      'image/jpx',
      'image/jpm',
    ];
    const hasAllowedMime = allowedMimes.includes(f.type.toLowerCase());

    // Selebihnya tidak bisa memasukkan foto
    if (!hasAllowedExt && !hasAllowedMime) {
      showToast('❌ Format tidak didukung! Hanya diperbolehkan HEIC, JPG, JPEG, PNG, dan JPEG2.');
      return;
    }

    const isHeic =
      name.endsWith('.heic') ||
      name.endsWith('.heif') ||
      f.type.toLowerCase().includes('heic') ||
      f.type.toLowerCase().includes('heif');

    if (isHeic) {
      setIsConvertingImage(true);
      showToast('🔄 Mengonversi foto HEIC...');
      try {
        const heic2anyModule = await import('heic2any');
        const heic2any = heic2anyModule.default || heic2anyModule;
        const converted = await heic2any({
          blob: f,
          toType: 'image/jpeg',
          quality: 0.92,
        });
        const finalBlob = Array.isArray(converted) ? converted[0] : converted;
        const objectUrl = URL.createObjectURL(finalBlob);
        setRawPhotoSrc(objectUrl);
        setAdjustModalOpen(true);
      } catch (err) {
        console.error('HEIC conversion error:', err);
        showToast('❌ Gagal memproses file HEIC!');
      } finally {
        setIsConvertingImage(false);
      }
      return;
    }

    // Standard formats: JPG, JPEG, PNG, JPEG2
    const reader = new FileReader();
    reader.onload = () => {
      setRawPhotoSrc(reader.result as string);
      setAdjustModalOpen(true);
    };
    reader.onerror = () => {
      showToast('❌ Gagal membaca file gambar!');
    };
    reader.readAsDataURL(f);
  };

  // ═══════════════════════════════════════════════════
  // MULTIPLAYER & ON-MIC TOGGLE
  // ═══════════════════════════════════════════════════

  const handleSelectPartyMode = (count: number) => {
    if (count > 2 && !isPremium) {
      setIsVipModalOpen(true);
      return;
    }
    setPlayerLimit(count);
    setPlayMode(count === 1 ? 'solo' : count === 2 ? 'duo' : 'party');
  };

  const toggleMic = async () => {
    const res = await voice.toggleMic();
    if (res.action === 'turned_on') {
      showToast('🎙️ Mikrofon aktif (P2P Voice)');
    } else if (res.action === 'turned_off') {
      showToast('🔇 Mikrofon dinonaktifkan');
    } else {
      showToast(res.errorMessage || '⚠️ Gagal mengakses mikrofon');
      setMicGuideModalOpen(true);
    }
  };

  const copyRoomCode = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '/puzzle';
    const inviteUrl = `${origin}${path}?room=${roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setIsCopied(true);
    showToast('Tautan mabar berhasil disalin!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleJoinRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputJoinCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!clean) {
      showToast('⚠️ Masukkan kode room teman');
      return;
    }
    const finalCode = clean.startsWith('LYS-') ? clean : `LYS-${clean.replace(/^LYS/, '')}`;
    setRoomCode(finalCode);
    setPlayMode('duo');
    setPlayerLimit(2);
    setInputJoinCode('');
    showToast(`✅ Bergabung ke Room ${finalCode}!`);
  };

  const handleNewRandomRoom = () => {
    const randomCode = 'LYS-' + Math.floor(1000 + Math.random() * 9000);
    setRoomCode(randomCode);
    showToast(`🎲 Kode Room baru: ${randomCode}`);
  };

  // ═══════════════════════════════════════════════════
  // TIMELAPSE REPLAY (From puzzle.html)
  // ═══════════════════════════════════════════════════

  const rr = (x: CanvasRenderingContext2D, a: number, b: number, w: number, h: number, r: number) => {
    x.beginPath();
    x.moveTo(a + r, b);
    x.arcTo(a + w, b, a + w, b + h, r);
    x.arcTo(a + w, b + h, a, b + h, r);
    x.arcTo(a, b + h, a, b, r);
    x.arcTo(a, b, a + w, b, r);
    x.closePath();
  };

  const tlDraw = (tt: number) => {
    const cv = tlCanvasRef.current;
    const rec = recRef.current;
    if (!cv || !rec) return;
    const x = cv.getContext('2d')!;
    const k = cv.width / rec.sw;
    const T = rec.T;

    x.fillStyle = '#f4f5f7';
    x.fillRect(0, 0, cv.width, cv.height);
    x.fillStyle = '#eceff3';
    x.strokeStyle = '#c9cfd8';
    x.lineWidth = 1.5;
    x.setLineDash([6, 5]);
    rr(x, T.x * k, T.y * k, T.w * k, T.h * k, 14 * k);
    x.fill();
    x.stroke();
    x.setLineDash([]);

    x.fillStyle = '#fff';
    x.fillRect(rec.bx * k, rec.by * k, rec.Bc * k, rec.Bc * k);
    x.drawImage(rec.guide, rec.bx * k, rec.by * k, rec.Bc * k, rec.Bc * k);

    const pos = rec.init.map((p) => ({ x: p.x, y: p.y, ok: false, o: 0 }));
    let o = 0;
    for (const e of rec.log) {
      if (e.t > tt) break;
      const p = pos[e.id];
      p.x = e.x;
      p.y = e.y;
      p.o = ++o;
      if (e.ok) p.ok = true;
    }

    const w = rec.pw * k;
    const ids = pos
      .map((_, i) => i)
      .sort((a, b) => (Number(pos[b].ok) - Number(pos[a].ok)) || (pos[a].o - pos[b].o));
    ids.forEach((i) => {
      const p = pos[i];
      x.shadowColor = p.ok ? 'transparent' : 'rgba(31,41,55,.35)';
      x.shadowBlur = p.ok ? 0 : 5 * k;
      x.shadowOffsetY = p.ok ? 0 : 2 * k;
      x.drawImage(rec.pcs[i], p.x * k, p.y * k, w, w);
    });
    x.shadowColor = 'transparent';
  };

  const tlLoop = (now: number) => {
    const el = now - tlStartRef.current;
    const Dp = DpRef.current;
    const rec = recRef.current;
    if (!rec) return;
    const p = isRecordingTl ? Math.min(el / Dp, 1) : (el % (Dp + 1500)) / Dp;
    tlDraw(Math.min(p, 1) * rec.D);
    tlRafRef.current = requestAnimationFrame(tlLoop);
  };

  const tlInit = () => {
    const cv = tlCanvasRef.current;
    const rec = recRef.current;
    if (!cv || !rec) return;
    const w = rec.sw >= 760 ? 960 : 600;
    const k = w / rec.sw;
    cv.width = w;
    cv.height = Math.round((rec.sh * k) / 2) * 2;
    DpRef.current = Math.min(Math.max(rec.D / 9, 6000), 22000);
    tlStartRef.current = performance.now();
    setIsRecordingTl(false);
    cancelAnimationFrame(tlRafRef.current);
    tlRafRef.current = requestAnimationFrame(tlLoop);
    setTlInfo(`Timelapse pengerjaanmu · ${Math.round(DpRef.current / 1000)} detik`);
  };

  const downloadImage = () => {
    if (!srcCanvasRef.current) return;
    srcCanvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'puzzle-selesai.png';
      a.click();
    }, 'image/png');
  };

  const downloadTimelapse = () => {
    const cv = tlCanvasRef.current;
    if (!cv || !('captureStream' in cv)) {
      showToast('Browser belum mendukung rekam video');
      return;
    }
    const stream = (cv as any).captureStream(30);
    const mime = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find(
      (m) => (window as any).MediaRecorder?.isTypeSupported(m)
    );
    if (!mime) {
      showToast('Format video belum didukung browser');
      return;
    }
    const ch: BlobPart[] = [];
    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3000000 });
    } catch {
      showToast('Gagal merekam video');
      return;
    }
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size) ch.push(e.data);
    };
    mr.onstop = () => {
      setIsRecordingTl(false);
      tlStartRef.current = performance.now();
      const ext = mime.indexOf('mp4') > -1 ? 'mp4' : 'webm';
      const blob = new Blob(ch, { type: mime.split(';')[0] });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `timelapse-puzzle.${ext}`;
      a.click();
    };
    setIsRecordingTl(true);
    tlStartRef.current = performance.now();
    mr.start();
    setTimeout(() => {
      mr.stop();
    }, DpRef.current + 1200);
  };

  // ═══════════════════════════════════════════════════
  // BUILD & PLAY ENGINE (Direct from puzzle.html)
  // ═══════════════════════════════════════════════════

  const getLayout = (stage: HTMLDivElement) => {
    const r = stage.getBoundingClientRect();
    const sw = r.width;
    const sh = r.height;
    const wide = sw >= 760 && sw > sh * 1.1;
    if (wide) {
      const B = Math.min(sh - 24, sw * 0.52, 780);
      const bx = 16;
      return { B, bx, by: (sh - B) / 2, tray: { x: bx + B + 24, y: 12, w: sw - (bx + B + 24) - 12, h: sh - 24 } };
    }
    const B = Math.min(sw - 16, sh * 0.56, 580);
    const bx = (sw - B) / 2;
    const by = 6;
    return { B, bx, by, tray: { x: 8, y: by + B + 12, w: sw - 16, h: sh - (by + B + 12) - 6 } };
  };

  const lg = (el: any, ok?: boolean) => {
    if (!recRef.current || !t0Ref.current) return;
    recRef.current.log.push({
      t: Date.now() - t0Ref.current,
      id: el._id,
      x: parseFloat(el.style.left),
      y: parseFloat(el.style.top),
      ok: !!ok,
    });
  };

  const triggerWrong = (el: HTMLCanvasElement, sx: number, sy: number) => {
    missRef.current++;
    setMistakes(missRef.current);
    el.classList.add('bad');
    const bd = document.getElementById('board');
    if (bd) bd.classList.add('badflash');
    showToast('Belum pas, coba posisi lain');
    setTimeout(() => {
      const b = document.getElementById('board');
      if (b) b.classList.remove('badflash');
    }, 500);
    setTimeout(() => {
      el.classList.add('ret');
      el.style.left = sx + 'px';
      el.style.top = sy + 'px';
      setTimeout(() => {
        el.classList.remove('bad', 'ret');
        lg(el, false);
      }, 380);
    }, 520);
  };

  const handleWin = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const sec = Math.floor((Date.now() - t0Ref.current) / 1000);
    const savedBest = localStorage.getItem('jig_' + gridN);
    let extra = '';
    if (!savedBest || sec < +savedBest) {
      localStorage.setItem('jig_' + gridN, String(sec));
      extra = ' · Rekor baru!';
    }
    setBestTime(fmt(Math.min(sec, savedBest ? +savedBest : sec)));
    setWinTimeStr(`${gridN}×${gridN} selesai dalam ${fmt(sec)} · ${missRef.current} salah${extra}`);
    if (recRef.current) {
      recRef.current.D = Date.now() - t0Ref.current + 400;
    }
    setIsWinOpen(true);
    setTimeout(() => {
      tlInit();
    }, 500);
  };

  const buildGame = useCallback(
    async (initialPlacedIds?: number[]) => {
      const stage = stageRef.current;
      if (!stage) return;

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      cancelAnimationFrame(tlRafRef.current);
      t0Ref.current = 0;
      placedRef.current = 0;
      missRef.current = 0;
      zRef.current = 10;
      dragRef.current = null;
      stage.innerHTML = '';
      setIsWinOpen(false);
      setPlacedCount(0);
      setTotalCount(gridN * gridN);
      setMistakes(0);
      setTimeStr('00:00');

      const L = getLayout(stage);
      const s = Math.max(8, Math.round((L.B * dpr) / gridN));
      const Wd = s * gridN;
      const Bc = Wd / dpr;
      const pad = Math.round(s * 0.3);
      const bx = L.bx + (L.B - Bc) / 2;
      const by = L.by + (L.B - Bc) / 2;
      const S = s / dpr;
      const P = pad / dpr;
      const T = L.tray;

      const renderedSrc = await renderSelectedImage(Wd);
      srcCanvasRef.current = renderedSrc;
      const E = genE(gridN);

      // Tray area
      const tr = document.createElement('div');
      tr.className = 'tray';
      tr.style.cssText = `left:${T.x}px;top:${T.y}px;width:${T.w}px;height:${T.h}px`;
      stage.appendChild(tr);

      // Board area
      const bd = document.createElement('div');
      bd.className = `board ${isPeeking ? 'peek' : ''}`;
      bd.id = 'board';
      bd.style.cssText = `left:${bx}px;top:${by}px;width:${Bc}px;height:${Bc}px`;

      const im = document.createElement('img');
      im.src = renderedSrc.toDataURL('image/jpeg', 0.85);
      bd.appendChild(im);

      const gc = document.createElement('canvas');
      gc.width = gc.height = Wd;
      guide(gc, s, gridN, E, 0.2, 0.9);
      bd.appendChild(gc);
      stage.appendChild(bd);

      const cw = s + 2 * pad;
      const pcs = Math.round(cw / dpr);
      const sr = stage.getBoundingClientRect();

      recRef.current = {
        log: [],
        init: [],
        pcs: [],
        guide: gc,
        pw: pcs,
        sw: sr.width,
        sh: sr.height,
        bx,
        by,
        Bc,
        T,
        D: 0,
      };

      for (let r = 0; r < gridN; r++) {
        for (let c = 0; c < gridN; c++) {
          const cv = document.createElement('canvas');
          cv.width = cv.height = cw;
          cv.className = 'pc';
          cv.style.width = cv.style.height = cw / dpr + 'px';

          const x = cv.getContext('2d')!;
          x.translate(pad, pad);
          path(x, s, r, c, E, gridN);
          x.save();
          x.clip();
          x.drawImage(renderedSrc, -c * s, -r * s);
          x.restore();

          const lw = Math.max(1, s * 0.03);
          x.lineJoin = 'round';
          x.strokeStyle = 'rgba(31,41,55,.3)';
          x.lineWidth = lw * 1.8;
          x.stroke();
          x.strokeStyle = 'rgba(255,255,255,.7)';
          x.lineWidth = lw * 0.7;
          x.stroke();

          const pieceId = r * gridN + c;
          (cv as any)._tx = bx + c * S - P;
          (cv as any)._ty = by + r * S - P;
          (cv as any)._S = S;
          (cv as any)._pw = pcs;
          (cv as any)._id = pieceId;

          // Position scattered in tray or auto-place if already placed in co-op session
          if (initialPlacedIds && initialPlacedIds.includes(pieceId)) {
            cv.style.left = (cv as any)._tx + 'px';
            cv.style.top = (cv as any)._ty + 'px';
            cv.classList.add('ok');
            placedRef.current++;
          } else {
            cv.style.left = T.x + Math.random() * Math.max(0, T.w - pcs) + 'px';
            cv.style.top = T.y + Math.random() * Math.max(0, T.h - pcs) + 'px';
          }
          cv.style.zIndex = String(++zRef.current);
          stage.appendChild(cv);

          recRef.current.pcs[pieceId] = cv;
          recRef.current.init[pieceId] = {
            x: parseFloat(cv.style.left),
            y: parseFloat(cv.style.top),
          };
        }
      }

      setPlacedCount(placedRef.current);
      const savedBest = localStorage.getItem('jig_' + gridN);
      setBestTime(savedBest ? fmt(+savedBest) : '–');
    },
    [gridN, isPeeking, renderSelectedImage, dpr]
  );

  // Smart Relayout: adjusts layout proportionally when fullscreen/resizing WITHOUT wiping placed pieces!
  const relayoutGame = useCallback(() => {
    const stage = stageRef.current;
    const rec = recRef.current;
    if (!stage || inMenu || !rec || rec.pcs.length === 0) return;

    const L = getLayout(stage);
    const s = Math.max(8, Math.round((L.B * dpr) / gridN));
    const Wd = s * gridN;
    const Bc = Wd / dpr;
    const pad = Math.round(s * 0.3);
    const bx = L.bx + (L.B - Bc) / 2;
    const by = L.by + (L.B - Bc) / 2;
    const S = s / dpr;
    const P = pad / dpr;
    const T = L.tray;

    // Reposition tray
    const tr = stage.querySelector('.tray') as HTMLDivElement | null;
    if (tr) {
      tr.style.left = `${T.x}px`;
      tr.style.top = `${T.y}px`;
      tr.style.width = `${T.w}px`;
      tr.style.height = `${T.h}px`;
    }

    // Reposition board
    const bd = stage.querySelector('#board') as HTMLDivElement | null;
    if (bd) {
      bd.style.left = `${bx}px`;
      bd.style.top = `${by}px`;
      bd.style.width = `${Bc}px`;
      bd.style.height = `${Bc}px`;
    }

    const cw = s + 2 * pad;
    const pcs = Math.round(cw / dpr);
    const oldT = rec.T;

    rec.pcs.forEach((cv, id) => {
      if (!cv) return;
      const r = Math.floor(id / gridN);
      const c = id % gridN;
      const newTx = bx + c * S - P;
      const newTy = by + r * S - P;

      (cv as any)._tx = newTx;
      (cv as any)._ty = newTy;
      (cv as any)._S = S;
      (cv as any)._pw = pcs;

      if (cv.classList.contains('ok')) {
        // Locked in place: keep exactly on the board!
        cv.style.left = `${newTx}px`;
        cv.style.top = `${newTy}px`;
      } else {
        // Proportional reposition in new tray
        const currX = parseFloat(cv.style.left) || T.x;
        const currY = parseFloat(cv.style.top) || T.y;
        const relX = oldT.w > 0 ? (currX - oldT.x) / oldT.w : 0.5;
        const relY = oldT.h > 0 ? (currY - oldT.y) / oldT.h : 0.5;
        cv.style.left = `${T.x + Math.max(0, Math.min(T.w - pcs, relX * T.w))}px`;
        cv.style.top = `${T.y + Math.max(0, Math.min(T.h - pcs, relY * T.h))}px`;
      }
    });

    rec.bx = bx;
    rec.by = by;
    rec.Bc = Bc;
    rec.T = T;
    rec.pw = pcs;
  }, [inMenu, gridN, dpr]);

  // Pointer event listeners on stage
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || inMenu) return;

    const onPointerDown = (ev: PointerEvent) => {
      const els = document
        .elementsFromPoint(ev.clientX, ev.clientY)
        .filter((e) => e.classList && e.classList.contains('pc') && !e.classList.contains('ok'));

      for (const el of els as HTMLCanvasElement[]) {
        const rc = el.getBoundingClientRect();
        const lx = (((ev.clientX - rc.left) * el.width) / rc.width) | 0;
        const ly = (((ev.clientY - rc.top) * el.height) / rc.height) | 0;
        if (el.getContext('2d')!.getImageData(lx, ly, 1, 1).data[3] > 40) {
          dragRef.current = {
            el,
            ox: ev.clientX - rc.left,
            oy: ev.clientY - rc.top,
            sx: parseFloat(el.style.left),
            sy: parseFloat(el.style.top),
          };
          el.classList.add('drag');
          el.style.zIndex = String(++zRef.current);

          if (!t0Ref.current) {
            t0Ref.current = Date.now();
            timerIntervalRef.current = setInterval(() => {
              setTimeStr(fmt(Math.floor((Date.now() - t0Ref.current) / 1000)));
            }, 500);
          }
          lg(el);
          try {
            stage.setPointerCapture(ev.pointerId);
          } catch {}
          return;
        }
      }
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const r = stage.getBoundingClientRect();
      dragRef.current.el.style.left = ev.clientX - dragRef.current.ox - r.left + 'px';
      dragRef.current.el.style.top = ev.clientY - dragRef.current.oy - r.top + 'px';
      const nw = Date.now();
      if (nw - lastLogRef.current > 40) {
        lastLogRef.current = nw;
        lg(dragRef.current.el);
      }
    };

    const onPointerUp = () => {
      if (!dragRef.current) return;
      const el = dragRef.current.el;
      const sx = dragRef.current.sx;
      const sy = dragRef.current.sy;
      dragRef.current = null;
      el.classList.remove('drag');

      const dx = parseFloat(el.style.left) - (el as any)._tx;
      const dy = parseFloat(el.style.top) - (el as any)._ty;
      const ok = Math.abs(dx) < (el as any)._S * 0.4 && Math.abs(dy) < (el as any)._S * 0.4;

      if (ok) {
        el.style.left = (el as any)._tx + 'px';
        el.style.top = (el as any)._ty + 'px';
        el.classList.add('ok');
        placedRef.current++;
        setPlacedCount(placedRef.current);

        // Sync placed piece to multiplayer room
        if (playMode !== 'solo') {
          voice.sendMessage({
            type: '__piece_placed__',
            pieceId: (el as any)._id,
            byName: playerName,
          });
        }
      }
      lg(el, ok);

      if (ok) {
        if (placedRef.current === gridN * gridN) {
          handleWin();
        }
        return;
      }

      const cx = parseFloat(el.style.left) + (el as any)._pw / 2;
      const cy = parseFloat(el.style.top) + (el as any)._pw / 2;
      const rec = recRef.current;
      if (rec && cx > rec.bx && cx < rec.bx + rec.Bc && cy > rec.by && cy < rec.by + rec.Bc) {
        triggerWrong(el, sx, sy);
      }
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);

    return () => {
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerUp);
    };
  }, [inMenu, gridN, playMode, playerName, voice]);

  // Recalculate stage on window resize or fullscreen toggle (WITHOUT resetting pieces!)
  useEffect(() => {
    let timeoutId: any;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!inMenu && stageRef.current) {
          if (recRef.current && recRef.current.pcs.length > 0) {
            relayoutGame();
          } else {
            buildGame();
          }
        }
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [inMenu, buildGame, relayoutGame]);

  // Handle incoming data messages (Game Sync & Co-op Moves)
  useEffect(() => {
    gameDataHandlerRef.current = (data: any) => {
      if (!data || typeof data !== 'object') return;
      if (data.type === '__player_join__') {
        showToast(`👋 ${data.name || 'Teman'} bergabung ke room!`);
        // If Host is already playing, send current game state to newcomer!
        if (!inMenu && recRef.current) {
          const placedIds: number[] = [];
          recRef.current.pcs.forEach((cv, idx) => {
            if (cv && cv.classList.contains('ok')) placedIds.push(idx);
          });
          voice.sendMessage({
            type: '__game_sync__',
            presetIdx: selectedPreset,
            gridN,
            hostName: playerName,
            placedIds,
          });
        }
      } else if (data.type === '__game_sync__') {
        showToast(`🎮 Masuk ke sesi puzzle ${data.hostName || 'Host'}!`);
        if (typeof data.presetIdx === 'number') {
          setSelectedPreset(data.presetIdx);
        }
        if (typeof data.gridN === 'number') {
          setGridN(data.gridN);
        }
        setPlayMode('duo');
        setInMenu(false);
        setTimeout(() => {
          buildGame(data.placedIds);
        }, 60);
      } else if (data.type === '__piece_placed__') {
        const stage = stageRef.current;
        const rec = recRef.current;
        if (!stage || !rec) return;

        const pieceEl = rec.pcs[data.pieceId];
        if (pieceEl && !pieceEl.classList.contains('ok')) {
          pieceEl.style.left = (pieceEl as any)._tx + 'px';
          pieceEl.style.top = (pieceEl as any)._ty + 'px';
          pieceEl.classList.add('ok');
          placedRef.current++;
          setPlacedCount(placedRef.current);
          showToast(`🧩 ${data.byName || 'Teman'} memasang kepingan!`);

          if (placedRef.current === gridN * gridN) {
            handleWin();
          }
        }
      }
    };
  }, [inMenu, selectedPreset, gridN, playerName, buildGame, voice]);

  const startGame = () => {
    // Generate random room code for mabar if empty
    if (!roomCode) {
      const randomCode = 'LYS-' + Math.floor(1000 + Math.random() * 9000);
      setRoomCode(randomCode);
    }
    setInMenu(false);
    setTimeout(() => {
      buildGame();
      if (playMode !== 'solo') {
        voice.sendMessage({
          type: '__game_sync__',
          presetIdx: selectedPreset,
          gridN,
          hostName: playerName,
          placedIds: [],
        });
      }
    }, 50);
  };

  const returnToMenu = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    cancelAnimationFrame(tlRafRef.current);
    setInMenu(true);
    setIsWinOpen(false);
  };

  const togglePeek = () => {
    setIsPeeking((prev) => {
      const next = !prev;
      const bd = document.getElementById('board');
      if (bd) {
        if (next) bd.classList.add('peek');
        else bd.classList.remove('peek');
      }
      return next;
    });
  };

  return (
    <div className={`pj-html-root ${isFullscreen ? 'is-fullscreen' : ''}`}>
      {/* ── HEADER GAME BAR ── */}
      <header className="pj-header">
        <div className="pj-header-left">
          <button
            type="button"
            className="pj-btn pj-btn-back"
            onClick={inMenu ? () => router.push(backHref) : returnToMenu}
            id="btn-puzzle-back"
          >
            <ArrowLeft size={15} />
            <span>{inMenu ? 'Mini Games' : 'Menu'}</span>
          </button>
        </div>

        <div className="pj-header-center">
          <span className="pj-eyebrow">
            {playMode === 'solo' ? 'Mini Games' : `Mabar Online (${playerLimit} Pemain)`}
          </span>
          <h1 className="pj-title">Puzzle Jigsaw</h1>
        </div>

        <div className="pj-header-right">
          {/* Fullscreen Toggle Button */}
          {onToggleFullscreen && (
            <button
              type="button"
              className={`pj-btn pj-btn-fs ${isFullscreen ? 'pj-btn--active' : ''}`}
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Keluar Layar Penuh (ESC)' : 'Mode Layar Penuh (Fullscreen)'}
              id="btn-puzzle-fullscreen"
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              <span className="hidden sm:inline">{isFullscreen ? 'Kecilkan' : 'Layar Penuh'}</span>
            </button>
          )}

          {/* Real-time WebRTC Ping Badge - Always Visible */}
          <div
            className={`pj-ping-badge pj-ping-badge--${voice.pingQuality}`}
            title={`Latensi Suara P2P: ${voice.pingMs ? `${voice.pingMs}ms` : '32ms'} (${
              voice.pingQuality === 'good'
                ? 'Ultra Cepat · Tanpa Delay'
                : voice.pingQuality === 'medium'
                ? 'Koneksi Lancar'
                : 'Sinyal Kurang Stabil'
            })`}
          >
            <span className="pj-ping-dot" />
            <span className="pj-ping-val">{voice.pingMs ? `${voice.pingMs}ms` : '32ms'}</span>
          </div>

          {/* Room Code Badge - Always Visible */}
          <button
            type="button"
            className="pj-btn pj-btn-room"
            onClick={copyRoomCode}
            title={`Kode Room: ${roomCode}. Klik untuk salin tautan mabar!`}
            id="btn-header-room"
          >
            <Users size={14} className="text-indigo-500" />
            <span className="font-mono font-bold">{roomCode}</span>
            {isCopied && <span className="text-emerald-500 text-xs">✓</span>}
          </button>

          {/* On-Mic Toggle Button - Always Visible */}
          <button
            type="button"
            className={`pj-btn pj-btn-mic ${voice.isMicOn ? 'pj-btn-mic--on' : ''}`}
            onClick={toggleMic}
            title={voice.isMicOn ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon (On-Mic)'}
            id="btn-header-mic"
          >
            {voice.isMicOn ? (
              <>
                <Mic size={15} />
                {/* Live Voice-Activated Waveform Equalizer */}
                <span className={`pj-voice-wave ${voice.isSpeaking ? 'is-speaking' : ''}`} title="Mikrofon aktif">
                  <span style={{ height: `${Math.max(3, Math.min(18, Math.round((voice.voiceBands[0] / 100) * 18)))}px` }} />
                  <span style={{ height: `${Math.max(3, Math.min(22, Math.round((voice.voiceBands[1] / 100) * 22)))}px` }} />
                  <span style={{ height: `${Math.max(3, Math.min(19, Math.round((voice.voiceBands[2] / 100) * 19)))}px` }} />
                  <span style={{ height: `${Math.max(3, Math.min(15, Math.round((voice.voiceBands[3] / 100) * 15)))}px` }} />
                </span>
                <span>On-Mic</span>
              </>
            ) : (
              <>
                <MicOff size={15} />
                <span>On-Mic</span>
              </>
            )}
          </button>

          {!inMenu && (
            <div className="pj-action-bar">
              <button type="button" className="pj-btn" onClick={() => buildGame()} title="Acak Ulang">
                <RefreshCw size={14} />
                <span>Acak</span>
              </button>
              <button
                type="button"
                className={`pj-btn ${isPeeking ? 'pj-btn--active' : ''}`}
                onClick={togglePeek}
                title="Intip Gambar"
              >
                <Eye size={14} />
                <span>Intip</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── IN-GAME STATS BAR ── */}
      {!inMenu && (
        <div className="pj-stats-strip">
          <div className="pj-stat-box">
            <span className="pj-stat-lbl">Waktu</span>
            <b className="pj-stat-val">{timeStr}</b>
          </div>
          <div className="pj-stat-box">
            <span className="pj-stat-lbl">Keping</span>
            <b className="pj-stat-val">
              {placedCount}/{totalCount}
            </b>
          </div>
          <div className="pj-stat-box">
            <span className="pj-stat-lbl">Terbaik</span>
            <b className="pj-stat-val">{bestTime}</b>
          </div>
          <div className="pj-stat-box">
            <span className="pj-stat-lbl">Salah</span>
            <b className="pj-stat-val">{mistakes}</b>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE CANVAS STAGE (puzzle.html engine) ── */}
      <div id="stage" ref={stageRef} className={`pj-stage ${inMenu ? 'pj-stage--hidden' : ''}`} />

      {/* ── MENU / LOBBY (From puzzle.html + VIP Perks & Multiplayer) ── */}
      {inMenu && (
        <div className={`pj-menu-overlay ${isFullscreen ? 'is-fullscreen' : ''}`}>
          <div className="pj-menu-card">
            {/* Header */}
            <div className="pj-menu-hd">
              <div className="pj-eyebrow">Mini Games · Bucket Bunga Laysa</div>
              <h2>Pilih Puzzle</h2>
            </div>

            {/* Left: Preview */}
            <div className="pj-menu-preview-col">
              <canvas ref={previewCanvasRef} className="pj-pv-canvas" />
              <p className="pj-pvt-text">
                {gridN}×{gridN} · {gridN * gridN} keping jigsaw
              </p>
            </div>

            {/* Right: Controls & Multiplayer */}
            <div className="pj-menu-controls-col">
                {/* Step 1: Mode Bermain & Mabar Room */}
                <div className="pj-menu-group">
                  <h3>1 · Mode Permainan & Mabar</h3>

                  {/* Player Name Input */}
                  <div className="pj-player-name-box">
                    <span className="pj-player-name-lbl">Nama Kamu:</span>
                    <input
                      type="text"
                      className="pj-player-name-input"
                      value={playerName}
                      onChange={(e) => {
                        const n = e.target.value;
                        setPlayerName(n);
                        if (typeof window !== 'undefined') localStorage.setItem('pj_player_name', n);
                      }}
                      placeholder="Ketik nama kamu..."
                      maxLength={16}
                    />
                  </div>

                  {/* Mode Selector (Solo, 2 Pemain, 4 Pemain VIP, 8 Pemain VIP) */}
                  <div className="pj-mode-selector">
                    <button
                      type="button"
                      className={`pj-mode-btn ${playerLimit === 1 ? 'on' : ''}`}
                      onClick={() => handleSelectPartyMode(1)}
                    >
                      <span>Solo</span>
                      <small>1 Pemain</small>
                    </button>
                    <button
                      type="button"
                      className={`pj-mode-btn ${playerLimit === 2 ? 'on' : ''}`}
                      onClick={() => handleSelectPartyMode(2)}
                    >
                      <span>2 Pemain</span>
                      <small className="text-emerald-500 font-bold">Gratis</small>
                    </button>
                    <button
                      type="button"
                      className={`pj-mode-btn pj-mode-btn--vip ${playerLimit === 4 ? 'on' : ''}`}
                      onClick={() => handleSelectPartyMode(4)}
                    >
                      <span className="flex items-center gap-1 justify-center">
                        <Crown size={12} className="text-amber-400" />
                        4 Pemain
                      </span>
                      <small className="text-amber-400 font-bold">VIP</small>
                    </button>
                    <button
                      type="button"
                      className={`pj-mode-btn pj-mode-btn--vip ${playerLimit === 8 ? 'on' : ''}`}
                      onClick={() => handleSelectPartyMode(8)}
                    >
                      <span className="flex items-center gap-1 justify-center">
                        <Crown size={12} className="text-amber-400" />
                        8 Pemain
                      </span>
                      <small className="text-amber-400 font-bold">Party</small>
                    </button>
                  </div>

                  {/* Multiplayer Room Code & Join Box — Selalu Tampil agar mudah mabar & masukkan kode */}
                  <div className="pj-room-card">
                    {/* Bar 1: Room Aktif & Share Link */}
                    <div className="pj-room-card-head">
                      <div className="pj-room-badge-group">
                        <Users size={14} className="text-indigo-600" />
                        <span className="pj-room-lbl">Room:</span>
                        <span className="pj-room-code-tag">{roomCode}</span>
                        <span className="pj-room-players-pill">
                          {voice.playerList.length}/{playerLimit} Pemain
                        </span>
                      </div>
                      <div className="pj-room-btn-group">
                        <button
                          type="button"
                          className="pj-room-action-btn"
                          onClick={copyRoomCode}
                          title="Salin Link Room untuk dikirim ke teman"
                        >
                          {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{isCopied ? 'Tersalin!' : 'Undang Teman'}</span>
                        </button>
                        <button
                          type="button"
                          className="pj-room-action-btn pj-room-action-btn--icon"
                          onClick={handleNewRandomRoom}
                          title="Acak Kode Room Baru"
                        >
                          <RefreshCw size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Daftar Nama Pemain yang Terhubung di Room */}
                    {voice.playerList.length > 0 && (
                      <div className="pj-player-chips">
                        {voice.playerList.map((p, idx) => (
                          <span
                            key={idx}
                            className={`pj-player-chip ${p === playerName ? 'pj-player-chip--me' : ''}`}
                          >
                            {p} {p === playerName ? '(Kamu)' : ''}
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Bar 2: Input Gabung Room Teman */}
                  <form className="pj-room-join-row" onSubmit={handleJoinRoom}>
                    <input
                      type="text"
                      className="pj-room-join-input"
                      placeholder="Masukkan kode room teman (misal: LYS-2026)"
                      value={inputJoinCode}
                      onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                      maxLength={12}
                    />
                    <button type="submit" className="pj-room-join-btn">
                      🚀 Gabung
                    </button>
                  </form>
                </div>

                {/* Voice Chat On-Mic Toggle right in the Lobby */}
                <div className="pj-lobby-voice-strip">
                  <div className="flex items-center gap-2">
                    <span className="pj-lobby-voice-lbl">Voice Chat:</span>
                    <button
                      type="button"
                      className={`pj-btn pj-btn-mic ${voice.isMicOn ? 'pj-btn-mic--on' : ''}`}
                      onClick={toggleMic}
                      id="btn-lobby-mic"
                    >
                      {voice.isMicOn ? (
                        <>
                          <Mic size={14} />
                          <span className={`pj-voice-wave ${voice.isSpeaking ? 'is-speaking' : ''}`} title="Mikrofon aktif">
                            <span style={{ height: `${Math.max(3, Math.min(18, Math.round((voice.voiceBands[0] / 100) * 18)))}px` }} />
                            <span style={{ height: `${Math.max(3, Math.min(22, Math.round((voice.voiceBands[1] / 100) * 22)))}px` }} />
                            <span style={{ height: `${Math.max(3, Math.min(19, Math.round((voice.voiceBands[2] / 100) * 19)))}px` }} />
                            <span style={{ height: `${Math.max(3, Math.min(15, Math.round((voice.voiceBands[3] / 100) * 15)))}px` }} />
                          </span>
                          <span>On-Mic</span>
                        </>
                      ) : (
                        <>
                          <MicOff size={14} />
                          <span>Nyalakan Mic</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className={`pj-ping-badge pj-ping-badge--${voice.pingQuality}`}>
                    <span className="pj-ping-dot" />
                    <span>Ping: {voice.pingMs ? `${voice.pingMs}ms` : '32ms'}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Gambar */}
              <div className="pj-menu-group">
                <h3>2 · Pilih Gambar</h3>
                <div className="pj-thumbs-row">
                  {FLOWER_PRESETS.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`pj-th-btn ${!customImageEl && selectedPreset === idx ? 'on' : ''}`}
                      onClick={() => {
                        setCustomImageEl(null);
                        setSelectedPreset(idx);
                      }}
                      title={p.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={p.name} />
                    </button>
                  ))}

                  {/* Foto Sendiri (VIP Lock / Unlock) */}
                  <button
                    type="button"
                    className={`pj-th-up ${customImageEl ? 'on' : ''} ${!isPremium ? 'locked' : ''}`}
                    onClick={handleCustomPhotoClick}
                    disabled={isConvertingImage}
                    title={isPremium ? 'Upload Foto Sendiri (HEIC, JPG, JPEG, PNG, JPEG2)' : 'Foto Sendiri (Khusus VIP)'}
                  >
                    {!isPremium ? (
                      <>
                        <Crown size={14} className="text-amber-400" />
                        <span>VIP Foto</span>
                      </>
                    ) : (
                      <>
                        <span>{isConvertingImage ? 'Konversi...' : customImageEl ? 'Ganti Foto' : 'Foto Sendiri'}</span>
                      </>
                    )}
                  </button>

                  {customImageEl && rawPhotoSrc && isPremium && (
                    <button
                      type="button"
                      className="pj-btn"
                      style={{ fontSize: '0.78rem', padding: '6px 10px', height: 'auto', border: '1px dashed #ec4899', color: '#db2777', fontWeight: 600, background: '#fdf2f8' }}
                      onClick={() => setAdjustModalOpen(true)}
                      title="Geser atau pusatkan (ketengahin) posisi foto"
                    >
                      📐 Atur Posisi Foto
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.heic,.heif,.jp2,.j2k,image/jpeg,image/png,image/heic,image/heif,image/jp2"
                    style={{ display: 'none' }}
                    onChange={onFileChange}
                  />
                </div>
              </div>

              {/* Step 3: Ukuran */}
              <div className="pj-menu-group">
                <h3>3 · Pilih Ukuran</h3>
                <div className="pj-sizes-grid">
                  {UKURAN.map(([sz, lbl]) => (
                    <button
                      key={sz}
                      type="button"
                      className={`pj-sz-btn ${gridN === sz ? 'on' : ''}`}
                      onClick={() => setGridN(sz)}
                    >
                      <span>
                        {sz}×{sz}
                      </span>
                      <small>
                        {lbl} · {sz * sz}
                      </small>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start CTA & Fullscreen Option */}
              <div className="pj-menu-cta-group">
                <button type="button" className="pj-go-btn" onClick={startGame} id="btn-start-puzzle">
                  <Play size={18} fill="currentColor" />
                  <span>Mulai Mainkan</span>
                </button>
                {onToggleFullscreen && (
                  <button
                    type="button"
                    className={`pj-fs-quick-btn ${isFullscreen ? 'on' : ''}`}
                    onClick={onToggleFullscreen}
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                    <span>{isFullscreen ? 'Keluar Layar Penuh' : 'Mainkan di Layar Penuh (Fullscreen)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WIN & TIMELAPSE MODAL (From puzzle.html) ── */}
      {isWinOpen && (
        <div className="pj-win-overlay">
          <div className="pj-win-card">
            <div className="pj-win-aura">
              <Trophy size={42} className="text-amber-400" />
            </div>
            <h2>Selesai! 🎉</h2>
            <p className="pj-win-msg">Kerja bagus, semua kepingan sudah di tempatnya.</p>
            <p className="pj-win-time">{winTimeStr}</p>

            {/* Canvas Timelapse */}
            <canvas ref={tlCanvasRef} className="pj-tl-canvas" width={600} height={800} />
            <p className="pj-tl-info">{tlInfo || 'Timelapse pengerjaanmu'}</p>

            {/* Action Buttons */}
            <div className="pj-win-row">
              <button type="button" className="pj-btn-pri" onClick={downloadImage}>
                <Download size={14} /> Unduh Gambar
              </button>
              <button
                type="button"
                className="pj-btn-pri"
                onClick={downloadTimelapse}
                disabled={isRecordingTl}
              >
                <Download size={14} /> {isRecordingTl ? 'Merekam…' : 'Unduh Timelapse'}
              </button>
            </div>
            <div className="pj-win-row pj-win-subrow">
              <button type="button" className="pj-btn" onClick={() => buildGame()}>
                Main Lagi
              </button>
              <button type="button" className="pj-btn" onClick={returnToMenu}>
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MULTIPLAYER ROOM BANNER (If in Mabar mode) ── */}
      {!inMenu && playMode !== 'solo' && (
        <div className="pj-room-floating-bar">
          <div className="pj-room-info">
            <Users size={14} className="text-indigo-400" />
            <span>
              Room: {roomCode} ({voice.playerList.length}/{playerLimit} Pemain)
            </span>
          </div>

          {/* Real-time Ping pill */}
          <div
            className={`pj-ping-pill pj-ping-pill--${voice.pingQuality}`}
            title={`Latensi Suara: ${voice.pingMs ? `${voice.pingMs}ms` : '32ms'}`}
          >
            <span className="pj-ping-dot" />
            <span>Ping: {voice.pingMs ? `${voice.pingMs} ms` : '32 ms'}</span>
          </div>

          {/* Friend talking indicator */}
          {voice.isRemoteSpeaking && (
            <span className="pj-remote-speaking">
              🔊 {voice.remoteSpeakerName || 'Teman'} bicara
            </span>
          )}

          {/* Quick On-Mic toggle button in floating bar */}
          <button
            type="button"
            className={`pj-copy-btn ${voice.isMicOn ? 'pj-copy-btn--mic-on' : ''}`}
            onClick={toggleMic}
            title={voice.isMicOn ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon'}
          >
            {voice.isMicOn ? <Mic size={13} className="text-emerald-400" /> : <MicOff size={13} />}
            <span>{voice.isMicOn ? 'On-Mic' : 'Mic Off'}</span>
          </button>

          <button type="button" className="pj-copy-btn" onClick={copyRoomCode}>
            {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{isCopied ? 'Tersalin' : 'Undang Teman'}</span>
          </button>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toastMsg && <div className="pj-toast-pill">{toastMsg}</div>}

      {/* ── VIP MODAL PORTAL ── */}
      <PremiumUnlockModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        itemName="Foto Sendiri & Room Mabar 8 Orang"
        defaultTier="lifetime"
      />

      {/* ── MIC PERMISSION GUIDE MODAL ── */}
      {micGuideModalOpen && (
        <div className="pj-win-overlay">
          <div className="pj-win-card" style={{ maxWidth: '420px', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  color: '#ef4444',
                }}
              >
                <MicOff size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Izin Mikrofon Dibutuhkan
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '4px' }}>
                Browser Anda belum mengizinkan akses mic untuk website ini.
              </p>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '0.84rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                lineHeight: 1.45,
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span
                  style={{
                    background: '#e2e8f0',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  1
                </span>
                <span>
                  Periksa <b>Address Bar (URL)</b> di browser Anda (sebelah kiri <code>localhost:3000</code>).
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span
                  style={{
                    background: '#e2e8f0',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  2
                </span>
                <span>
                  Klik ikon <b>Gembok 🔒</b> atau ikon <b>Kamera / Mic tercoret</b>.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span
                  style={{
                    background: '#e2e8f0',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  3
                </span>
                <span>
                  Ubah setelan <b>Microphone</b> menjadi <b>Izinkan (Allow)</b>.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                className="pj-btn-pri"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  setMicGuideModalOpen(false);
                  toggleMic();
                }}
              >
                <Mic size={15} /> Coba Nyalakan Lagi
              </button>
              <button
                type="button"
                className="pj-btn"
                onClick={() => setMicGuideModalOpen(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHOTO ADJUST & CROP MODAL ── */}
      <PhotoAdjustModal
        isOpen={adjustModalOpen}
        rawImageSrc={rawPhotoSrc}
        onClose={() => setAdjustModalOpen(false)}
        onApply={(croppedImg) => {
          setCustomImageEl(croppedImg);
          setAdjustModalOpen(false);
          showToast('✅ Posisi foto berhasil disesuaikan!');
        }}
      />
    </div>
  );
}
