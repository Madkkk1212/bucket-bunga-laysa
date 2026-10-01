'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import './vault.css';
import {
  LayoutDashboard,
  KeyRound,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  RotateCcw,
  Sparkles,
  Users,
  Search,
  ExternalLink,
  Tag,
  DollarSign,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Database,
  Terminal,
  LogOut,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  MessageCircle,
  Gift,
  Music,
  Heart,
  Calendar,
} from 'lucide-react';

interface AccessCodeItem {
  id: string;
  code: string;
  is_active: boolean;
  max_uses: number;
  max_devices: number;
  used_count: number;
  device_count?: number;
  used_by_name?: string | null;
  notes?: string | null;
  created_at: string;
  claimed_at?: string | null;
  tier?: 'daily' | 'weekly' | 'lifetime';
  duration_days?: number;
  expires_at?: string | null;
  has_garden_access?: boolean;
}

interface DeviceItem {
  id: string;
  ip_address: string;
  user_name?: string | null;
  user_agent?: string | null;
  first_seen_at: string;
  last_seen_at: string;
  is_owner?: boolean;
  device_slot?: number;
}

function parseDeviceInfo(ua?: string | null): { browser: string; os: string; full: string } {
  if (!ua) return { browser: 'Browser', os: 'Perangkat', full: 'Perangkat Tidak Diketahui' };

  let browser = 'Browser Web';
  if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Google Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  let os = 'Komputer / Laptop';
  if (/iPhone/i.test(ua)) os = 'iPhone (iOS)';
  else if (/iPad/i.test(ua)) os = 'iPad (iPadOS)';
  else if (/Android/i.test(ua)) os = 'HP Android';
  else if (/Windows/i.test(ua)) os = 'Windows PC/Laptop';
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'Mac / MacBook';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { browser, os, full: `${browser} (${os})` };
}

interface TierPricingItem {
  key: 'daily' | 'weekly' | 'lifetime';
  name: string;
  durationLabel: string;
  durationDays: number;
  basePrice: number;
  promoPrice: number;
  isPromoActive: boolean;
  isActive: boolean;
  badge?: string;
  gardenAccess: boolean;
  features: string[];
}

interface MultiTierPricingState {
  daily: TierPricingItem;
  weekly: TierPricingItem;
  lifetime: TierPricingItem;
}

interface PricingState {
  basePrice: number;
  isPromoActive: boolean;
  promoPrice: number;
  promoLabel: string;
}

