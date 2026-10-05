/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart, Sparkles, Music, RotateCcw,
  AlertCircle, Loader2, Settings2, X, Check,
  Save, Play, ExternalLink, Image as ImageIcon,
  Smartphone, Monitor, Copy, Share2, ArrowLeft,
  Mail, Gift, Disc3, BookOpen, PartyPopper, Flower2, Flower,
  Wand2, Star, Palette, MessageSquare
} from 'lucide-react';
import { getBucketSize } from '@/data/buckets';
import { BACKGROUND_THEMES } from '@/utils/canvasUtils';
import { getTemplateConfig, GIFT_TEMPLATES } from '@/components/gift/templates';
import GiftObjectScene from '@/components/gift/GiftObjectScene';
import EffectLayer from '@/components/gift/EffectLayer';
import YouTubePlayer from '@/components/gift/receiver/YouTubePlayer';
import PhotoDisplay from '@/components/gift/receiver/PhotoDisplay';
import DigitalGiftLanding, { LANDING_TEXT_FIELDS } from '@/components/gift/receiver/DigitalGiftLanding';
import PhotoUploader, { ClientPhoto } from '@/components/gift/PhotoUploader';
import { parseYouTubeUrl } from '@/utils/youtubeParser';
import type { GiftConfig, GiftTemplateId, GiftEffectId, GiftObjectId, LandingPageTemplateId, LandingTextConfig } from '@/types/giftConfig';

interface DraftData {
  senderName: string;
  recipientName: string;
  message: string;
  designData: Record<string, unknown>;
  config: Partial<GiftConfig>;
  photos: Array<{ dataUrl: string; altText?: string }>;
}

interface Props {
  draftId: string;
}

type CustomizerTab = 'theme' | 'photos' | 'content' | 'music';

const CUSTOMIZER_TABS = [
  { id: 'theme', icon: Palette, label: 'Tema' },
  { id: 'photos', icon: ImageIcon, label: 'Foto' },
  { id: 'content', icon: MessageSquare, label: 'Pesan' },
  { id: 'music', icon: Music, label: 'Musik' },
] as const;

// ─── Preset Foto Contoh untuk Testing Cepat ────────────────────
const DEMO_PHOTOS: ClientPhoto[] = [
  {
    id: 'demo_1',
    dataUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80',
    altText: 'Buket bunga indah penuh cinta untukmu 🌸',
  },
  {
    id: 'demo_2',
    dataUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
    altText: 'Momen manis yang selalu kurindukan ✨',
  },
  {
    id: 'demo_3',
    dataUrl: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=600&q=80',
    altText: 'Senyumanmu adalah kebahagiaanku 💐',
  },
];

// ─── Preset Pesan Cepat ────────────────────────────────────────
const MESSAGE_TEMPLATES = [
  {
    label: 'Romantis',
    title: 'Untukmu yang Selalu Menghangatkan Hatiku...',
    text: 'Setiap detik bersamamu adalah anugerah terindah. Semoga buket bunga ini selalu mengingatkanmu betapa dalamnya rasa sayang dan kagumku padamu. I love you more than words can say! 🌹💖',
  },
  {
    label: 'Ulang Tahun',
    title: 'Selamat Ulang Tahun yang Paling Manis! 🎉',
    text: 'Selamat bertambah usia, sosok teristimewa! Semoga di usia yang baru ini, setiap impianmu terwujud, harimu dipenuhi kebahagiaan, dan senyuman indahmu tak pernah luntur. Happy Birthday! 🎂✨',
  },
  {
    label: 'Wisuda & Sukses',
    title: 'Selamat Atas Kelulusan & Prestasimu! 🎓',
    text: 'Bangga sekali melihat semua kerja keras dan perjuanganmu akhirnya berbuah manis hari ini! Ini awal dari petualangan hebatmu. Teruslah terbang tinggi meraih mimpi! 💐🚀',
  },
  {
    label: 'Pernikahan',
    title: 'Selamat Menempuh Hari Bahagia Bersama 🕊️',
    text: 'Semoga cinta dan kasih sayang kalian berdua semakin mekar dan harum setiap harinya seperti buket bunga ini. Bahagia selalu hingga menua bersama dalam cinta! 💍✨',
  },
];

// ─── Preset Lagu Populer (embed-safe, verified) ───────────────
// Dipilih dari video dengan embedding diizinkan (bukan 101/150)
const QUICK_SONGS = [
  { label: 'Until I Found You - Stephen Sanchez', id: 'Oxgs66gQ618', start: 40 },
  { label: 'Perfect - Ed Sheeran (Official)', id: '2Vv-BfVoq4g', start: 68 },
  { label: 'Golden Hour - JVKE', id: 'PEM0Vs8jf1w', start: 50 },
  { label: 'Canon in D - Piano (Royalty Free)', id: 'Ptk_1Dc2iPY', start: 0 },
  { label: 'All of Me - John Legend', id: '450p7goxZqg', start: 40 },
];
// Note: 'A Thousand Years' & 'Happy Birthday' diganti karena sering block embed (error 101/150)

const TEMPLATE_OPTIONS = Object.values(GIFT_TEMPLATES).map((t) => ({
  id: t.id,
  label: t.name,
  bg: t.bgStyle,
  primary: t.colors.primary,
  accent: t.colors.accent,
  desc: t.description,
  isFree: t.isFree,
}));

// Vector icon mappings for objects & effects (No raw emojis)
const OBJECT_OPTIONS: Array<{
  id: GiftObjectId;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
}> = [
  { id: 'envelope',  label: 'Amplop Surat',   desc: 'Segel lilin elegan',      icon: Mail,        color: 'text-pink-600' },
  { id: 'gift-box',  label: 'Kotak Kado',     desc: 'Pita satin mewah',        icon: Gift,        color: 'text-rose-600' },
  { id: 'music-box', label: 'Music Box',      desc: 'Kotak melodi putar',      icon: Disc3,       color: 'text-purple-600' },
  { id: 'balloon',   label: 'Balon Terbang',  desc: 'Penuh warna sukacita',    icon: PartyPopper, color: 'text-amber-500' },
  { id: 'jar',       label: 'Toples Berkilau',desc: 'Kaca kenangan abadi',     icon: Sparkles,    color: 'text-teal-600' },
  { id: 'book',      label: 'Buku Cerita',    desc: 'Lembaran kisah berharga', icon: BookOpen,    color: 'text-indigo-600' },
];