export default function LaysaCleanPortalPage() {
  // ── Auth States ──
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // ── Dashboard States ──
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tokens' | 'gifts' | 'pricing' | 'diagnostics'>('dashboard');
  const [codes, setCodes] = useState<AccessCodeItem[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'used' | 'inactive'>('all');

  // Form Create Code
  const [newCode, setNewCode] = useState<string>('');
  const [newTier, setNewTier] = useState<'daily' | 'weekly' | 'lifetime'>('lifetime');
  const [newMaxUses, setNewMaxUses] = useState<number>(1);
  const [newMaxDevices, setNewMaxDevices] = useState<number>(5);
  const [newNotes, setNewNotes] = useState<string>('');
  const [isCreatingCode, setIsCreatingCode] = useState<boolean>(false);
  const [formMsg, setFormMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Devices Drawer
  const [selectedCodeForDevices, setSelectedCodeForDevices] = useState<AccessCodeItem | null>(null);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState<boolean>(false);
  const [editingDeviceLimitId, setEditingDeviceLimitId] = useState<string | null>(null);
  const [editDeviceLimitVal, setEditDeviceLimitVal] = useState<number>(5);

  // Pricing State
  const [selectedPricingTier, setSelectedPricingTier] = useState<'daily' | 'weekly' | 'lifetime'>('lifetime');
  const [multiTierPricing, setMultiTierPricing] = useState<MultiTierPricingState>({
    daily: {
      key: 'daily',
      name: 'Paket Harian (24 Jam)',
      durationLabel: '24 Jam',
      durationDays: 1,
      basePrice: 10000,
      promoPrice: 5000,
      isPromoActive: true,
      isActive: true,
      badge: 'Hemat 50%',
      gardenAccess: false,
      features: [
        'Buka seluruh 100+ koleksi bunga & pembungkus buket',
        'Masa aktif 24 jam bebas rangkai & unduh sepuasnya',
        'Bisa terhubung hingga 5 perangkat bersamaan',
        'Unduh hasil buket jernih beresolusi HD',
        'Akses instan tanpa ribet daftar akun',
      ],
    },
    weekly: {
      key: 'weekly',
      name: 'Paket Mingguan (7 Hari)',
      durationLabel: '7 Hari',
      durationDays: 7,
      basePrice: 25000,
      promoPrice: 12000,
      isPromoActive: true,
      isActive: true,
      badge: 'Hemat 52%',
      gardenAccess: false,
      features: [
        'Buka seluruh 100+ koleksi bunga & pembungkus buket',
        'Masa aktif 7 hari penuh (Ideal untuk kado, wisuda & ultah)',
        'Bebas edit & simpan berbagai rancangan buket kapan saja',
        'Bisa terhubung hingga 5 perangkat bersamaan',
        'Jauh lebih hemat dibanding beli paket harian berulang kali',
      ],
    },
    lifetime: {
      key: 'lifetime',
      name: 'Paket Selamanya (VIP Sultan)',
      durationLabel: 'Selamanya',
      durationDays: 0,
      basePrice: 85000,
      promoPrice: 25000,
      isPromoActive: true,
      isActive: true,
      badge: '👑 Terpopuler & Lengkap',
      gardenAccess: true,
      features: [
        'Akses VIP permanen SELAMANYA (sekali bayar tanpa langganan)',
        '🌸 EKSKLUSIF: Buka Fitur Kebun Bunga Harian Streak 🔥 (Solo / Pasangan)',
        'Ekspor Kualitas Tertinggi Ultra HD 4K & Stiker WA (Transparan)',
        'Kartu Ucapan Kaligrafi Eksklusif & Ornamen Pita Mewah',
        'Bisa terhubung hingga 5 perangkat bersama keluarga / pasangan',
        'Akses gratis ke seluruh varian bunga & buket baru di masa depan',
      ],
    },
  });
  const [pricing, setPricing] = useState<PricingState>({
    basePrice: 85000,
    isPromoActive: true,
    promoPrice: 25000,
    promoLabel: 'Promo Terbatas',
  });
  const [isSavingPricing, setIsSavingPricing] = useState<boolean>(false);
  const [pricingMsg, setPricingMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Diagnostics State
  const [diagData, setDiagData] = useState<any>(null);
  const [isLoadingDiag, setIsLoadingDiag] = useState<boolean>(false);

  // Digital Gifts & VIP Drafts Database State
  const [giftsList, setGiftsList] = useState<any[]>([]);
  const [isLoadingGifts, setIsLoadingGifts] = useState<boolean>(false);
  const [totalGiftsCount, setTotalGiftsCount] = useState<number>(0);
  const [totalGiftsViews, setTotalGiftsViews] = useState<number>(0);
  const [vipDraftsCount, setVipDraftsCount] = useState<number>(0);
  const [giftsSearchQuery, setGiftsSearchQuery] = useState<string>('');
  const [deletingGiftId, setDeletingGiftId] = useState<string | null>(null);

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedBroadcastKey, setCopiedBroadcastKey] = useState<string | null>(null);

  // ── 1. Cek Sesi Cookie Saat Pertama Kali Dimuat ──
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/auth', { credentials: 'same-origin' });
        const data = await res.json();
        if (isMounted && data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch {
        // Abaikan
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Timer Countdown jika terkena penalti brute force
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // ── 2. Handle Login ──
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin || isSubmittingAuth || lockoutSeconds > 0) return;

    setIsSubmittingAuth(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ credential: cleanPin }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPinInput('');
        setAuthError('');
      } else {
        setAuthError(data.error || 'PIN tidak sesuai.');
        if (data.isLocked && data.remainingSeconds) {
          setLockoutSeconds(data.remainingSeconds);
        }
      }
    } catch {
      setAuthError('Gagal menghubungkan ke server.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'same-origin' });
    } catch {
      // Abaikan
    }
    setIsAuthenticated(false);
    setPinInput('');
  };

  // ── 3. Dashboard API Fetchers ──
  const fetchCodes = useCallback(async () => {
    setIsLoadingCodes(true);
    try {
      const res = await fetch('/api/admin/codes', { credentials: 'same-origin' });
      const data = await res.json();
      if (data.success && Array.isArray(data.codes)) {
        setCodes(data.codes);
      }
    } catch (err) {
      console.error('Fetch codes error:', err);
    } finally {
      setIsLoadingCodes(false);
    }
  }, []);

  const fetchPricing = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/pricing');
      const data = await res.json();
      if (data.success && data.pricing) {
        setPricing({
          basePrice: data.pricing.basePrice ?? 85000,
          isPromoActive: Boolean(data.pricing.isPromoActive),
          promoPrice: data.pricing.promoPrice ?? 25000,
          promoLabel: data.pricing.promoLabel || 'Promo Terbatas',
        });
        if (data.pricing.tiers) {
          setMultiTierPricing((prev) => ({
            daily: { ...prev.daily, ...(data.pricing.tiers.daily || {}) },
            weekly: { ...prev.weekly, ...(data.pricing.tiers.weekly || {}) },
            lifetime: { ...prev.lifetime, ...(data.pricing.tiers.lifetime || {}) },
          }));
        }
      }
    } catch (err) {
      console.error('Fetch pricing error:', err);
    }
  }, []);

  const fetchDiagnostics = useCallback(async () => {
    setIsLoadingDiag(true);
    try {
      const res = await fetch('/api/admin/diagnostics', { credentials: 'same-origin' });
      const data = await res.json();
      setDiagData(data);
    } catch (err) {
      console.error('Fetch diagnostics error:', err);
    } finally {
      setIsLoadingDiag(false);
    }
  }, []);

  const fetchGifts = useCallback(async () => {
    setIsLoadingGifts(true);
    try {
      const res = await fetch('/api/admin/gifts', { credentials: 'same-origin' });
      const data = await res.json();
      if (data.success && Array.isArray(data.gifts)) {
        setGiftsList(data.gifts);
        setTotalGiftsCount(data.totalGifts || data.gifts.length);
        setTotalGiftsViews(data.totalViews || 0);
        setVipDraftsCount(data.vipDraftsCount || 0);
      }
    } catch (err) {
      console.error('Fetch gifts error:', err);
    } finally {
      setIsLoadingGifts(false);
    }
  }, []);

  const handleDeleteGift = async (id: string) => {
    if (!confirm(`Hapus hadiah digital "${id}" secara permanen dari database?`)) return;
    setDeletingGiftId(id);
    try {
      const res = await fetch(`/api/admin/gifts?id=${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (data.success) {
        setGiftsList((prev) => prev.filter((g) => g.id !== id));
        setTotalGiftsCount((prev) => Math.max(0, prev - 1));
      } else {
        alert(data.message || 'Gagal menghapus hadiah digital.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setDeletingGiftId(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCodes();
      fetchPricing();
      fetchGifts();
    }
  }, [isAuthenticated, fetchCodes, fetchPricing, fetchGifts]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'diagnostics') {
      fetchDiagnostics();
    }
    if (isAuthenticated && activeTab === 'gifts') {
      fetchGifts();
    }
  }, [isAuthenticated, activeTab, fetchDiagnostics, fetchGifts]);

  // Generate kode acak
  const handleRandomizeCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const prefix = newTier === 'daily' ? 'DAY' : newTier === 'weekly' ? 'WEEK' : 'VIP';
    setNewCode(`${prefix}-${rand}`);
  };

  // Buat kode baru
  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      setFormMsg({ text: 'Kode tidak boleh kosong.', type: 'error' });
      return;
    }

    setIsCreatingCode(true);
    setFormMsg(null);

    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          max_uses: newMaxUses,
          max_devices: newMaxDevices,
          notes: newNotes.trim() || undefined,
          tier: newTier,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFormMsg({ text: `Kode ${newCode.toUpperCase()} (${newTier}) berhasil dibuat!`, type: 'success' });
        setNewCode('');
        setNewNotes('');
        setNewMaxUses(1);
        setNewMaxDevices(5);
        fetchCodes();
      } else {
        setFormMsg({ text: data.message || 'Gagal membuat kode.', type: 'error' });
      }
    } catch {
      setFormMsg({ text: 'Terjadi kesalahan sistem saat membuat kode.', type: 'error' });
    } finally {
      setIsCreatingCode(false);
    }
  };

  // Ambil data perangkat untuk 1 kode
  const fetchDevices = async (codeItem: AccessCodeItem) => {
    setSelectedCodeForDevices(codeItem);
    setIsLoadingDevices(true);
    setDevices([]);
    try {
      const res = await fetch(`/api/admin/codes?devices_for=${codeItem.id}`, { credentials: 'same-origin' });
      const data = await res.json();
      if (data.success) setDevices(data.devices || []);
    } catch (err) {
      console.error('Fetch devices error:', err);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  // Update batas max devices
  const handleUpdateMaxDevices = async (id: string, newLimit: number) => {
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id, max_devices: newLimit }),
      });
      const data = await res.json();
      if (data.success) {
        setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, max_devices: newLimit } : c)));
        if (selectedCodeForDevices?.id === id) {
          setSelectedCodeForDevices((prev) => (prev ? { ...prev, max_devices: newLimit } : null));
        }
        setEditingDeviceLimitId(null);
      }
    } catch (err) {
      console.error('Update limit error:', err);
    }
  };

  // Toggle status aktif
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c)));
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Reset pemakaian
  const handleResetCode = async (id: string, codeStr: string) => {
    if (!confirm(`Reset pemakaian kode "${codeStr}"? Perangkat yang terdaftar akan dilepaskan.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id, action: 'reset' }),
      });
      const data = await res.json();
      if (data.success) {
        setCodes((prev) =>
          prev.map((c) => (c.id === id ? { ...c, used_count: 0, used_by_name: null, device_count: 0 } : c))
        );
        if (selectedCodeForDevices?.id === id) {
          setDevices([]);
          setSelectedCodeForDevices((prev) =>
            prev ? { ...prev, device_count: 0, used_count: 0, used_by_name: null } : null
          );
        }
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // Hapus kode permanen
  const handleDeleteCode = async (id: string, codeStr: string) => {
    if (!confirm(`Hapus permanen kode "${codeStr}"?`)) return;

    try {
      const res = await fetch('/api/admin/codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setCodes((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Perhitungan otomatis diskon persen & hemat rupiah untuk tier yang sedang dipilih di admin
  const currentTierData = multiTierPricing[selectedPricingTier];
  const discountStats = useMemo(() => {
    const base = Math.max(0, Number(currentTierData.basePrice) || 0);
    const promo = Math.max(0, Number(currentTierData.promoPrice) || 0);

    if (!currentTierData.isPromoActive || promo >= base || base === 0) {
      return {
        hasDiscount: false,
        percent: 0,
        savingRupiah: 0,
        finalPrice: base,
        badge: 'Harga Standar',
      };
    }

    const saving = base - promo;
    const pct = Math.round((saving / base) * 100);

    return {
      hasDiscount: true,
      percent: pct,
      savingRupiah: saving,
      finalPrice: promo,
      badge: currentTierData.badge?.trim() || `Diskon ${pct}%`,
    };
  }, [currentTierData]);

  // Handler ubah persen -> otomatis hitung promoPrice pada tier aktif
  const handleDiscountPercentChange = (percentVal: number) => {
    const pct = Math.max(0, Math.min(99, percentVal));
    const base = Number(currentTierData.basePrice) || 10000;
    const computedPromo = Math.round((base * (100 - pct)) / 100);
    setMultiTierPricing((prev) => ({
      ...prev,
      [selectedPricingTier]: {
        ...prev[selectedPricingTier],
        promoPrice: computedPromo,
        badge: pct > 0 ? `Hemat ${pct}%` : 'Promo Terbatas',
      },
    }));
  };

  // Handler ubah promoPrice -> otomatis hitung persen pada tier aktif
  const handlePromoPriceChange = (priceVal: number) => {
    const promo = Math.max(0, priceVal);
    const base = Number(currentTierData.basePrice) || 10000;
    const pct = base > promo ? Math.round(((base - promo) / base) * 100) : 0;
    setMultiTierPricing((prev) => ({
      ...prev,
      [selectedPricingTier]: {
        ...prev[selectedPricingTier],
        promoPrice: promo,
        badge: pct > 0 ? `Hemat ${pct}%` : prev[selectedPricingTier].badge,
      },
    }));
  };

  // Simpan semua paket harga ke backend
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPricing(true);
    setPricingMsg(null);

    try {
      const res = await fetch('/api/settings/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'laysa-admin-s3cr3t-k3y-2026-buket',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          tiers: multiTierPricing,
          basePrice: multiTierPricing.lifetime.basePrice,
          promoPrice: multiTierPricing.lifetime.promoPrice,
          isPromoActive: multiTierPricing.lifetime.isPromoActive,
          promoLabel: multiTierPricing.lifetime.badge || 'Promo Terbatas',
        }),
      });
      const data = await res.json();

      if (data.success) {
        setPricingMsg({ text: '✓ Semua paket harga dan promo berhasil disimpan!', type: 'success' });
        fetchPricing();
      } else {
        setPricingMsg({ text: data.message || data.error || 'Gagal menyimpan harga.', type: 'error' });
      }
    } catch {
      setPricingMsg({ text: 'Terjadi kesalahan sistem saat menghubungi server.', type: 'error' });
    } finally {
      setIsSavingPricing(false);
    }
  };

  // Handler salin format teks jualan / broadcast WhatsApp & Sosmed
  const handleCopyBroadcast = (key: 'daily' | 'weekly' | 'lifetime' | 'all') => {
    let text = '';
    const d = multiTierPricing.daily;
    const w = multiTierPricing.weekly;
    const l = multiTierPricing.lifetime;

    const dPrice = d.isPromoActive ? d.promoPrice : d.basePrice;
    const wPrice = w.isPromoActive ? w.promoPrice : w.basePrice;
    const lPrice = l.isPromoActive ? l.promoPrice : l.basePrice;

    if (key === 'daily') {
      text = `🌸 *PROMO BUKET LAYSA - PAKET HARIAN (24 JAM)* 🌸\n` +
        `Butuh merangkai buket virtual estetik untuk kado wisuda atau ulang tahun hari ini?\n\n` +
        `💰 Cuma *Rp ${dPrice.toLocaleString('id-ID')}* ${d.isPromoActive ? `(Diskon dari Rp ${d.basePrice.toLocaleString('id-ID')})` : ''}!\n\n` +
        `✨ Keuntungan:\n` +
        (d.features || []).map((f) => `• ${f}`).join('\n') + `\n\n` +
        `📲 Pesan kode akses instan via WA: https://wa.me/6289514618737`;
    } else if (key === 'weekly') {
      text = `🌸 *PROMO SPESIAL 7 HARI - BUKET LAYSA FLORIST* 🌸\n` +
        `Mau buat banyak variasi buket untuk teman, wisuda, atau pasangan sepanjang minggu?\n\n` +
        `💰 Cuma *Rp ${wPrice.toLocaleString('id-ID')}* (Hemat lebih dari 50%)!\n\n` +
        `✨ Keuntungan:\n` +
        (w.features || []).map((f) => `• ${f}`).join('\n') + `\n\n` +
        `📲 Pesan kode akses instan via WA: https://wa.me/6289514618737`;
    } else if (key === 'lifetime') {
      text = `👑 *VIP SULTAN SELAMANYA + KEBUN BUNGA STREAK 🔥* 👑\n` +
        `Sekali bayar aktif selamanya tanpa biaya langganan bulanan!\n\n` +
        `💰 Cuma *Rp ${lPrice.toLocaleString('id-ID')}* ${l.isPromoActive ? `(Diskon dari Rp ${l.basePrice.toLocaleString('id-ID')})` : ''}!\n\n` +
        `✨ Keuntungan Eksklusif:\n` +
        (l.features || []).map((f) => `• ${f}`).join('\n') + `\n\n` +
        `📲 Pesan kode akses Sultan via WA: https://wa.me/6289514618737`;
    } else {
      text = `🌸 *KATALOG HARGA & PAKET VIP BUKET BUNGA LAYSA* 🌸\n` +
        `Pilih paket buket bunga virtual terbaik untuk orang tersayang:\n\n` +
        `1️⃣ *Paket Harian (24 Jam)* — Rp ${dPrice.toLocaleString('id-ID')}\n` +
        `• Akses semua bunga & buket, aktif 24 jam, hingga 5 device.\n\n` +
        `2️⃣ *Paket Mingguan (7 Hari)* — Rp ${wPrice.toLocaleString('id-ID')}\n` +
        `• Cocok untuk event wisuda/kado, bebas edit kapan saja, hingga 5 device.\n\n` +
        `3️⃣ *Paket Selamanya (VIP Sultan)* — Rp ${lPrice.toLocaleString('id-ID')} 👑\n` +
        `• Akses PERMANEN selamanya + Buka Fitur Kebun Bunga Harian Streak 🔥 (Solo / Pasangan).\n\n` +
        `📲 Pesan kode akses langsung via WhatsApp: https://wa.me/6289514618737`;
    }

    navigator.clipboard.writeText(text);
    setCopiedBroadcastKey(key);
    setTimeout(() => setCopiedBroadcastKey(null), 2500);
  };

  // Salin ke clipboard
  const handleCopy = (codeStr: string, id: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Salin template WA sesuai tier
  const handleCopyWaTemplate = (codeStr: string, item?: AccessCodeItem) => {
    const tier = item?.tier || 'lifetime';
    let text = '';
    if (tier === 'daily') {
      text = `Halo kak! Terima kasih atas pemesanan Akses VIP Harian (24 Jam) Studio Buket Laysa.\n\nBerikut kode akses Anda:\n👉 *${codeStr}*\n\nCara pakai:\n1. Buka website Studio Buket kami\n2. Klik "Buka VIP" lalu masukkan kode di atas\n3. Ketik nama kamu, dan seluruh bunga & bucket aktif selama 24 jam! 🌸⏱️`;
    } else if (tier === 'weekly') {
      text = `Halo kak! Terima kasih atas pemesanan Akses VIP Mingguan (7 Hari) Studio Buket Laysa.\n\nBerikut kode akses Anda:\n👉 *${codeStr}*\n\nCara pakai:\n1. Buka website Studio Buket kami\n2. Klik "Buka VIP" lalu masukkan kode di atas\n3. Ketik nama kamu, dan seluruh bunga & bucket aktif selama 7 hari! 🌸📅`;
    } else {
      text = `Halo kak! Terima kasih atas pemesanan Akses VIP Selamanya Studio Buket Laysa.\n\nBerikut kode akses eksklusif Anda:\n👉 *${codeStr}*\n\nCara pakai:\n1. Buka website Studio Buket kami\n2. Klik "Buka VIP" lalu masukkan kode di atas\n3. Ketik nama kamu, seluruh bunga & bucket aktif SELAMANYA + fitur Kebun Bunga Streak 🔥 terbuka! 🌸👑`;
    }
    navigator.clipboard.writeText(text);
    alert(`Pesan WhatsApp untuk kode "${codeStr}" (${tier}) berhasil disalin.`);
  };

  // Stats
  const stats = useMemo(() => {
    const total = codes.length;
    const active = codes.filter((c) => c.is_active).length;
    const used = codes.filter((c) => c.used_count > 0).length;
    const pricePerUnit = pricing.isPromoActive ? pricing.promoPrice || 5000 : pricing.basePrice;
    const totalRevenue = used * pricePerUnit;
    return { total, active, used, totalRevenue };
  }, [codes, pricing]);

  // Filtered Codes
  const filteredCodes = useMemo(() => {
    return codes.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.used_by_name && c.used_by_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (filterStatus === 'active') return c.is_active;
      if (filterStatus === 'inactive') return !c.is_active;
      if (filterStatus === 'used') return c.used_count > 0;
      return true;
    });
  }, [codes, searchQuery, filterStatus]);

  // Filtered Digital Gifts
  const filteredGifts = useMemo(() => {
    return giftsList.filter((g) => {
      if (!giftsSearchQuery.trim()) return true;
      const q = giftsSearchQuery.toLowerCase();
      const idMatch = g.id && g.id.toLowerCase().includes(q);
      const senderMatch = g.sender && g.sender.toLowerCase().includes(q);
      const recipientMatch = g.recipient && g.recipient.toLowerCase().includes(q);
      const msgMatch = g.message && g.message.toLowerCase().includes(q);
      const musicMatch = g.music && g.music.toLowerCase().includes(q);
      return idMatch || senderMatch || recipientMatch || msgMatch || musicMatch;
    });
  }, [giftsList, giftsSearchQuery]);

  // ═════════════════════════════════════════════════════════════
  // VIEW A: LOGIN SESUAI GAYA LOGINUI.HTML (UNAUTHENTICATED)
  // ═════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="loginui-page-wrapper" suppressHydrationWarning>
        <div className="container" suppressHydrationWarning>
          {/* SISI KIRI: GAMBAR ARTISAN BOUQUET */}
          <div className="left-panel">
            <div className="brand-top">
              <div className="brand-text">LAYSA ATELIER</div>
              <div className="brand-tagline">Artisan Floral Studio & VIP Vault</div>
            </div>

            <div className="brand-bottom-badge">
              <strong>🌸 Portal Manajemen Terpusat</strong>
              <div style={{ marginTop: '2px', opacity: 0.9 }}>
                Kelola voucher VIP, atur promo harga, dan pantau perangkat aktif secara real-time.
              </div>
            </div>
          </div>

          {/* SISI KANAN: FORM LOGIN */}
          <div className="right-panel">
            <div className="right-header">
              <h2>Selamat Datang</h2>
              <p>Masukkan PIN otorisasi untuk membuka akses ke konsol admin studio.</p>
            </div>

            {authError && (
              <div className="login-alert">
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            {lockoutSeconds > 0 && (
              <div className="login-alert">
                <AlertCircle size={16} />
                <span>Tunggu {lockoutSeconds} detik sebelum mencoba kembali.</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ width: '100%' }}>
              {/* Input Password / PIN */}
              <div className="form-group password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan Password"
                  id="passwordInput"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  required
                  disabled={isSubmittingAuth || lockoutSeconds > 0}
                  autoFocus
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              {/* Tombol Login Oranye Pill */}
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmittingAuth || !pinInput.trim() || lockoutSeconds > 0}
              >
                <span>{isSubmittingAuth ? 'Memverifikasi...' : 'Masuk'}</span>
              </button>
            </form>

            <Link href="/" className="back-link">
              ← Kembali ke Website Studio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // VIEW B: DASHBOARD UTAMA SESUAI GRID LOGIN-ADMIN.HTML
  // ═════════════════════════════════════════════════════════════
  const hasSidebar = activeTab === 'dashboard';
  return (
    <div className="vault-wrapper" suppressHydrationWarning>
      <div
        className="dashboard-main"
        style={{
          gridTemplateColumns: hasSidebar
            ? '240px 1fr 310px'
            : '240px 1fr',
        }}
      >
        {/* ===== SIDEBAR KIRI (240px) ===== */}
        <aside className="adm-sidebar">
          <div className="adm-logo">
            <div className="adm-logo-icon">🌸</div>
            <div className="adm-logo-text">
              <h1>Laysa Studio</h1>
              <p>Florist • Admin Panel</p>
            </div>
          </div>

          <nav className="adm-nav-menu">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`adm-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tokens')}
              className={`adm-nav-item ${activeTab === 'tokens' ? 'active' : ''}`}
            >
              <KeyRound size={17} />
              <span>Kode Akses VIP</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gifts')}
              className={`adm-nav-item ${activeTab === 'gifts' ? 'active' : ''}`}
            >
              <Gift size={17} />
              <span>Database Hadiah</span>
              {totalGiftsCount > 0 && (
                <span className="adm-mobile-badge" style={{ marginLeft: 'auto' }}>{totalGiftsCount}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`adm-nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
            >
              <Tag size={17} />
              <span>Atur Harga &amp; Promo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diagnostics')}
              className={`adm-nav-item ${activeTab === 'diagnostics' ? 'active' : ''}`}
            >
              <Database size={17} />
              <span>Status Database</span>
            </button>
          </nav>

          {/* Kartu Status Sesi */}
          <div className="adm-info-card">
            <ShieldCheck size={22} style={{ color: 'var(--primary)', margin: '0 auto 6px' }} />
            <h4>Sesi Terproteksi</h4>
            <p>Cookie HttpOnly aktif 7 hari dengan proteksi middleware anti-brute force.</p>
            <Link href="/" target="_blank" className="adm-btn-site">
              <ExternalLink size={13} />
              <span>Lihat Web Studio</span>
            </Link>
          </div>

          {/* User Profile Bawah */}
          <div className="adm-user-profile">
            <div className="adm-user-avatar">👩‍💼</div>
            <div className="adm-user-info">
              <h4>Admin Laysa</h4>
              <p>Super Admin</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="adm-logout-btn"
              title="Keluar dari Panel"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* ===== KONTEN TENGAH (1fr) ===== */}
        <main className="adm-main-content">
          {/* ─── MOBILE TOPBAR & SCROLLABLE TAB STRIP (KHUSUS HP) ─── */}
          <div className="adm-mobile-nav-wrapper">
            <div className="adm-mobile-header">
              <div className="adm-mobile-brand">
                <span className="adm-mobile-brand-icon">🌸</span>
                <div>
                  <h2 className="adm-mobile-brand-title">Laysa Studio</h2>
                  <p className="adm-mobile-brand-sub">Admin Panel</p>
                </div>
              </div>
              <div className="adm-mobile-actions">
                <Link href="/" target="_blank" className="adm-mobile-action-btn" title="Lihat Web Studio">
                  <ExternalLink size={14} />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="adm-mobile-action-btn logout"
                  title="Keluar dari Panel"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>

            <nav className="adm-mobile-tabs">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`adm-mobile-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tokens')}
                className={`adm-mobile-tab-btn ${activeTab === 'tokens' ? 'active' : ''}`}
              >
                <KeyRound size={14} />
                <span>Kode VIP</span>
                {stats.active > 0 && <span className="adm-mobile-badge">{stats.active}</span>}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('gifts')}
                className={`adm-mobile-tab-btn ${activeTab === 'gifts' ? 'active' : ''}`}
              >
                <Gift size={14} />
                <span>Hadiah</span>
                {totalGiftsCount > 0 && <span className="adm-mobile-badge">{totalGiftsCount}</span>}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className={`adm-mobile-tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
              >
                <Tag size={14} />
                <span>Harga &amp; Promo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('diagnostics')}
                className={`adm-mobile-tab-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}
              >
                <Database size={14} />
                <span>Status DB</span>
              </button>
            </nav>
          </div>

          {/* Top Search Bar */}
          <div className="adm-top-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari kode akses, nama pemesan, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* ═══════════════════════════════════════════
              TAB 0: DASHBOARD UTAMA (OVERVIEW & STATS)
              ═══════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Hero Banner Khas login-admin.html — HANYA TAMPIL DI TAB DASHBOARD */}
              <div className="adm-hero-banner">
                <div className="adm-hero-text">
                  <div className="adm-hero-tag">
                    <span>🌸 Studio Buket Laysa</span>
                    <ChevronRight size={12} />
                  </div>
                  <h1>
                    Selamat Datang,<br />
                    <span>Admin Laysa!</span> 👋
                  </h1>
                  <p>
                    Kelola voucher VIP, atur persentase diskon promo, dan pantau kuota multi-device pelanggan dengan mudah.
                  </p>
                </div>
                <div className="adm-hero-illustration">💐</div>
              </div>

              {/* 5 Kartu Statistik Dashboard */}
              <div className="adm-stats-grid">
                <div
                  className="adm-stat-card card-theme-purple"
                  onClick={() => setActiveTab('tokens')}
                  style={{ cursor: 'pointer' }}
                  title="Klik untuk kelola voucher"
                >
                  <div className="adm-stat-icon">
                    <KeyRound size={20} />
                  </div>
                  <div className="adm-stat-info">
                    <h4>{stats.total}</h4>
                    <p>Total Voucher</p>
                  </div>
                </div>

                <div
                  className="adm-stat-card card-theme-green"
                  onClick={() => setActiveTab('tokens')}
                  style={{ cursor: 'pointer' }}
                  title="Klik untuk kelola voucher aktif"
                >
                  <div className="adm-stat-icon">
                    <Sparkles size={20} />
                  </div>
                  <div className="adm-stat-info">
                    <h4>{stats.active}</h4>
                    <p>Voucher Aktif</p>
                  </div>
                </div>

                <div
                  className="adm-stat-card card-theme-amber"
                  onClick={() => setActiveTab('tokens')}
                  style={{ cursor: 'pointer' }}
                  title="Klik untuk lihat klaim pembeli"
                >
                  <div className="adm-stat-icon">
                    <Users size={20} />
                  </div>
                  <div className="adm-stat-info">
                    <h4>{stats.used}</h4>
                    <p>Terklaim Pembeli</p>
                  </div>
                </div>

                <div
                  className="adm-stat-card card-theme-rose"
                  onClick={() => setActiveTab('gifts')}
                  style={{ cursor: 'pointer' }}
                  title="Klik untuk lihat database kado digital"
                >
                  <div className="adm-stat-icon">
                    <Gift size={20} />
                  </div>
                  <div className="adm-stat-info">
                    <h4>{totalGiftsCount}</h4>
                    <p>Hadiah Digital Dibuat</p>
                  </div>
                </div>

                <div
                  className="adm-stat-card card-theme-blue"
                  onClick={() => setActiveTab('gifts')}
                  style={{ cursor: 'pointer' }}
                  title="Klik untuk pantau total kunjungan amplop"
                >
                  <div className="adm-stat-icon">
                    <Eye size={20} />
                  </div>
                  <div className="adm-stat-info">
                    <h4>{totalGiftsViews}</h4>
                    <p>Views Amplop Kado</p>
                  </div>
                </div>
              </div>

              {/* Grid Ikhtisar Dashboard */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '6px' }}>
                {/* GRAFIK PROGRESS: Ketersediaan Voucher Aktif */}
                <div className="adm-card" style={{ marginBottom: 0 }}>
                  <div className="adm-card-header" style={{ marginBottom: '18px' }}>
                    <div>
                      <h3 className="adm-card-title">Ketersediaan Voucher Aktif</h3>
                      <p className="adm-card-sub">Jumlah voucher siap pakai untuk pelanggan studio buket.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tokens')}
                      className="adm-btn-site"
                      style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                    >
                      Kelola →
                    </button>
                  </div>

                  {codes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      Belum ada voucher terdaftar. Klik &quot;Kelola&quot; untuk menerbitkan voucher pertama.
                    </div>
                  ) : (() => {
                    const totalV = codes.length;
                    const activeV = codes.filter(c => c.is_active && c.used_count === 0).length;
                    const claimedV = codes.filter(c => c.used_count > 0).length;
                    const activePct = totalV > 0 ? Math.round((activeV / totalV) * 100) : 0;

                    // Circular Progress Gauge like login-admin.html
                    const r = 58;
                    const c = 2 * Math.PI * r;
                    const strokeDashoffset = c - (activePct / 100) * c;

                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
                        {/* Circular Gauge */}
                        <div style={{ position: 'relative', width: '136px', height: '136px', flexShrink: 0 }}>
                          <svg width="136" height="136" style={{ transform: 'rotate(-90deg)' }}>
                            <circle
                              cx="68"
                              cy="68"
                              r={r}
                              fill="none"
                              stroke="#f0f3f8"
                              strokeWidth="12"
                            />
                            <circle
                              cx="68"
                              cy="68"
                              r={r}
                              fill="none"
                              stroke="#22c55e"
                              strokeWidth="12"
                              strokeDasharray={c}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                            />
                          </svg>
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>{activeV}</span>
                            <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>{activePct}% Aktif</span>
                          </div>
                        </div>

                        {/* Detail Info Ringkasan */}
                        <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#e0f7ea', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e' }} />
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#166534' }}>Voucher Aktif</span>
                            </div>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#166534' }}>{activeV}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#eef4ff', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#1d6ff2' }} />
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e40af' }}>Terklaim Pembeli</span>
                            </div>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e40af' }}>{claimedV}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#94a3b8' }} />
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Voucher</span>
                            </div>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)' }}>{totalV}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Aksi Cepat Admin */}
                <div className="adm-card" style={{ marginBottom: 0 }}>
                  <h3 className="adm-card-title" style={{ marginBottom: '14px' }}>Aksi Cepat Admin</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('tokens');
                        handleRandomizeCode();
                      }}
                      className="adm-btn-action"
                      style={{ justifyContent: 'center', padding: '12px', background: 'var(--bg-blue-light)', color: 'var(--primary)', fontWeight: 600, borderRadius: '14px', flexDirection: 'column', gap: '6px', height: '72px' }}
                    >
                      <Plus size={18} />
                      <span style={{ fontSize: '0.78rem' }}>Buat Voucher</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pricing')}
                      className="adm-btn-action"
                      style={{ justifyContent: 'center', padding: '12px', borderRadius: '14px', flexDirection: 'column', gap: '6px', height: '72px' }}
                    >
                      <Tag size={18} />
                      <span style={{ fontSize: '0.78rem' }}>Atur Diskon</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('diagnostics')}
                      className="adm-btn-action"
                      style={{ justifyContent: 'center', padding: '12px', borderRadius: '14px', flexDirection: 'column', gap: '6px', height: '72px' }}
                    >
                      <Database size={18} />
                      <span style={{ fontSize: '0.78rem' }}>Cek Database</span>
                    </button>
                    <Link
                      href="/"
                      target="_blank"
                      className="adm-btn-action"
                      style={{ justifyContent: 'center', padding: '12px', textDecoration: 'none', borderRadius: '14px', flexDirection: 'column', gap: '6px', height: '72px' }}
                    >
                      <ExternalLink size={18} />
                      <span style={{ fontSize: '0.78rem' }}>Buka Website</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              TAB 1: KODE AKSES VIP
              ═══════════════════════════════════════════ */}
          {activeTab === 'tokens' && (
            <div>
              {/* Header Judul Menu Kode Akses VIP */}
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                    Manajemen Kode Akses VIP
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Kelola penerbitan voucher, kuota pemakaian, dan pelacakan multi-perangkat pelanggan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchCodes}
                  className="adm-btn-action"
                  disabled={isLoadingCodes}
                >
                  <RefreshCw size={14} className={isLoadingCodes ? 'spin' : ''} />
                  <span>Muat Ulang</span>
                </button>
              </div>
              {/* 4 Kartu Statistik */}
              <div className="adm-stats-grid">
                <div className="adm-stat-card card-theme-purple">
                  <div className="adm-stat-icon">
                    <KeyRound size={20} />
                  </div>
                  <div className="adm-stat-info">
                    <h4>{stats.total}</h4>
                    <p>Total Voucher</p>
                  </div>
                </div>

                <div className="adm-stat-card card-theme-green">
                  <div className="adm-stat-icon">
                    <Sparkles size={20} />
                  </div>
                  <div className="adm-stat-info">
                    <h4>{stats.active}</h4>
                    <p>Voucher Aktif</p>
                  </div>
                </div>

                <div className="adm-stat-card card-theme-amber">
                  <div className="adm-stat-icon">
                    <Users size={20} />
                  </div>
                  <div className="adm-stat-info">
                    <h4>{stats.used}</h4>
                    <p>Terklaim Pembeli</p>
                  </div>
                </div>

              </div>

              {/* Form Buat Kode Baru */}
              <div className="adm-form-card">
                <div className="adm-form-card-header">
                  <div className="adm-form-card-icon">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="adm-card-title">Terbitkan Kode Voucher Baru</h3>
                    <p className="adm-card-sub">Buat kode akses premium dengan pembatasan kuota dan jumlah perangkat.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateCode}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '16px',
                      marginBottom: '18px',
                    }}
                  >
                    <div>
                      <label className="vault-input-label">Kode Voucher</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="VIP-MAWAR"
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                          className="vault-input-field"
                          style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.04em' }}
                        />
                        <button
                          type="button"
                          onClick={handleRandomizeCode}
                          className="adm-btn-random"
                          title="Generate Kode Acak Otomatis"
                        >
                          <Sparkles size={14} />
                          <span>Acak</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="vault-input-label">Batas Pemakaian (Klaim)</label>
                      <input
                        type="number"
                        min="1"
                        value={newMaxUses}
                        onChange={(e) => setNewMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                        className="vault-input-field"
                      />
                    </div>

                    <div>
                      <label className="vault-input-label">Batas Perangkat (Multi-Device)</label>
                      <select
                        value={newMaxDevices}
                        onChange={(e) => setNewMaxDevices(parseInt(e.target.value) || 5)}
                        className="vault-input-field"
                      >
                        <option value="1">1 Perangkat (Tunggal)</option>
                        <option value="2">2 Perangkat (HP + Laptop)</option>
                        <option value="3">3 Perangkat</option>
                        <option value="5">5 Perangkat (Default Rekomendasi)</option>
                        <option value="10">10 Perangkat</option>
                      </select>
                    </div>

                    <div>
                      <label className="vault-input-label">Paket VIP / Durasi</label>
                      <select
                        value={newTier}
                        onChange={(e) => {
                          const t = e.target.value as 'daily' | 'weekly' | 'lifetime';
                          setNewTier(t);
                          const prefix = t === 'daily' ? 'DAY' : t === 'weekly' ? 'WEEK' : 'VIP';
                          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                          let rand = '';
                          for (let i = 0; i < 6; i++) {
                            rand += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          setNewCode(`${prefix}-${rand}`);
                        }}
                        className="vault-input-field"
                      >
                        <option value="daily">⏱️ Paket Harian (Berlaku 24 Jam sejak klaim)</option>
                        <option value="weekly">📅 Paket Mingguan (Berlaku 7 Hari sejak klaim)</option>
                        <option value="lifetime">👑 Paket Selamanya (Permanen + Akses Kebun Bunga Streak 🔥)</option>
                      </select>
                    </div>

                    <div>
                      <label className="vault-input-label">Catatan / Pembeli</label>
                      <input
                        type="text"
                        placeholder="Cth: Kak Dinda (WA 0812...)"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        className="vault-input-field"
                      />
                    </div>
                  </div>

                  {formMsg && (
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        marginBottom: '16px',
                        background: formMsg.type === 'success' ? '#e0f7ea' : '#ffe8ec',
                        color: formMsg.type === 'success' ? '#166534' : '#991b1b',
                        border: `1px solid ${formMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>{formMsg.type === 'success' ? '✓' : '✗'}</span>
                      <span>{formMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCreatingCode}
                    className="vault-btn-submit-main"
                  >
                    <Plus size={16} />
                    <span>{isCreatingCode ? 'Menerbitkan...' : 'Terbitkan Kode Akses'}</span>
                  </button>
                </form>
              </div>

              {/* Tabel Daftar Kode */}
              <div className="adm-card" style={{ padding: 0 }}>
                <div
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 className="adm-card-title" style={{ margin: 0 }}>Daftar Kode Voucher VIP</h3>
                    <button
                      type="button"
                      onClick={fetchCodes}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-input)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Segarkan Data"
                    >
                      <RefreshCw size={12} className={isLoadingCodes ? 'spin' : ''} />
                    </button>
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e: any) => setFilterStatus(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-input)',
                      fontSize: '0.82rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif Saja</option>
                    <option value="used">Sudah Terpakai</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>

                <div className="adm-table-wrap" style={{ border: 'none' }}>
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Kode</th>
                        <th>Paket</th>
                        <th>Status</th>
                        <th>Klaim</th>
                        <th>Perangkat</th>
                        <th>Pemakai</th>
                        <th>Catatan</th>
                        <th>Tanggal</th>
                        <th style={{ textAlign: 'right' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingCodes ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            Memuat daftar kode...
                          </td>
                        </tr>
                      ) : filteredCodes.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            Tidak ada kode yang sesuai pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredCodes.map((item) => {
                          const deviceCount = item.device_count ?? 0;
                          const maxDev = item.max_devices ?? 5;

                          return (
                            <tr key={item.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span className="adm-code-tag">{item.code}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(item.code, item.id)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '2px',
                                      color: 'var(--text-dim)',
                                    }}
                                    title="Salin Kode"
                                  >
                                    {copiedId === item.id ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                                  </button>
                                </div>
                              </td>

                              <td>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '3px 8px',
                                    borderRadius: '8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: item.tier === 'daily' ? '#f5f5f4' : item.tier === 'weekly' ? '#eff6ff' : '#fef3c7',
                                    color: item.tier === 'daily' ? '#44403c' : item.tier === 'weekly' ? '#1d4ed8' : '#92400e',
                                  }}
                                >
                                  {item.tier === 'daily' ? '⏱️ 24 Jam' : item.tier === 'weekly' ? '📅 7 Hari' : '👑 Selamanya'}
                                </span>
                              </td>

                              <td>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '3px 8px',
                                    borderRadius: '20px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: item.is_active ? '#e0f7ea' : '#ffe8ec',
                                    color: item.is_active ? '#15803d' : '#be123c',
                                  }}
                                >
                                  {item.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                              </td>

                              <td style={{ fontSize: '0.85rem' }}>
                                <strong>{item.used_count}</strong>/{item.max_uses}
                              </td>

                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                                    {deviceCount}/{maxDev}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => fetchDevices(item)}
                                    style={{
                                      background: 'var(--bg-blue-light)',
                                      color: 'var(--primary)',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '3px 7px',
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Lihat ({deviceCount})
                                  </button>
                                </div>
                              </td>

                              <td style={{ fontSize: '0.82rem' }}>{item.used_by_name || '—'}</td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.notes || '—'}</td>

                              <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </td>

                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '5px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyWaTemplate(item.code, item)}
                                    style={{
                                      background: '#f0fdf4',
                                      color: '#15803d',
                                      border: '1px solid #bbf7d0',
                                      borderRadius: '8px',
                                      padding: '4px 9px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Salin WA
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(item.id, item.is_active)}
                                    style={{
                                      background: 'var(--bg-subtle)',
                                      border: '1px solid var(--border-input)',
                                      borderRadius: '8px',
                                      padding: '4px 8px',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {item.is_active ? 'Matikan' : 'Aktifkan'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleResetCode(item.id, item.code)}
                                    style={{
                                      background: 'var(--bg-subtle)',
                                      border: '1px solid var(--border-input)',
                                      borderRadius: '8px',
                                      padding: '4px 6px',
                                      cursor: 'pointer',
                                    }}
                                    title="Reset Pemakaian & Device"
                                  >
                                    <RotateCcw size={13} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCode(item.id, item.code)}
                                    style={{
                                      background: '#fef2f2',
                                      color: '#dc2626',
                                      border: '1px solid #fecaca',
                                      borderRadius: '8px',
                                      padding: '4px 6px',
                                      cursor: 'pointer',
                                    }}
                                    title="Hapus"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── TAMPILAN KHUSUS SMARTPHONE / HP (MOBILE CARDS VIEW) ── */}
                <div className="adm-mobile-cards-wrap">
                  {isLoadingCodes ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Memuat daftar kode...
                    </div>
                  ) : filteredCodes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Tidak ada kode yang sesuai pencarian.
                    </div>
                  ) : (
                    filteredCodes.map((item) => {
                      const deviceCount = item.device_count ?? 0;
                      const maxDev = item.max_devices ?? 5;

                      return (
                        <div key={item.id} className="adm-code-card-mobile">
                          {/* Baris Atas: Kode + Tier + Status */}
                          <div className="adm-code-card-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="adm-code-tag" style={{ fontSize: '0.9rem', padding: '4px 8px' }}>
                                {item.code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.code, item.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  color: 'var(--text-dim)',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Salin Kode"
                              >
                                {copiedId === item.id ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                              </button>
                            </div>

                            <div className="adm-code-card-badge-row">
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: item.tier === 'daily' ? '#f5f5f4' : item.tier === 'weekly' ? '#eff6ff' : '#fef3c7',
                                  color: item.tier === 'daily' ? '#44403c' : item.tier === 'weekly' ? '#1d4ed8' : '#92400e',
                                }}
                              >
                                {item.tier === 'daily' ? '⏱️ 24 Jam' : item.tier === 'weekly' ? '📅 7 Hari' : '👑 Selamanya'}
                              </span>

                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '20px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: item.is_active ? '#e0f7ea' : '#ffe8ec',
                                  color: item.is_active ? '#15803d' : '#be123c',
                                }}
                              >
                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                          </div>

                          {/* Info Meta Ringkas */}
                          <div className="adm-code-card-meta">
                            <div className="adm-code-card-meta-item">
                              <span className="adm-code-card-meta-label">Pemakai / Catatan</span>
                              <span className="adm-code-card-meta-val" style={{ fontSize: '0.78rem' }}>
                                {item.used_by_name || item.notes || '—'}
                              </span>
                            </div>

                            <div className="adm-code-card-meta-item">
                              <span className="adm-code-card-meta-label">Klaim / Kuota</span>
                              <span className="adm-code-card-meta-val">
                                {item.used_count}/{item.max_uses} Terklaim
                              </span>
                            </div>

                            <div className="adm-code-card-meta-item">
                              <span className="adm-code-card-meta-label">Perangkat Aktif</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontWeight: 700 }}>{deviceCount}/{maxDev}</span>
                                <button
                                  type="button"
                                  onClick={() => fetchDevices(item)}
                                  style={{
                                    background: 'var(--bg-blue-light)',
                                    color: 'var(--primary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '2px 6px',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Lihat ({deviceCount})
                                </button>
                              </div>
                            </div>

                            <div className="adm-code-card-meta-item">
                              <span className="adm-code-card-meta-label">Dibuat</span>
                              <span className="adm-code-card-meta-val" style={{ color: 'var(--text-dim)' }}>
                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Tombol Aksi Cepat Touch-Friendly */}
                          <div className="adm-code-card-actions">
                            <button
                              type="button"
                              onClick={() => handleCopyWaTemplate(item.code, item)}
                              className="adm-btn-mobile-wa"
                            >
                              <MessageCircle size={13} />
                              <span>Salin WA</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleActive(item.id, item.is_active)}
                              className="adm-btn-mobile-toggle"
                            >
                              {item.is_active ? 'Matikan' : 'Aktifkan'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResetCode(item.id, item.code)}
                              className="adm-btn-mobile-icon"
                              title="Reset Pemakaian &amp; Perangkat"
                            >
                              <RotateCcw size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCode(item.id, item.code)}
                              className="adm-btn-mobile-icon delete"
                              title="Hapus Kode"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              TAB 2: ATUR HARGA & DISKON PROMO
              ═══════════════════════════════════════════ */}
          {activeTab === 'pricing' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="adm-form-card">
                <div className="adm-form-card-header">
                  <div className="adm-form-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                    <Tag size={18} />
                  </div>
                  <div>
                    <h3 className="adm-card-title">Pengaturan Harga Multi-Tier VIP</h3>
                    <p className="adm-card-sub">
                      Atur nominal harga, status aktif, dan promo untuk paket Harian (24 Jam), Mingguan (7 Hari), dan Selamanya (Lifetime).
                    </p>
                  </div>
                </div>

                {/* 3 Tier Sub-Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '16px' }}>
                  {(['daily', 'weekly', 'lifetime'] as const).map((key) => {
                    const t = multiTierPricing[key];
                    const isSelected = selectedPricingTier === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedPricingTier(key)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--bg-blue-light)' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-dark)', whiteSpace: 'nowrap' }}>
                          {key === 'daily' ? '⏱️ Harian' : key === 'weekly' ? '📅 Mingguan' : '👑 Sultan'}
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          Rp {(t.isPromoActive ? t.promoPrice : t.basePrice).toLocaleString('id-ID')}
                        </div>
                        <span style={{ fontSize: '0.64rem', padding: '1px 5px', borderRadius: '4px', background: t.isActive ? '#e0f7ea' : '#fee2e2', color: t.isActive ? '#15803d' : '#b91c1c' }}>
                          {t.isActive ? 'Aktif' : 'Off'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSavePricing}>
                  {/* Status Aktif Toggle */}
                  <div
                    style={{
                      marginBottom: '14px',
                      background: 'var(--bg-subtle)',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={currentTierData.isActive}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setMultiTierPricing((prev) => ({
                            ...prev,
                            [selectedPricingTier]: { ...prev[selectedPricingTier], isActive: val },
                          }));
                        }}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <span>Jual Paket Ini ke Pengunjung Web ({currentTierData.name})</span>
                    </label>
                  </div>

                  {/* Harga Asli / Normal */}
                  <div className="vault-input-group">
                    <label className="vault-input-label">Harga Asli / Normal (Rp)</label>
                    <input
                      type="number"
                      step="1000"
                      value={currentTierData.basePrice}
                      onChange={(e) => {
                        const newBase = Math.max(0, parseInt(e.target.value) || 0);
                        setMultiTierPricing((prev) => {
                          const cur = prev[selectedPricingTier];
                          const promo = cur.promoPrice > newBase ? newBase : cur.promoPrice;
                          return {
                            ...prev,
                            [selectedPricingTier]: { ...cur, basePrice: newBase, promoPrice: promo },
                          };
                        });
                      }}
                      className="vault-input-field"
                      placeholder="10000"
                    />
                  </div>

                  {/* Promo Toggle */}
                  <div
                    style={{
                      marginBottom: '16px',
                      background: 'var(--bg-subtle)',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={currentTierData.isPromoActive}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setMultiTierPricing((prev) => ({
                            ...prev,
                            [selectedPricingTier]: { ...prev[selectedPricingTier], isPromoActive: val },
                          }));
                        }}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <span>Aktifkan Harga Promo / Diskon Spesial</span>
                    </label>
                  </div>

                  {currentTierData.isPromoActive && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '18px' }}>
                      {/* Baris Input Persentase Diskon (%) */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label className="vault-input-label" style={{ margin: 0 }}>
                            Persentase Diskon (%)
                          </label>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            Otomatis menghitung harga promo
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={discountStats.percent}
                            onChange={(e) => handleDiscountPercentChange(parseInt(e.target.value) || 0)}
                            className="vault-input-field"
                            style={{ width: '90px', fontWeight: 800 }}
                          />
                          <span style={{ fontSize: '1rem', fontWeight: 700 }}>%</span>

                          {/* Quick Preset Buttons */}
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginLeft: '6px' }}>
                            {[10, 25, 50, 70, 80].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => handleDiscountPercentChange(pct)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  border: '1px solid var(--border-input)',
                                  background: discountStats.percent === pct ? 'var(--primary)' : 'var(--bg-subtle)',
                                  color: discountStats.percent === pct ? '#ffffff' : 'var(--text-dark)',
                                }}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Baris Input Harga Promo Akhir (Rp) */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label className="vault-input-label" style={{ margin: 0 }}>
                            Harga Promo Akhir yang Dibayar Pembeli (Rp)
                          </label>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            Otomatis menghitung persentase
                          </span>
                        </div>
                        <input
                          type="number"
                          step="1000"
                          value={currentTierData.promoPrice}
                          onChange={(e) => handlePromoPriceChange(parseInt(e.target.value) || 0)}
                          className="vault-input-field"
                          style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}
                        />
                      </div>

                      {/* Kotak Ringkasan Potongan & Hemat */}
                      {discountStats.hasDiscount && (
                        <div
                          style={{
                            background: '#e0f7ea',
                            border: '1px solid #bbf7d0',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontSize: '0.82rem',
                            color: '#166534',
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>✓ Diskon {discountStats.percent}% Aktif</div>
                          <div style={{ marginTop: '2px', color: '#15803d' }}>
                            Pembeli hemat <strong>Rp {discountStats.savingRupiah.toLocaleString('id-ID')}</strong> (dari Rp {currentTierData.basePrice.toLocaleString('id-ID')} menjadi <strong>Rp {currentTierData.promoPrice.toLocaleString('id-ID')}</strong>).
                          </div>
                        </div>
                      )}

                      {/* Input Label Badge Promo */}
                      <div>
                        <label className="vault-input-label">Teks Badge Promo</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={currentTierData.badge || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMultiTierPricing((prev) => ({
                                ...prev,
                                [selectedPricingTier]: { ...prev[selectedPricingTier], badge: val },
                              }));
                            }}
                            placeholder="Cth: Promo Terbatas atau Hemat 50%"
                            className="vault-input-field"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const autoLabel = discountStats.percent > 0 ? `Hemat ${discountStats.percent}%` : 'Promo Spesial';
                              setMultiTierPricing((prev) => ({
                                ...prev,
                                [selectedPricingTier]: { ...prev[selectedPricingTier], badge: autoLabel },
                              }));
                            }}
                            style={{
                              padding: '0 14px',
                              background: 'var(--bg-subtle)',
                              border: '1px solid var(--border-input)',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Label Otomatis
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Poin Manfaat & Deskripsi Penjualan */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="vault-input-label" style={{ margin: 0 }}>
                        Poin Manfaat &amp; Deskripsi Penjualan (1 Baris per Poin)
                      </label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        Tampil di modal beli pengunjung
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={(currentTierData.features || []).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        setMultiTierPricing((prev) => ({
                          ...prev,
                          [selectedPricingTier]: {
                            ...prev[selectedPricingTier],
                            features: lines,
                          },
                        }));
                      }}
                      placeholder="Masukkan poin manfaat per baris..."
                      className="vault-input-field"
                      style={{
                        fontFamily: 'inherit',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        resize: 'vertical',
                      }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      💡 Tip: Tuliskan manfaat yang memikat pembeli seperti durasi aktif, kuota perangkat, ekspor HD, atau akses Kebun Bunga.
                    </div>
                  </div>

                  {/* Special Callout untuk Tier Lifetime */}
                  {selectedPricingTier === 'lifetime' && (
                    <div
                      style={{
                        background: '#fef3c7',
                        border: '1px solid #fde68a',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '0.82rem',
                        color: '#92400e',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>👑 Fitur Eksklusif Kebun Bunga Streak 🔥</span>
                      </div>
                      <div style={{ marginTop: '3px', opacity: 0.9 }}>
                        Paket Selamanya ini otomatis memberikan akses ke fitur penyiraman bunga harian ala Api TikTok (solo &amp; undang teman via kode).
                      </div>
                    </div>
                  )}

                  {pricingMsg && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        marginBottom: '14px',
                        background: pricingMsg.type === 'success' ? '#e0f7ea' : '#ffe8ec',
                        color: pricingMsg.type === 'success' ? '#166534' : '#991b1b',
                        border: `1px solid ${pricingMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                      }}
                    >
                      {pricingMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSavingPricing}
                    className="vault-btn-submit-main"
                    style={{ width: '100%' }}
                  >
                    <Save size={16} />
                    <span>{isSavingPricing ? 'Menyimpan...' : 'Simpan Semua Paket Harga'}</span>
                  </button>
                </form>
              </div>

              {/* Live Preview Card */}
              <div className="adm-form-card">
                <div className="adm-form-card-header">
                  <div className="adm-form-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="adm-card-title">Pratinjau Pilihan Paket Pengunjung</h3>
                    <p className="adm-card-sub">Simulasi modal yang dilihat pelanggan saat mengklik Buka VIP.</p>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(['daily', 'weekly', 'lifetime'] as const).map((key) => {
                      const t = multiTierPricing[key];
                      const isSelected = selectedPricingTier === key;
                      const hasDisc = t.isPromoActive && t.promoPrice < t.basePrice;
                      const finalPr = hasDisc ? t.promoPrice : t.basePrice;

                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedPricingTier(key)}
                          style={{
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: isSelected ? '#ffffff' : 'var(--bg-subtle)',
                            borderRadius: '14px',
                            padding: '14px 16px',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? 'var(--primary)' : 'var(--text-dark)' }}>
                              {key === 'daily' ? '⏱️ Paket Harian (24 Jam)' : key === 'weekly' ? '📅 Paket Mingguan (7 Hari)' : '👑 Paket Selamanya (VIP Sultan)'}
                            </div>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: key === 'lifetime' ? '#fef3c7' : '#e0f7ea',
                                color: key === 'lifetime' ? '#92400e' : '#15803d',
                              }}
                            >
                              {t.badge || (key === 'lifetime' ? '👑 Termasuk Kebun' : 'Hemat')}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            {hasDisc && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                                Rp {t.basePrice.toLocaleString('id-ID')}
                              </span>
                            )}
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                              Rp {finalPr.toLocaleString('id-ID')}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                              / {t.durationLabel}
                            </span>
                          </div>

                          <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {(t.features || []).slice(0, 3).map((f, i) => (
                              <li key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                                <span>{f}</span>
                              </li>
                            ))}
                            {(t.features || []).length > 3 && (
                              <li style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontStyle: 'italic', paddingLeft: '14px' }}>
                                + {(t.features || []).length - 3} keuntungan lainnya...
                              </li>
                            )}
                          </ul>

                          {key === 'lifetime' && (
                            <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700, marginTop: '6px', background: '#fef3c7', padding: '3px 8px', borderRadius: '6px' }}>
                              🌸 Buka Fitur Kebun Bunga Streak Harian 🔥
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Generator Teks Promosi & Broadcast Penjualan ── */}
                  <div
                    style={{
                      marginTop: '20px',
                      background: 'var(--bg-subtle)',
                      border: '1.5px dashed var(--border)',
                      borderRadius: '14px',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📢 Salin Teks Promosi Siap Jual (WhatsApp / Sosmed)</span>
                      </div>
                      {copiedBroadcastKey && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', background: '#e0f7ea', padding: '2px 8px', borderRadius: '9999px' }}>
                          ✓ Teks Disalin!
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.4 }}>
                      Klik tombol di bawah untuk menyalin pesan penawaran promo lengkap yang siap Anda kirimkan ke status WhatsApp, broadcast pelanggan, atau DM Instagram.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleCopyBroadcast('daily')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-input)',
                          background: copiedBroadcastKey === 'daily' ? '#dcfce7' : '#ffffff',
                          color: copiedBroadcastKey === 'daily' ? '#15803d' : 'var(--text-dark)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Copy size={13} />
                        <span>Promo Paket Harian</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyBroadcast('weekly')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-input)',
                          background: copiedBroadcastKey === 'weekly' ? '#dcfce7' : '#ffffff',
                          color: copiedBroadcastKey === 'weekly' ? '#15803d' : 'var(--text-dark)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Copy size={13} />
                        <span>Promo Paket Mingguan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyBroadcast('lifetime')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: '1px solid #fde68a',
                          background: copiedBroadcastKey === 'lifetime' ? '#dcfce7' : '#fffbeb',
                          color: copiedBroadcastKey === 'lifetime' ? '#15803d' : '#92400e',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Copy size={13} />
                        <span>Promo VIP Sultan (Streak 🔥)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyBroadcast('all')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: '1px solid var(--primary)',
                          background: copiedBroadcastKey === 'all' ? '#dcfce7' : 'var(--primary)',
                          color: copiedBroadcastKey === 'all' ? '#15803d' : '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Copy size={13} />
                        <span>Katalog Lengkap (Semua Paket)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              TAB 3: STATUS DATABASE
              ═══════════════════════════════════════════ */}
          {activeTab === 'diagnostics' && (
            <div className="adm-form-card">
              <div className="adm-form-card-header">
                <div className="adm-form-card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                  <Database size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="adm-card-title">Status Supabase &amp; Arsitektur Multi-Device</h3>
                  <p className="adm-card-sub">Pemeriksaan integritas koneksi database, relasi multi-perangkat, dan sinkronisasi skema.</p>
                </div>
                <button
                  type="button"
                  onClick={fetchDiagnostics}
                  className="vault-btn-submit-main"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  <RefreshCw size={13} className={isLoadingDiag ? 'spin' : ''} />
                  <span>{isLoadingDiag ? 'Memeriksa...' : 'Periksa Sekarang'}</span>
                </button>
              </div>

              <div style={{ padding: '26px' }}>
                {isLoadingDiag ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🔄</div>
                    <div>Memeriksa integritas sistem dan tabel database Supabase...</div>
                  </div>
                ) : diagData ? (
                  <div>
                    {/* 4 Kartu Status Database */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ background: 'var(--bg-subtle)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Koneksi REST Supabase</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px', color: diagData.supabase?.connected ? '#16a34a' : '#dc2626' }}>
                          {diagData.supabase?.connected ? '✓ Terhubung' : '✗ Terputus'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Endpoint API aktif &amp; responsif</div>
                      </div>

                      <div style={{ background: 'var(--bg-subtle)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tabel code_devices</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px', color: diagData.tables?.code_devices?.ok ? '#16a34a' : '#dc2626' }}>
                          {diagData.tables?.code_devices?.ok ? '✓ Siap Digunakan' : '✗ Belum Dibuat'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Dukungan pelacakan multi-perangkat</div>
                      </div>

                      <div style={{ background: 'var(--bg-subtle)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tabel vip_codes</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px', color: '#16a34a' }}>
                          ✓ Aktif ({codes.length} Kode)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Penyimpanan voucher VIP studio</div>
                      </div>

                      <div style={{ background: 'var(--bg-subtle)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tabel pricing_settings</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px', color: '#16a34a' }}>
                          ✓ Tersinkron
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Pengaturan diskon &amp; promo web</div>
                      </div>
                    </div>

                    {/* Layout 2 Kolom Melebar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                      {/* Kolom Kiri: Panduan & Kebijakan Keamanan */}
                      <div style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dark)' }}>
                          🛡️ Kebijakan Keamanan &amp; Integritas Data
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          <div>
                            <strong style={{ color: 'var(--text-dark)' }}>Proteksi Multi-Device:</strong> Sistem menggunakan hash sidik jari perangkat (fingerprint) browser untuk mengunci akses hingga batas kuota tiap kode.
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-dark)' }}>Enkripsi Cookie:</strong> Sesi login admin menggunakan cookie HttpOnly yang diproteksi dari script injection (XSS).
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-dark)' }}>Row-Level Security (RLS):</strong> Akses database langsung dibatasi melalui kebijakan RLS Supabase dan Service Role Key yang aman di server.
                          </div>
                        </div>
                      </div>

                      {/* Kolom Kanan: SQL Migrasi */}
                      {diagData.sql_to_run ? (
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                              Skrip SQL Migrasi (Supabase SQL Editor):
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(diagData.sql_to_run);
                                setCopiedSql(true);
                                setTimeout(() => setCopiedSql(false), 2000);
                              }}
                              className="adm-btn-random"
                              style={{ padding: '4px 12px', fontSize: '0.76rem' }}
                            >
                              {copiedSql ? '✓ Tersalin!' : 'Salin SQL'}
                            </button>
                          </div>
                          <pre
                            style={{
                              background: '#1e293b',
                              color: '#f8fafc',
                              border: '1px solid #334155',
                              borderRadius: '12px',
                              padding: '14px',
                              fontSize: '0.74rem',
                              fontFamily: 'monospace',
                              overflowX: 'auto',
                              lineHeight: 1.5,
                              maxHeight: '260px',
                            }}
                          >
                            {diagData.sql_to_run}
                          </pre>
                        </div>
                      ) : (
                        <div style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.88rem' }}>
                            ✓ Semua tabel dan kolom database telah terpasang dengan sempurna. Tidak ada migrasi SQL yang diperlukan!
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 0', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    Klik tombol &quot;Periksa Sekarang&quot; untuk memuat status koneksi database.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              TAB 4: DATABASE HADIAH DIGITAL & DRAFT VIP
              ═══════════════════════════════════════════ */}
          {activeTab === 'gifts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Tab */}
              <div className="adm-form-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      className="adm-form-card-icon"
                      style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', color: '#fff' }}
                    >
                      <Gift size={20} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                        Database Hadiah Digital &amp; Draft Cloud VIP
                      </h2>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Kelola seluruh tautan amplop kado interaktif yang telah dibuat pengguna, pantau jumlah buka amplop (views), serta sinkronisasi draft cloud.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => fetchGifts()}
                      disabled={isLoadingGifts}
                      className="adm-btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 14px' }}
                    >
                      <RefreshCw size={14} className={isLoadingGifts ? 'animate-spin' : ''} />
                      <span>{isLoadingGifts ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
                    </button>
                    <Link
                      href="/"
                      target="_blank"
                      className="adm-btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 14px', textDecoration: 'none' }}
                    >
                      <ExternalLink size={14} />
                      <span>Buka Studio Buket</span>
                    </Link>
                  </div>
                </div>

                {/* 3 Metric Cards Ringkasan */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '20px' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      border: '1px solid #fecdd3',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#be123c', fontSize: '0.82rem', fontWeight: 700 }}>
                      <Gift size={16} />
                      <span>Total Hadiah Digital</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#881337', marginTop: '4px' }}>
                      {totalGiftsCount.toLocaleString('id-ID')}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#9f1239' }}>Tautan amplop aktif di database</span>
                  </div>

                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      border: '1px solid #bae6fd',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontSize: '0.82rem', fontWeight: 700 }}>
                      <Eye size={16} />
                      <span>Total Buka Amplop (Views)</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0c4a6e', marginTop: '4px' }}>
                      {totalGiftsViews.toLocaleString('id-ID')}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#0284c7' }}>Akumulasi dibaca oleh penerima</span>
                  </div>

                  <div
                    style={{
                      background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      border: '1px solid #f5d0fe',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7e22ce', fontSize: '0.82rem', fontWeight: 700 }}>
                      <Database size={16} />
                      <span>Draft VIP Terenkripsi</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#581c87', marginTop: '4px' }}>
                      {vipDraftsCount.toLocaleString('id-ID')}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#6b21a8' }}>Autosave AES-256 tersimpan di Cloud</span>
                  </div>
                </div>
              </div>

              {/* Pencarian & Tabel Hadiah Digital */}
              <div className="adm-table-card">
                {/* Search Bar */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
                    <Search
                      size={16}
                      style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                    />
                    <input
                      type="text"
                      value={giftsSearchQuery}
                      onChange={(e) => setGiftsSearchQuery(e.target.value)}
                      placeholder="Cari penerima, pengirim, kata pesan, atau ID..."
                      className="vault-input-field"
                      style={{ paddingLeft: '40px', fontSize: '0.85rem' }}
                    />
                    {giftsSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setGiftsSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-dim)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Menampilkan <strong>{filteredGifts.length}</strong> dari <strong>{giftsList.length}</strong> kado digital
                  </div>
                </div>

                {/* ── TAMPILAN DESKTOP TABLE ── */}
                <div className="adm-desktop-table-wrap">
                  {isLoadingGifts ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block', color: 'var(--primary)' }} />
                      Memuat database kado digital...
                    </div>
                  ) : filteredGifts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💌</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                        {giftsSearchQuery ? 'Tidak ada hadiah yang cocok dengan pencarian' : 'Belum Ada Hadiah Digital Dibuat'}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '6px auto 0 auto' }}>
                        {giftsSearchQuery
                          ? 'Coba ganti kata kunci pencarian Anda.'
                          : 'Setiap kali pengguna merangkai buket dan menekan "Buat Link Hadiah Digital" di Langkah 5, kado akan langsung tersimpan di sini.'}
                      </p>
                    </div>
                  ) : (
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>ID / Slug</th>
                          <th>Pengirim &amp; Penerima</th>
                          <th>Pesan Surat</th>
                          <th>Musik Melodi</th>
                          <th>Buka Amplop</th>
                          <th>Waktu Dibuat</th>
                          <th style={{ textAlign: 'center' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGifts.map((gift) => {
                          const giftUrl = typeof window !== 'undefined'
                            ? `${window.location.origin}/gift/${gift.id}`
                            : `/gift/${gift.id}`;

                          return (
                            <tr key={gift.id}>
                              {/* ID / Kode Kado */}
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span className="adm-code-tag" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                    {gift.id}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(giftUrl);
                                      setCopiedId(gift.id);
                                      setTimeout(() => setCopiedId(null), 2000);
                                    }}
                                    className="adm-btn-action"
                                    title="Salin Tautan Hadiah"
                                  >
                                    {copiedId === gift.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                                  </button>
                                </div>
                              </td>

                              {/* Pengirim & Penerima */}
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ color: '#ec4899' }}>❤️</span>
                                    <span>{gift.recipient || 'Penerima'}</span>
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                    Dari: <strong style={{ color: 'var(--text-dark)' }}>{gift.sender || 'Anonim'}</strong>
                                  </div>
                                </div>
                              </td>

                              {/* Cuplikan Pesan */}
                              <td style={{ maxWidth: '240px' }}>
                                <div
                                  style={{
                                    fontSize: '0.78rem',
                                    fontStyle: 'italic',
                                    color: 'var(--text-muted)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={gift.message || 'Tanpa pesan'}
                                >
                                  &ldquo;{gift.message ? (gift.message.length > 45 ? `${gift.message.slice(0, 45)}...` : gift.message) : 'Tanpa pesan'}&rdquo;
                                </div>
                              </td>

                              {/* Musik */}
                              <td>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                    background: '#fdf2f8',
                                    color: '#be185d',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #fbcfe8',
                                  }}
                                >
                                  <Music size={12} />
                                  <span>{gift.music || 'Default Piano'}</span>
                                </span>
                              </td>

                              {/* Views */}
                              <td>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    color: '#0284c7',
                                    background: '#f0f9ff',
                                    padding: '3px 9px',
                                    borderRadius: '8px',
                                    border: '1px solid #bae6fd',
                                  }}
                                >
                                  <Eye size={13} />
                                  <span>{gift.views || 0}x dibuka</span>
                                </span>
                              </td>

                              {/* Tanggal */}
                              <td style={{ fontSize: '0.76rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                                {gift.createdAt
                                  ? new Date(gift.createdAt).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '-'}
                              </td>

                              {/* Aksi */}
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                  <a
                                    href={`/gift/${gift.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="adm-btn-action"
                                    title="Buka Halaman Hadiah"
                                    style={{ color: '#1d6ff2', textDecoration: 'none' }}
                                  >
                                    <ExternalLink size={14} />
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteGift(gift.id)}
                                    disabled={deletingGiftId === gift.id}
                                    className="adm-btn-action delete"
                                    title="Hapus Kado Permanen"
                                    style={{ color: '#ef4444' }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* ── TAMPILAN SMARTPHONE (MOBILE CARDS VIEW) ── */}
                <div className="adm-mobile-cards-wrap">
                  {isLoadingGifts ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Memuat daftar kado digital...
                    </div>
                  ) : filteredGifts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Tidak ada kado digital yang sesuai pencarian.
                    </div>
                  ) : (
                    filteredGifts.map((gift) => {
                      const giftUrl = typeof window !== 'undefined'
                        ? `${window.location.origin}/gift/${gift.id}`
                        : `/gift/${gift.id}`;

                      return (
                        <div key={gift.id} className="adm-code-card-mobile">
                          {/* Baris Atas: ID + Views */}
                          <div className="adm-code-card-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="adm-code-tag" style={{ fontSize: '0.82rem', padding: '4px 8px' }}>
                                {gift.id}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(giftUrl);
                                  setCopiedId(gift.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  color: 'var(--text-dim)',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Salin Link"
                              >
                                {copiedId === gift.id ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                              </button>
                            </div>

                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: '#f0f9ff',
                                color: '#0284c7',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                border: '1px solid #bae6fd',
                              }}
                            >
                              <Eye size={12} />
                              <span>{gift.views || 0}x</span>
                            </span>
                          </div>

                          {/* Penerima & Pengirim */}
                          <div style={{ margin: '8px 0', fontSize: '0.82rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ color: '#ec4899' }}>❤️ Kepada:</span> {gift.recipient || 'Penerima'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Dari: {gift.sender || 'Anonim'}
                            </div>
                          </div>

                          {/* Cuplikan Pesan */}
                          {gift.message && (
                            <div
                              style={{
                                fontSize: '0.76rem',
                                fontStyle: 'italic',
                                color: 'var(--text-muted)',
                                background: 'var(--bg-subtle)',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                lineHeight: 1.4,
                              }}
                            >
                              &ldquo;{gift.message.length > 80 ? `${gift.message.slice(0, 80)}...` : gift.message}&rdquo;
                            </div>
                          )}

                          {/* Musik & Waktu */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
                            <span>🎵 {gift.music || 'Default Piano'}</span>
                            <span>
                              {gift.createdAt ? new Date(gift.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                            </span>
                          </div>

                          {/* Aksi Cepat */}
                          <div className="adm-code-card-actions">
                            <a
                              href={`/gift/${gift.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="adm-btn-mobile-wa"
                              style={{ textDecoration: 'none', justifyContent: 'center' }}
                            >
                              <ExternalLink size={13} />
                              <span>Buka Kado</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(giftUrl);
                                setCopiedId(gift.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="adm-btn-mobile-toggle"
                            >
                              {copiedId === gift.id ? '✓ Tersalin' : 'Salin Link'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteGift(gift.id)}
                              disabled={deletingGiftId === gift.id}
                              className="adm-btn-mobile-icon delete"
                              title="Hapus Kado"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ===== SIDEBAR KANAN — HANYA TAMPIL DI TAB DASHBOARD ===== */}
        {activeTab === 'dashboard' && (
          <aside className="adm-right-sidebar">
            {/* Top Quick Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)' }}>Status Stok Voucher</span>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                <span title="Token Aktif" style={{ color: '#16a34a' }}>🎫 {stats.active}</span>
                <span title="Token Terpakai" style={{ color: '#1d6ff2' }}>👥 {stats.used}</span>
              </div>
            </div>

            {/* Kartu Status Proteksi Multi-Device Studio (Harga dihilangkan sesuai permintaan) */}
            <div className="adm-promo-card">
              <h4>Proteksi Multi-Device</h4>
              <p>Pelanggan dapat merangkai buket tanpa batas hingga 5 perangkat sekaligus per voucher.</p>
              <span className="adm-promo-badge">
                🔒 Kuota 5 Device Terproteksi
              </span>
              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
                  <span>Voucher Siap Pakai:</span>
                  <strong style={{ color: '#ffffff' }}>{stats.active} Kode</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
                  <span>Telah Diklaim Pembeli:</span>
                  <strong style={{ color: '#ffffff' }}>{stats.used} Pelanggan</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('tokens');
                  handleRandomizeCode();
                }}
                className="adm-btn-site"
                style={{ marginTop: '16px', width: '100%', background: '#ffffff', color: 'var(--primary)', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              >
                + Buat Kode Voucher
              </button>
            </div>

            {/* Panduan Cepat Admin */}
            <div style={{ background: 'var(--bg-subtle)', borderRadius: '16px', padding: '18px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>Panduan Cepat Admin</h4>
              <ul style={{ paddingLeft: '18px', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <li>Gunakan tombol <strong>Salin WA</strong> untuk langsung kirim pesan konfirmasi ke pembeli.</li>
                <li>Satu kode dapat dipakai hingga <strong>5 perangkat</strong> secara bersamaan.</li>
                <li>Jika pembeli berganti perangkat, Anda dapat me-reset atau menaikkan batas perangkat.</li>
              </ul>
            </div>

            {/* Sistem Keamanan Info */}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 'auto' }}>
              <div>Rute: <code>/lys-atelier-vault-89x</code></div>
              <div>Proteksi: <strong>/admin 404 (Tertutup Rapat)</strong></div>
            </div>
          </aside>
        )}
      </div>

      {/* ── MODAL LIHAT DETAIL PERANGKAT ── */}
      {selectedCodeForDevices && (
        <div className="adm-modal-backdrop" onClick={() => setSelectedCodeForDevices(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  Perangkat Terdaftar: {selectedCodeForDevices.code}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                  Pemakai: <strong>{selectedCodeForDevices.used_by_name || 'Belum diklaim'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCodeForDevices(null)}
                style={{
                  background: 'var(--bg-subtle)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            {/* Batas Perangkat */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-subtle)',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span>Batas: </span>
                <strong>
                  {devices.length} / {selectedCodeForDevices.max_devices} perangkat
                </strong>
              </div>

              <div>
                {editingDeviceLimitId === selectedCodeForDevices.id ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      min="1"
                      value={editDeviceLimitVal}
                      onChange={(e) => setEditDeviceLimitVal(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{
                        width: '55px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-input)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateMaxDevices(selectedCodeForDevices.id, editDeviceLimitVal)}
                      style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDeviceLimitId(null)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-input)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDeviceLimitId(selectedCodeForDevices.id);
                      setEditDeviceLimitVal(selectedCodeForDevices.max_devices || 5);
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-input)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Ubah Batas
                  </button>
                )}
              </div>
            </div>

            {/* List Perangkat */}
            {isLoadingDevices ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Memuat data perangkat...
              </div>
            ) : devices.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Belum ada perangkat yang terdaftar untuk kode ini.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {devices.map((dev, idx) => {
                  const info = parseDeviceInfo(dev.user_agent);
                  const isOwner = dev.is_owner || idx === 0;

                  return (
                    <div
                      key={dev.id}
                      style={{
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700 }}>{info.browser}</span>
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>({info.os})</span>
                          {isOwner && (
                            <span style={{ fontSize: '0.68rem', color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              Pemilik Pertama
                            </span>
                          )}
                        </div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: '2px' }}>
                          IP: <code>{dev.ip_address}</code> • Pertama:{' '}
                          {new Date(dev.first_seen_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Slot #{dev.device_slot ?? idx + 1}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