const EFFECT_OPTIONS: Array<{
  id: GiftEffectId;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
}> = [
  { id: 'petals',      label: 'Kelopak Bunga', icon: Flower2,     color: 'text-pink-500' },
  { id: 'flowers',     label: 'Buket Mekar',   icon: Flower,      color: 'text-rose-500' },
  { id: 'butterflies', label: 'Kupu-kupu',     icon: Wand2,       color: 'text-purple-500' },
  { id: 'hearts',      label: 'Hati Kasih',    icon: Heart,       color: 'text-rose-600' },
  { id: 'stars',       label: 'Bintang Emas',  icon: Star,        color: 'text-amber-500' },
  { id: 'confetti',    label: 'Konfeti Pesta', icon: PartyPopper, color: 'text-emerald-500' },
  { id: 'roses',       label: 'Mawar Merah',   icon: Flower,      color: 'text-red-600' },
];

export default function GiftPreviewPage({ draftId }: Props) {
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Viewport mode: 'mobile' (realistic iPhone simulator) vs 'desktop' (centered desktop card)
  const [viewportMode, setViewportMode] = useState<'mobile' | 'desktop'>('mobile');

  // Responsive: track lg breakpoint & real header height
  const [isLg, setIsLg] = useState(false);
  const [headerH, setHeaderH] = useState(96); // safe initial for 2-row header
  const headerRef = useRef<HTMLElement | null>(null);

  // Live editable state
  const [liveSender, setLiveSender] = useState('');
  const [liveRecipient, setLiveRecipient] = useState('');
  const [liveMessage, setLiveMessage] = useState('');
  const [liveTemplate, setLiveTemplate] = useState<GiftTemplateId>('klasik');
  const [liveEffect, setLiveEffect] = useState<GiftEffectId>('petals');
  const [liveObject, setLiveObject] = useState<GiftObjectId>('envelope');
  const [liveTitle, setLiveTitle] = useState('');
  const [liveLandingText, setLiveLandingText] = useState<LandingTextConfig>({});
  const [focusContentField, setFocusContentField] = useState<string | null>(null);
  const [focusContentCounter, setFocusContentCounter] = useState(0);

  // Photos state
  const [livePhotos, setLivePhotos] = useState<ClientPhoto[]>([]);

  // YouTube audio state
  const [liveYouTubeInput, setLiveYouTubeInput] = useState('');
  const [liveYouTubeVideoId, setLiveYouTubeVideoId] = useState<string | null>(null);
  const [liveYouTubeStart, setLiveYouTubeStart] = useState<number>(0);
  const [ytInputError, setYtInputError] = useState<string | null>(null);

  // Panel drawer & tabs state: 'theme' | 'photos' | 'content' | 'music'
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CustomizerTab>('theme');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reveal & animation state
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const melodyRef = useRef<NodeJS.Timeout | number | null>(null);
  const ytPlayerRef = useRef<HTMLIFrameElement>(null);

  // Official link creation modal state
  const [isCreatingOfficial, setIsCreatingOfficial] = useState(false);
  const [officialGiftUrl, setOfficialGiftUrl] = useState<string | null>(null);
  const [officialModalOpen, setOfficialModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Measure header height reactively
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderH(headerRef.current.getBoundingClientRect().height);
      }
      setIsLg(window.innerWidth >= 1024);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Re-measure when panelOpen changes (sub-toolbar may show/hide on resize)
  useEffect(() => {
    if (headerRef.current) {
      setHeaderH(headerRef.current.getBoundingClientRect().height);
    }
  }, [panelOpen]);

  // Fetch initial draft data
  useEffect(() => {
    fetch(`/api/gifts/preview?id=${draftId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.draft) {
          const d = data.draft as DraftData;
          setDraft(d);
          setLiveSender(d.senderName || '');
          setLiveRecipient(d.recipientName || '');
          setLiveMessage(d.message || '');
          setLiveTemplate((d.config?.templateId as GiftTemplateId) || 'klasik');
          setLiveEffect((d.config?.effectId as GiftEffectId) || 'petals');
          setLiveObject((d.config?.giftObjectId as GiftObjectId) || 'envelope');
          setLiveTitle(d.config?.title || '');
          setLiveLandingText(d.config?.landingText || {});

          // Photos
          if (d.photos && Array.isArray(d.photos) && d.photos.length > 0) {
            setLivePhotos(
              d.photos.map((p, idx) => ({
                id: `photo_${idx}_${Date.now()}`,
                dataUrl: p.dataUrl,
                altText: p.altText || '',
              }))
            );
          }

          // YouTube
          if (d.config?.youtubeVideoId) {
            setLiveYouTubeVideoId(d.config.youtubeVideoId);
            setLiveYouTubeInput(`https://www.youtube.com/watch?v=${d.config.youtubeVideoId}`);
            setLiveYouTubeStart(d.config.youtubeStartSeconds || 0);
          }
        } else {
          setError(data.message || 'Draft tidak ditemukan atau sudah kedaluwarsa.');
        }
      })
      .catch(() => setError('Gagal memuat preview. Coba lagi.'))
      .finally(() => setLoading(false));
  }, [draftId]);

  // YouTube input change handler
  const handleYouTubeInputChange = (val: string) => {
    setLiveYouTubeInput(val);
    if (!val.trim()) {
      setLiveYouTubeVideoId(null);
      setYtInputError(null);
      return;
    }
    const res = parseYouTubeUrl(val);
    if (res.videoId) {
      setLiveYouTubeVideoId(res.videoId);
      if (res.startSeconds > 0) setLiveYouTubeStart(res.startSeconds);
      setYtInputError(null);
    } else {
      setLiveYouTubeVideoId(null);
      setYtInputError(res.error || 'Link YouTube tidak valid');
    }
  };

  const handleSelectQuickSong = (song: typeof QUICK_SONGS[0]) => {
    setLiveYouTubeInput(`https://www.youtube.com/watch?v=${song.id}`);
    setLiveYouTubeVideoId(song.id);
    setLiveYouTubeStart(song.start);
    setYtInputError(null);
    triggerYTPlay();
  };

  // Procedural BGM fallback
  const startProceduralBGM = useCallback(() => {
    if (isSynthPlaying) return;
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
      let step = 0;
      const playNote = () => {
        if (!ctx || ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = notes[step % notes.length];
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.65);
        step++;
      };
      playNote();
      melodyRef.current = setInterval(playNote, 700);
      setIsSynthPlaying(true);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSynthPlaying]);

  const stopProceduralBGM = useCallback(() => {
    if (melodyRef.current) clearInterval(melodyRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setIsSynthPlaying(false);
  }, []);

  // Trigger YT play with zero delay
  const triggerYTPlay = useCallback(() => {
    const iframe = ytPlayerRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
        '*'
      );
    }
  }, []);

  const triggerYTPause = useCallback(() => {
    const iframe = ytPlayerRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      );
    }
  }, []);

  const handleOpenGift = () => {
    if (isOpen || isOpening) return;
    setIsOpening(true);

    if (liveYouTubeVideoId) {
      triggerYTPlay();
    } else {
      startProceduralBGM();
    }

    setTimeout(() => {
      setIsOpen(true);
      setShowEffect(true);
      setIsOpening(false);
    }, 700);
  };

  const handleReplay = () => {
    setIsOpen(false);
    setIsOpening(false);
    setShowEffect(false);
    stopProceduralBGM();
    triggerYTPause();
  };

  // Trigger test animation effect
  const handleTestEffect = () => {
    setShowEffect(false);
    setTimeout(() => setShowEffect(true), 50);
  };

  // Load demo photos
  const handleLoadDemoPhotos = () => {
    setLivePhotos(DEMO_PHOTOS);
    setToastMessage('✨ 3 Foto contoh berhasil dimuat!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleCustomizer = () => {
    setPanelOpen((open) => !open);
  };

  const handleSelectCustomizerTab = (tab: CustomizerTab) => {
    setActiveTab(tab);
    setPanelOpen(true);
  };

  const openTextEditor = (field?: string) => {
    setFocusContentField(field || null);
    setFocusContentCounter((counter) => counter + 1);
    handleSelectCustomizerTab('content');
  };

  const updateLandingText = (templateId: LandingPageTemplateId, key: string, value: string) => {
    setLiveLandingText((current) => ({
      ...current,
      [templateId]: { ...current[templateId], [key]: value },
    }));
  };

  useEffect(() => {
    if (activeTab !== 'content' || !panelOpen || !focusContentField) return;
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-landing-field="${CSS.escape(focusContentField)}"]`)?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, focusContentCounter, focusContentField, panelOpen]);

  // Save changes to server via PUT /api/gifts/preview
  const handleSave = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const updatedConfig: Partial<GiftConfig> = {
        ...draft.config,
        templateId: liveTemplate,
        effectId: liveEffect,
        giftObjectId: liveObject,
        title: liveTitle.trim() || undefined,
        youtubeVideoId: liveYouTubeVideoId || undefined,
        youtubeStartSeconds: liveYouTubeStart || 0,
        photoCount: livePhotos.length,
        landingText: liveLandingText,
      };

      const res = await fetch('/api/gifts/preview', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          senderName: liveSender.trim() || draft.senderName,
          recipientName: liveRecipient.trim() || draft.recipientName,
          message: liveMessage,
          config: updatedConfig,
          photos: livePhotos.map((p) => ({ dataUrl: p.dataUrl, altText: p.altText })),
        }),
      });

      const data = await res.json();
      if (data.success && data.draft) {
        setDraft(data.draft);
        setSaveSuccess(true);
        setSaveModalOpen(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        setToastMessage(data.message || 'Gagal menyimpan perubahan.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch {
      setToastMessage('Terjadi kesalahan saat menyimpan.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Direct Create Official Link from Preview
  const handleCreateOfficialLink = async () => {
    if (!draft) return;
    if (GIFT_TEMPLATES[liveTemplate]?.requiresPhoto && livePhotos.length === 0) {
      setActiveTab('photos');
      setPanelOpen(true);
      setToastMessage('Pilih minimal satu foto dari slot landing page sebelum membuat link.');
      window.setTimeout(() => setToastMessage(null), 3200);
      return;
    }
    setIsCreatingOfficial(true);
    try {
      const accessCode =
        typeof window !== 'undefined'
          ? localStorage.getItem('laysa_access_code') || ''
          : '';

      const updatedConfig: Partial<GiftConfig> = {
        ...draft.config,
        templateId: liveTemplate,
        effectId: liveEffect,
        giftObjectId: liveObject,
        title: liveTitle.trim() || undefined,
        youtubeVideoId: liveYouTubeVideoId || undefined,
        youtubeStartSeconds: liveYouTubeStart || 0,
        photoCount: livePhotos.length,
        landingText: liveLandingText,
      };

      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: liveSender.trim() || draft.senderName || 'Seseorang yang Mengagumimu',
          recipientName: liveRecipient.trim() || draft.recipientName || 'Untukmu',
          message: liveMessage || draft.message,
          musicTrack: liveYouTubeVideoId ? 'youtube' : 'romantic-piano',
          designData: draft.designData,
          accessCode,
          isVipUser: true,
          config: updatedConfig,
        }),
      });

      const data = await res.json();
      if (data.success && data.id) {
        let photoUploadFailed = false;
        if (livePhotos.length > 0) {
          const photoResponse = await fetch(`/api/gifts/${data.id}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              photos: livePhotos.map((photo, displayOrder) => ({
                dataUrl: photo.dataUrl,
                altText: photo.altText,
                displayOrder,
              })),
            }),
          });
          const photoResult = await photoResponse.json().catch(() => null);
          photoUploadFailed = !photoResponse.ok || !photoResult?.success;
        }
        const fullUrl = `${window.location.origin}/gift/${data.id}`;
        setOfficialGiftUrl(fullUrl);
        setOfficialModalOpen(true);
        if (photoUploadFailed) {
          setToastMessage('Link terbuat, tetapi foto belum tersimpan. Simpan ulang atau unggah foto lagi.');
          window.setTimeout(() => setToastMessage(null), 4000);
        }
      } else {
        alert(data.message || 'Gagal membuat link kado resmi.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsCreatingOfficial(false);
    }
  };

  const copyOfficialUrl = () => {
    if (!officialGiftUrl) return;
    navigator.clipboard.writeText(officialGiftUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50">
        <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-stone-200">
          <Loader2 className="animate-spin text-pink-600" size={28} />
        </div>
        <p className="text-stone-700 font-semibold text-sm">Menyiapkan Pratinjau Kado…</p>
      </div>
    );
  }

  // Error state
  if (error || !draft) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50 p-6">
        <AlertCircle className="text-rose-500" size={48} />
        <h1 className="text-2xl font-bold text-stone-900">Preview Tidak Tersedia</h1>
        <p className="text-stone-500 text-center max-w-sm text-sm">
          {error || 'Draft kado tidak ditemukan atau sudah kedaluwarsa (30 menit).'}
        </p>
        <Link
          href="/designer"
          className="px-6 py-3 rounded-xl font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-md text-sm mt-2 transition-all"
        >
          Kembali ke Studio
        </Link>
      </div>
    );
  }

  const templateConfig = getTemplateConfig(liveTemplate);
  const isLandingPageTemplate = ['cerita-kita', 'film-kenangan', 'album-surat'].includes(templateConfig.id);
  const giftObjectId = liveObject;
  const effectId = liveEffect;
  const giftTitle = (liveTitle || templateConfig.defaults.titleId).replaceAll('{recipientName}', liveRecipient || draft?.recipientName || 'Untukmu');
  const activeLandingTextFields = liveTemplate in LANDING_TEXT_FIELDS
    ? LANDING_TEXT_FIELDS[liveTemplate as LandingPageTemplateId]
    : [];

  interface DesignDataPayload {
    bucketSize?: string;
    selectedFlowers?: Array<{ uid?: string; imageUrl?: string }>;
    bgTheme?: string;
    final2D?: { image?: string };
  }

  const design = (draft.designData || {}) as DesignDataPayload;
  const bucketId = design.bucketSize || 'bucket-1';
  const bucketInfo = getBucketSize(bucketId);
  const flowers = design.selectedFlowers || [];
  const currentTheme = BACKGROUND_THEMES.find((t) => t.id === design.bgTheme) || BACKGROUND_THEMES[0];
  const bouquetVisual = (
    <div className="gift-bouquet-visual max-w-md w-full flex items-center justify-center">
      {design.final2D?.image ? (
        <img src={design.final2D.image} alt="Buket Bunga Spesial" className="gift-final-image max-h-[480px] w-auto object-contain rounded-2xl drop-shadow-2xl" />
      ) : (
        <div className="gift-composite-wrap relative w-72 h-80 flex items-center justify-center">
          {bucketInfo?.image && <Image src={bucketInfo.image} alt={bucketInfo.label} width={320} height={340} className="gift-bucket-img object-contain drop-shadow-xl" unoptimized />}
          <div className="gift-flowers-overlay absolute inset-0 pointer-events-none">
            {flowers.slice(0, 15).map((f, idx: number) => (
              <img key={f.uid || idx} src={f.imageUrl} alt="bunga" className="gift-overlay-flower absolute w-16 h-16 object-contain" style={{ left: `${40 + (idx % 5) * 6}%`, top: `${30 + Math.floor(idx / 5) * 8}%`, transform: `translate(-50%, -50%) rotate(${((idx * 45) % 90) - 45}deg) scale(0.85)` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const handleLandingPhotoChange = (slotIndex: number, dataUrl: string) => {
    setLivePhotos((current) => {
      const next = [...current];
      const targetIndex = Math.min(slotIndex, next.length);
      const previous = next[targetIndex];
      const photo: ClientPhoto = {
        id: previous?.id || `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        dataUrl,
        altText: previous?.altText || '',
      };
      if (targetIndex === next.length) next.push(photo);
      else next[targetIndex] = photo;
      return next;
    });
    setToastMessage('Foto berhasil dipasang di template. Klik Simpan agar perubahan tersimpan.');
    window.setTimeout(() => setToastMessage(null), 2600);
  };

  const activeCustomizerTab =
    CUSTOMIZER_TABS.find((tab) => tab.id === activeTab) ?? CUSTOMIZER_TABS[0];
  const ActiveCustomizerTabIcon = activeCustomizerTab.icon;

  return (
    <div className="gpv-shell min-h-screen bg-stone-100/95 text-stone-900 flex flex-col font-sans overflow-x-hidden selection:bg-pink-100 selection:text-pink-900">
      {/* Keyframe for reveal animation + responsive rules */}
      <style>{`
        @keyframes gpv-fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .gpv-reveal { animation: gpv-fadeUp 0.45s ease forwards; }
        .gpv-desktop-bar { display: none; }
        .gpv-mobile-bar  { display: flex; }
        @media (min-width: 1024px) {
          .gpv-desktop-bar { display: flex; }
          .gpv-mobile-bar  { display: none !important; }
        }
        /* Hide scrollbar while keeping scroll */
        .gpv-noscroll::-webkit-scrollbar { display: none; }
        .gpv-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href={`https://fonts.googleapis.com/css2?family=${templateConfig.fonts.heading}:wght@${templateConfig.fonts.headingWeight}&family=${templateConfig.fonts.body}:wght@${templateConfig.fonts.bodyWeight}&display=swap`}
        rel="stylesheet"
      />

      {/* ══════════════════════════════════════════════════════════
          1. RESPONSIVE PREVIEW NAVIGATION
          ══════════════════════════════════════════════════════════ */}
      <header ref={headerRef} className="gpv-topbar sticky top-0 z-40 bg-white border-b border-stone-200">
        <nav className="gpv-navbar" aria-label="Navigasi preview kado">
          <div className="gpv-nav-brand-wrap">
            <Link
              href="/designer"
              className="gpv-nav-back"
              title="Kembali ke Studio"
              aria-label="Kembali ke Studio"
            >
              <ArrowLeft size={15} />
              <span>Studio</span>
            </Link>
            <div className="gpv-nav-divider" aria-hidden="true" />
            <div className="gpv-nav-brand">
              <span className="gpv-nav-brand-mark" aria-hidden="true"><Flower2 size={16} /></span>
              <span className="gpv-nav-brand-copy">
                <span className="gpv-nav-brand-name">Laysa Atelier</span>
                <span className="gpv-nav-brand-context">Preview · {templateConfig.name}</span>
              </span>
            </div>
          </div>

          <div className="gpv-nav-controls">
            <div
              className="gpv-stage-switch"
              role="group"
              aria-label="Tahap kado"
            >
              <button
                type="button"
                onClick={handleReplay}
                title="Tampilan sebelum dibuka"
                className={`gpv-stage-button ${
                  !isOpen
                    ? 'is-active'
                    : ''
                }`}
              >
                <Mail size={14} />
                <span>Sebelum</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsOpen(true); setShowEffect(true); if (liveYouTubeVideoId) triggerYTPlay(); }}
                title="Tampilan setelah dibuka"
                className={`gpv-stage-button ${
                  isOpen
                    ? 'is-active'
                    : ''
                }`}
              >
                <Flower2 size={14} />
                <span>Setelah</span>
              </button>
            </div>

            <div
              className="gpv-device-switch"
              role="group"
              aria-label="Mode tampilan"
            >
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                title="Simulasi layar ponsel"
                className={`gpv-device-button ${
                  viewportMode === 'mobile'
                    ? 'is-active'
                    : ''
                }`}
              >
                <Smartphone size={14} />
                <span className="sr-only">Ponsel</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                title="Simulasi layar desktop"
                className={`gpv-device-button ${
                  viewportMode === 'desktop'
                    ? 'is-active'
                    : ''
                }`}
              >
                <Monitor size={14} />
                <span className="sr-only">Desktop</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleReplay}
              className="gpv-nav-replay"
              title="Ulang animasi dari awal"
              aria-label="Ulang animasi dari awal"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          <div className="gpv-nav-actions">
            <button
              type="button"
              onClick={handleToggleCustomizer}
              className={`gpv-nav-edit ${
                panelOpen
                  ? 'is-active'
                  : ''
              }`}
              aria-expanded={panelOpen}
              aria-label={panelOpen ? `Tutup editor kado, tab ${activeCustomizerTab.label}` : 'Buka Kustom Kado'}
              title={panelOpen ? `Tutup editor — ${activeCustomizerTab.label}` : 'Buka Kustom Kado'}
            >
              <span className="gpv-nav-edit-action-icon" aria-hidden="true">
                {panelOpen ? <X size={16} /> : <Settings2 size={15} />}
              </span>
              <span className="gpv-nav-edit-copy">
                {panelOpen ? 'Tutup editor' : 'Kustom Kado'}
              </span>
              {panelOpen && (
                <span className="gpv-nav-edit-active-tab" aria-label={`Tab aktif: ${activeCustomizerTab.label}`}>
                  <ActiveCustomizerTabIcon size={13} aria-hidden="true" />
                  <span>{activeCustomizerTab.label}</span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleCreateOfficialLink}
              disabled={isCreatingOfficial}
              className="gpv-nav-share"
              title="Buat link kado resmi untuk dikirim ke penerima"
            >
              {isCreatingOfficial ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              <span>Bagikan</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-3 flex items-center gap-2 border border-stone-700 select-none">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Effect Layer */}
      {showEffect && (
        <EffectLayer effectId={effectId} isActive={showEffect} onComplete={() => setShowEffect(false)} />
      )}

      {/* YouTube Player (hidden audio) */}
      {liveYouTubeVideoId && (
        <YouTubePlayer
          ref={ytPlayerRef}
          videoId={liveYouTubeVideoId}
          startSeconds={liveYouTubeStart}
          isOpen={isOpen}
          startImmediate={true}
          showCardAlways={true}
          onFallbackAudio={startProceduralBGM}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          2. MAIN WORKSPACE AREA — fullscreen persis seperti /gift/[id]
          ══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Canvas Area — fullscreen gift experience */}
        <main
          className="flex-1 overflow-y-auto relative"
          style={{
            marginRight: 0,
            transition: 'margin-right 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Full-screen template background — same as GiftReceiverPage root */}
          <div
            className={`min-h-full relative ${templateConfig.rootClass} ${viewportMode === 'mobile' ? 'gpv-mobile-preview' : ''}`}
            style={{
              background: templateConfig.bgStyle || currentTheme?.previewColor || 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #fce7f3 100%)',
              /* Keep the phone preview genuinely phone-sized at every viewport width. */
              ...(viewportMode === 'mobile' ? {
                maxWidth: 430,
                margin: '0 auto',
                ...(isLg ? { boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 20px 60px -8px rgba(0,0,0,0.25)' } : {}),
              } : {}),
            }}
          >
            {isLandingPageTemplate ? (
              <DigitalGiftLanding
                templateId={templateConfig.id as 'cerita-kita' | 'film-kenangan' | 'album-surat'}
                title={giftTitle}
                senderName={liveSender || draft.senderName || 'Seseorang yang Mengagumimu'}
                recipientName={liveRecipient || draft.recipientName || 'Untukmu'}
                message={liveMessage || draft.message}
                landingText={liveLandingText}
                photos={livePhotos.map((photo) => ({ id: photo.id, url: photo.dataUrl, altText: photo.altText }))}
                bouquet={bouquetVisual}
                isOpen={isOpen}
                isOpening={isOpening}
                editablePhotos
                onOpenGift={handleOpenGift}
                onPhotoChange={handleLandingPhotoChange}
                onTextEdit={openTextEditor}
              />
            ) : !isOpen ? (
              /* ── STATE 1: SEBELUM DIBUKA (sama persis dengan GiftReceiverPage) ── */
              <div className="gift-unopened-container min-h-screen w-full flex items-center justify-center p-4">
                <div className="gift-envelope-box max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-200/80 text-center flex flex-col items-center">
                  {/* Top Badge */}
                  <div className="gift-envelope-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-100 mb-6">
                    <Sparkles size={14} />
                    <span>KEJUTAN BUKET DIGITAL</span>
                  </div>

                  {/* Gift Object */}
                  <div
                    className="my-2 transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={handleOpenGift}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenGift(); }}
                  >
                    <GiftObjectScene giftObjectId={giftObjectId} isOpening={isOpening} onClick={handleOpenGift} />
                  </div>

                  {/* Title */}
                  <p className="mt-4 text-sm font-medium text-pink-600 italic">
                    {giftTitle}
                  </p>

                  {/* Addresses — same markup as GiftReceiverPage */}
                  <div className="gift-envelope-addresses w-full my-6 p-4 rounded-2xl bg-stone-50/70 border border-stone-100">
                    <div className="gift-addr-to mb-3">
                      <span className="gift-addr-label text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-0.5">
                        Untuk yang teristimewa:
                      </span>
                      <h1
                        className="gift-addr-name text-2xl font-bold text-stone-900"
                        style={{ fontFamily: templateConfig.fonts.heading.replace('+', ' ') }}
                      >
                        {liveRecipient || draft.recipientName || 'Untukmu'}
                      </h1>
                    </div>

                    <div className="gift-addr-divider h-px bg-stone-200/70 w-24 mx-auto my-2" />

                    <div className="gift-addr-from">
                      <span className="gift-addr-label text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-0.5">
                        Rangkaian tulus dari:
                      </span>
                      <p className="gift-sender-name text-base font-semibold text-pink-700">
                        {liveSender || draft.senderName || 'Seseorang yang Mengagumimu'}
                      </p>
                    </div>
                  </div>

                  {/* Photos teaser */}
                  {livePhotos.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200/80 mb-4">
                      <ImageIcon size={13} className="text-purple-600" />
                      <span>Disertai {livePhotos.length} Foto Kenangan Manis</span>
                    </div>
                  )}

                  {/* Open Button — sama persis dengan GiftReceiverPage */}
                  <button
                    type="button"
                    className="gift-btn-open-seal w-full py-3.5 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                    onClick={handleOpenGift}
                    disabled={isOpening}
                  >
                    <Sparkles size={18} />
                    <span>
                      {isOpening ? 'Membuka kejutan...' : 'Buka Kado & Lihat Buketmu'}
                    </span>
                  </button>

                  <span className="gift-open-hint text-[11px] text-stone-400 mt-2">
                    Sentuh untuk memutar lagu &amp; melihat buket
                  </span>
                </div>
              </div>
            ) : (
              /* ── STATE 2: SETELAH DIBUKA (sama persis dengan GiftReceiverPage) ── */
              <div className="gift-opened-wrapper max-w-3xl mx-auto px-4 py-12 animate-in fade-in duration-700">
                {/* Header Greeting */}
                <div className="gift-revealed-header text-center mb-8">
                  <span className="gift-greeting-chip inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/80 backdrop-blur-xs text-pink-700 border border-pink-200 shadow-sm mb-3">
                    <Heart size={14} className="text-pink-500 fill-pink-500" />
                    <span>Khusus Untuk {liveRecipient || draft.recipientName}</span>
                  </span>
                  <h2
                    className="gift-revealed-title text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight"
                    style={{ fontFamily: templateConfig.fonts.heading.replace('+', ' ') }}
                  >
                    Buket Bunga Cantik Khusus Untukmu
                  </h2>
                  <p className="gift-revealed-sub text-xs sm:text-sm text-stone-600 mt-2">
                    Dirangkai dengan tulus oleh <strong>{liveSender || draft.senderName}</strong> di Studio Buket Laysa
                  </p>
                </div>

                {/* Bouquet Canvas Showcase Frame */}
                <div className="gift-canvas-frame my-8 bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-white flex flex-col items-center justify-center">
                  <div className="gift-bouquet-visual max-w-md w-full flex items-center justify-center">
                    {design.final2D?.image ? (
                      <img
                        src={design.final2D.image}
                        alt="Buket Bunga Spesial"
                        className="gift-final-image max-h-[480px] w-auto object-contain rounded-2xl drop-shadow-2xl"
                      />
                    ) : (
                      <div className="gift-composite-wrap relative w-72 h-80 flex items-center justify-center">
                        {bucketInfo?.image && (
                          <Image
                            src={bucketInfo.image}
                            alt={bucketInfo.label}
                            width={320}
                            height={340}
                            className="gift-bucket-img object-contain drop-shadow-xl"
                            unoptimized
                          />
                        )}
                        <div className="gift-flowers-overlay absolute inset-0 pointer-events-none">
                          {flowers.slice(0, 15).map((f, idx: number) => (
                            <img
                              key={f.uid || idx}
                              src={f.imageUrl}
                              alt="bunga"
                              className="gift-overlay-flower absolute w-16 h-16 object-contain"
                              style={{
                                left: `${40 + (idx % 5) * 6}%`,
                                top: `${30 + Math.floor(idx / 5) * 8}%`,
                                transform: `translate(-50%, -50%) rotate(${((idx * 45) % 90) - 45}deg) scale(0.85)`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Letter Card Message */}
                <div className="gift-letter-card bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-100 my-8">
                  <div className="gift-letter-header flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                    <span className="gift-letter-label text-xs font-semibold uppercase tracking-wider text-pink-700">
                      Surat &amp; Pesan Spesial
                    </span>
                    <span className="gift-letter-date text-xs text-stone-400">
                      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="gift-letter-body">
                    <p
                      className="gift-letter-salutation text-lg font-bold text-stone-900 mb-3"
                      style={{ fontFamily: templateConfig.fonts.heading.replace('+', ' ') }}
                    >
                      Dear {liveRecipient || draft.recipientName},
                    </p>
                    <div className="gift-letter-content text-sm sm:text-base leading-relaxed text-stone-700 whitespace-pre-line mb-6">
                      {liveMessage || draft.message || 'Semoga buket bunga ini selalu menghadirkan senyuman dan kebahagiaan di setiap langkahmu! 💐✨'}
                    </div>
                    <p className="gift-letter-signature text-xs sm:text-sm text-stone-600">
                      Rangkaian tulus dari,
                      <br />
                      <strong className="text-stone-900 text-base">{liveSender || draft.senderName}</strong>
                    </p>
                  </div>
                </div>

                {/* Photos Showcase */}
                {livePhotos.length > 0 ? (
                  <PhotoDisplay
                    photos={livePhotos.map((p) => ({
                      id: p.id,
                      url: p.dataUrl,
                      altText: p.altText,
                    }))}
                    photoStyle={templateConfig.photoStyle}
                  />
                ) : null}

                {/* Footer Actions */}
                <div className="gift-footer-actions flex flex-wrap gap-3 justify-center items-center mt-12 mb-6">
                  <Link
                    href="/designer"
                    className="btn btn-primary px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-pink-500/20 inline-flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    <span>Rangkai Buket Hadiahmu Sendiri</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleReplay}
                    className="btn btn-secondary px-5 py-3 rounded-2xl font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    <span>Buka Ulang Hadiah</span>
                  </button>
                  <Link href="/" className="btn btn-secondary px-5 py-3 rounded-2xl font-semibold">
                    <span>Kunjungi Florist</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>


        {/* ══════════════════════════════════════════════════════════
            3. CUSTOMIZER DRAWER — single instance, slide-over
            ══════════════════════════════════════════════════════════ */}
        {/* Backdrop — only on mobile/tablet when panel is open */}
        {panelOpen && !isLg && (
          <div
            onClick={() => setPanelOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
          />
        )}

        <aside
          className="gpv-customizer"
          style={{
            position: 'fixed',
            top: isLg ? headerH : 'auto',
            bottom: 0,
            right: 0,
            width: '100%',
            maxWidth: isLg ? '420px' : '100%',
            height: isLg ? undefined : '64vh',
            zIndex: 50,
            backgroundColor: '#ffffff',
            borderLeft: isLg ? '1px solid #e7e5e4' : 'none',
            borderTop: isLg ? 'none' : '1px solid #f1e5e7',
            borderRadius: isLg ? 0 : '24px 24px 0 0',
            boxShadow: isLg ? '-4px 0 24px -4px rgba(0,0,0,0.12)' : '0 -12px 36px rgba(76, 42, 49, 0.16)',
            display: 'flex',
            flexDirection: 'column',
            transform: panelOpen ? 'translate(0)' : (isLg ? 'translateX(100%)' : 'translateY(100%)'),
            transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            visibility: panelOpen ? 'visible' : 'hidden',
            willChange: 'transform',
          }}
          aria-label="Panel Kustomisasi Kado"
        >
          {/* Drag handle — mobile only */}
          <div className="lg:hidden w-10 h-1 bg-stone-200 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

          {/* ── Sticky Drawer Header ── */}
          <div className="gpv-panel-header px-5 py-4 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
            <div className="gpv-panel-title-group">
              <span className="gpv-panel-title">Kustomisasi Kado</span>
              <span className="gpv-panel-subtitle">Perubahan muncul langsung di preview</span>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup Panel"
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Sticky Tab Bar ── */}
          <div className="gpv-panel-tabs flex border-b border-stone-100 shrink-0 bg-white" role="tablist">
            {CUSTOMIZER_TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                id={`customizer-tab-${id}`}
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`customizer-panel-${id}`}
                data-active={activeTab === id}
                onClick={() => handleSelectCustomizerTab(id)}
                className="gpv-panel-tab flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all cursor-pointer border-b-2"
              >
                <Icon size={13} />
                <span>{id === 'photos' && livePhotos.length ? `${label} (${livePhotos.length})` : label}</span>
              </button>
            ))}
          </div>

          {/* ── Scrollable body ── */}
          <div
            id={`customizer-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`customizer-tab-${activeTab}`}
            className="gpv-panel-body flex-1 overflow-y-auto overflow-x-hidden"
            style={{ padding: '24px 20px 0' }}
          >
            {activeTab === 'theme' && (
              <div className="gpv-theme-editor space-y-5 pb-8">
                <section className="gpv-theme-section">
                  <p className="gpv-theme-section-title text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3">Pilihan Tema</p>
                  <div className="gpv-theme-grid grid grid-cols-2 gap-2">
                    {TEMPLATE_OPTIONS.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setLiveTemplate(tmpl.id as GiftTemplateId)}
                        className={`gpv-theme-card relative min-w-0 text-left rounded-xl border transition-all cursor-pointer overflow-hidden ${
                          liveTemplate === tmpl.id
                            ? 'border-pink-500 ring-2 ring-pink-100'
                            : 'border-stone-200 hover:border-pink-200 bg-white'
                        }`}
                      >
                        <div className="gpv-theme-swatch h-10 w-full flex items-center justify-center gap-2" style={{ background: tmpl.bg }}>
                          <span className="w-3 h-3 rounded-full border-2 border-white/80 shadow" style={{ background: tmpl.primary }} />
                          <span className="w-3 h-3 rounded-full border-2 border-white/80 shadow" style={{ background: tmpl.accent }} />
                        </div>
                        <div className="gpv-theme-copy px-2.5 py-2">
                          <p className="gpv-theme-title text-[11px] font-semibold text-stone-800 truncate">{tmpl.label}</p>
                        </div>
                        {liveTemplate === tmpl.id && (
                          <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-pink-600 flex items-center justify-center shadow">
                            <Check size={10} className="text-white" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="gpv-theme-section">
                  <p className="gpv-theme-section-title text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3">Objek Pembuka Kado</p>
                  <div className="gpv-object-grid grid grid-cols-3 gap-1.5">
                    {OBJECT_OPTIONS.map((obj) => {
                      const Icon = obj.icon;
                      const sel = liveObject === obj.id;
                      return (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => setLiveObject(obj.id)}
                          className={`relative py-3 px-1 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer select-none ${
                            sel ? 'border-pink-400 bg-pink-50 ring-2 ring-pink-100' : 'border-stone-200 hover:border-pink-200 bg-white'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            sel ? 'bg-pink-100 text-pink-700' : 'bg-stone-100 text-stone-500'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <span className="text-[10px] font-medium text-stone-700 leading-tight line-clamp-2 w-full">{obj.label}</span>
                          {sel && (
                            <span className="absolute top-1 right-1 w-[14px] h-[14px] rounded-full bg-pink-600 flex items-center justify-center">
                              <Check size={8} className="text-white" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="gpv-theme-section">
                  <div className="flex items-center justify-between">
                    <p className="gpv-theme-section-title text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Efek Partikel</p>
                    <button
                      type="button"
                      onClick={handleTestEffect}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-stone-100 hover:bg-pink-50 text-stone-600 hover:text-pink-700 text-[10px] font-medium transition-colors cursor-pointer border border-stone-200 hover:border-pink-200 shrink-0"
                    >
                      <Sparkles size={10} />
                      Tes Efek
                    </button>
                  </div>
                  <div className="gpv-effect-grid grid grid-cols-4 gap-1.5">
                    {EFFECT_OPTIONS.map((eff) => {
                      const Icon = eff.icon;
                      const sel = liveEffect === eff.id;
                      return (
                        <button
                          key={eff.id}
                          type="button"
                          onClick={() => { setLiveEffect(eff.id); handleTestEffect(); }}
                          className={`relative py-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer select-none ${
                            sel ? 'border-rose-400 bg-rose-50 ring-2 ring-rose-100' : 'border-stone-200 hover:border-rose-200 bg-white'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            sel ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-500'
                          }`}>
                            <Icon size={14} />
                          </div>
                          <span className="text-[9px] font-medium text-stone-600 leading-tight line-clamp-2 w-full text-center px-0.5">{eff.label}</span>
                          {sel && (
                            <span className="absolute top-0.5 right-0.5 w-[12px] h-[12px] rounded-full bg-rose-500 flex items-center justify-center">
                              <Check size={7} className="text-white" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* ─── TAB 2: FOTO ─── */}
            {activeTab === 'photos' && (
              <div className="space-y-3 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Galeri Foto</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Maks. 6 foto dengan keterangan</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadDemoPhotos}
                    className="flex items-center gap-1 h-8 px-3 rounded-lg bg-stone-100 hover:bg-pink-50 text-stone-600 hover:text-pink-700 border border-stone-200 hover:border-pink-200 text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    <Sparkles size={10} />
                    Muat Demo
                  </button>
                </div>
                <PhotoUploader photos={livePhotos} onChange={setLivePhotos} maxPhotos={6} />
              </div>
            )}

            {/* ─── TAB 3: PESAN ─── */}
            {activeTab === 'content' && (
              <div className="space-y-4 pb-4">
                <div>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2.5">Ucapan Cepat</p>
                  <div className="flex flex-wrap gap-2">
                    {MESSAGE_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.label}
                        type="button"
                        onClick={() => {
                          setLiveTitle(tmpl.title);
                          setLiveMessage(tmpl.text);
                          setToastMessage(`✏️ Teks "${tmpl.label}" diterapkan`);
                          setTimeout(() => setToastMessage(null), 2000);
                        }}
                        className="flex items-center h-[44px] px-4 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-medium hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all cursor-pointer select-none"
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block mb-1.5">Nama Penerima</label>
                    <input data-landing-field="recipientName" type="text" value={liveRecipient} onChange={(e) => setLiveRecipient(e.target.value)} placeholder="Misal: Clarissa Putri" className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-stone-300" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block mb-1.5">Nama Pengirim</label>
                    <input data-landing-field="senderName" type="text" value={liveSender} onChange={(e) => setLiveSender(e.target.value)} placeholder="Misal: Andi Pratama" className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-stone-300" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block mb-1.5">Judul Kado <span className="text-stone-300 normal-case font-normal">(opsional)</span></label>
                    <input data-landing-field="title" type="text" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} placeholder={giftTitle} className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-stone-300" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Pesan Ucapan</label>
                      <span className="text-[9px] text-stone-300">{liveMessage.length} kar.</span>
                    </div>
                    <textarea data-landing-field="message" rows={5} value={liveMessage} onChange={(e) => setLiveMessage(e.target.value)} placeholder="Tuliskan ucapan tulus cintamu di sini..." className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm leading-relaxed focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all resize-none placeholder:text-stone-300" />
                  </div>
                </div>
                {activeLandingTextFields.length > 0 && (
                  <section className="rounded-2xl border border-pink-100 bg-gradient-to-br from-white to-pink-50/70 p-4 space-y-3" aria-label={`Teks tambahan template ${templateConfig.name}`}>
                    <div>
                      <h3 className="text-xs font-bold text-stone-800">Teks di dalam template</h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-stone-500">Setiap judul, sapaan, dan paragraf dapat diubah. Klik teks di preview untuk langsung menuju kolomnya.</p>
                    </div>
                    <div className="space-y-3">
                      {activeLandingTextFields.map((field) => {
                        const resolvedDefault = field.defaultValue
                          .replaceAll('{senderName}', liveSender || draft?.senderName || '')
                          .replaceAll('{recipientName}', liveRecipient || draft?.recipientName || '');
                        const value = liveLandingText[liveTemplate as LandingPageTemplateId]?.[field.key] ?? resolvedDefault;
                        const inputClass = 'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm leading-relaxed transition-all placeholder:text-stone-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100';
                        return (
                          <div key={field.key}>
                            <label htmlFor={`landing-text-${field.key}`} className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-stone-500">{field.label}</label>
                            {field.defaultValue.length > 70 ? (
                              <textarea id={`landing-text-${field.key}`} data-landing-field={field.key} rows={3} maxLength={500} value={value} onChange={(event) => updateLandingText(liveTemplate as LandingPageTemplateId, field.key, event.target.value)} className={`${inputClass} resize-y`} />
                            ) : (
                              <input id={`landing-text-${field.key}`} data-landing-field={field.key} type="text" maxLength={500} value={value} onChange={(event) => updateLandingText(liveTemplate as LandingPageTemplateId, field.key, event.target.value)} className={inputClass} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* ─── TAB 4: MUSIK ─── */}
            {activeTab === 'music' && (
              <div className="space-y-4 pb-4">
                <div>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Link YouTube</p>
                  <input
                    type="text"
                    value={liveYouTubeInput}
                    onChange={(e) => handleYouTubeInputChange(e.target.value)}
                    placeholder="youtube.com/watch?v=... atau youtu.be/..."
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-stone-300"
                  />
                  {ytInputError && (
                    <div className="mt-2 flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <AlertCircle size={13} className="text-rose-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-rose-600 leading-snug">{ytInputError}</p>
                    </div>
                  )}
                  {liveYouTubeVideoId && !ytInputError && (
                    <div className="mt-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium min-w-0">
                        <Check size={12} className="text-emerald-500 shrink-0" />
                        <span className="truncate">ID: {liveYouTubeVideoId}</span>
                      </div>
                      <button type="button" onClick={triggerYTPlay} className="flex items-center gap-1 h-7 px-2.5 bg-emerald-600 text-white rounded-lg text-[11px] font-medium hover:bg-emerald-700 transition-colors cursor-pointer shrink-0">
                        <Play size={10} />
                        Tes
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Mulai dari detik ke-</p>
                  <div className="flex items-center gap-2">
                    <input type="number" min={0} value={liveYouTubeStart} onChange={(e) => setLiveYouTubeStart(Math.max(0, parseInt(e.target.value) || 0))} className="w-20 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all" />
                    <span className="text-xs text-stone-400">detik</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Lagu Populer</p>
                  <div className="space-y-1.5">
                    {QUICK_SONGS.map((song) => {
                      const isActive = liveYouTubeVideoId === song.id;
                      return (
                        <button
                          key={song.id}
                          type="button"
                          onClick={() => handleSelectQuickSong(song)}
                          className={`w-full min-h-[44px] text-left px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer select-none ${
                            isActive
                              ? 'border-pink-400 bg-pink-50 text-pink-800'
                              : 'border-stone-200 hover:border-pink-200 bg-white text-stone-700 hover:bg-pink-50/40'
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <Music size={12} className={`shrink-0 ${isActive ? 'text-pink-500' : 'text-stone-400'}`} />
                            <span className="truncate font-medium">{song.label}</span>
                          </span>
                          {isActive ? (
                            <Check size={14} className="text-pink-500 shrink-0" />
                          ) : (
                            <span className="text-[10px] font-bold text-pink-600 shrink-0 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200 whitespace-nowrap">Pilih</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <p className="text-[10px] text-stone-500 leading-relaxed">💡 <strong>Tip:</strong> Jika lagu tidak berputar, klik <strong>Tes</strong> atau gunakan link YouTube sendiri. Beberapa video memblokir embed — pilih dari daftar untuk hasil terbaik.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Sticky Footer ── */}
          <div className="gpv-panel-footer px-5 py-4 border-t border-stone-100 bg-white shrink-0">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full h-10 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 ${
                saveSuccess ? 'bg-emerald-500' : ''
              }`}
              style={!saveSuccess ? { backgroundColor: '#be185d' } : undefined}
            >
              {isSaving ? (
                <><Loader2 size={14} className="animate-spin" /><span>Menyimpan...</span></>
              ) : saveSuccess ? (
                <><Check size={14} /><span>Tersimpan!</span></>
              ) : (
                <><Save size={14} /><span>Simpan Perubahan</span></>
              )}
            </button>
          </div>
        </aside>

      </div>

      {saveModalOpen && (
        <div
          className="gpv-save-modal-backdrop"
          role="presentation"
          onClick={() => setSaveModalOpen(false)}
        >
          <section
            className="gpv-save-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gpv-save-modal-glow" aria-hidden="true" />
            <div className="gpv-save-modal-icon" aria-hidden="true">
              <Check size={28} strokeWidth={3} />
            </div>
            <p className="gpv-save-modal-eyebrow">KADO DIPERBARUI</p>
            <h2 id="save-modal-title">Perubahanmu tersimpan</h2>
            <p className="gpv-save-modal-copy">
              Preview dan kado yang akan kamu bagikan sekarang memakai pengaturan terbaru.
            </p>
            <div className="gpv-save-modal-actions">
              <button type="button" className="gpv-save-modal-secondary" onClick={() => setSaveModalOpen(false)}>
                Lanjut Edit
              </button>
              <button type="button" className="gpv-save-modal-primary" onClick={() => { setSaveModalOpen(false); setPanelOpen(false); }}>
                <Sparkles size={16} />
                Lihat Preview
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          4. OFFICIAL GIFT LINK MODAL
          ══════════════════════════════════════════════════════════ */}
      {officialModalOpen && officialGiftUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100 text-center animate-in zoom-in-95">
            <div
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #9333ea 100%)' }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-pink-500/20"
            >
              <Sparkles size={24} />
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-1">Link Kado Resmi Berhasil Dibuat!</h3>
            <p className="text-xs text-stone-600 mb-5 leading-relaxed">
              Kado digital ini sudah siap dikirimkan kepada <strong>{liveRecipient || 'penerima tercinta'}</strong>.
            </p>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 mb-4 flex items-center justify-between gap-2">
              <input
                type="text"
                readOnly
                value={officialGiftUrl}
                className="bg-transparent text-xs text-stone-800 font-mono flex-1 outline-none truncate"
              />
              <button
                type="button"
                onClick={copyOfficialUrl}
                className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {isCopied ? <Check size={13} /> : <Copy size={13} />}
                <span>{isCopied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Hai ${liveRecipient || ''}! Ada kejutan buket bunga spesial untukmu: ${officialGiftUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Share2 size={15} />
                <span>Kirim via WhatsApp</span>
              </a>

              <a
                href={officialGiftUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink size={13} />
                <span>Buka Link Kado Sekarang</span>
              </a>

              <button
                type="button"
                onClick={() => setOfficialModalOpen(false)}
                className="mt-1 text-xs font-semibold text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                Tutup Jendela Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
