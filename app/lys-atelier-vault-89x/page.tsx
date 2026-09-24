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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tokens' | 'pricing' | 'diagnostics'>('dashboard');
  const [codes, setCodes] = useState<AccessCodeItem[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'used' | 'inactive'>('all');

  // Form Create Code
  const [newCode, setNewCode] = useState<string>('');
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
  const [pricing, setPricing] = useState<PricingState>({
    basePrice: 15000,
    isPromoActive: true,
    promoPrice: 10000,
    promoLabel: 'Promo Terbatas',
  });
  const [isSavingPricing, setIsSavingPricing] = useState<boolean>(false);
  const [pricingMsg, setPricingMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Diagnostics State
  const [diagData, setDiagData] = useState<any>(null);
  const [isLoadingDiag, setIsLoadingDiag] = useState<boolean>(false);

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

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
          basePrice: data.pricing.basePrice ?? 15000,
          isPromoActive: Boolean(data.pricing.isPromoActive),
          promoPrice: data.pricing.promoPrice ?? 10000,
          promoLabel: data.pricing.promoLabel || 'Promo Terbatas',
        });
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchCodes();
      fetchPricing();
    }
  }, [isAuthenticated, fetchCodes, fetchPricing]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'diagnostics') {
      fetchDiagnostics();
    }
  }, [isAuthenticated, activeTab, fetchDiagnostics]);

  // Generate kode acak
  const handleRandomizeCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(`VIP-${rand}`);
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
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFormMsg({ text: `Kode ${newCode.toUpperCase()} berhasil dibuat!`, type: 'success' });
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

  // Perhitungan otomatis diskon persen & hemat rupiah
  const discountStats = useMemo(() => {
    const base = Math.max(0, Number(pricing.basePrice) || 0);
    const promo = Math.max(0, Number(pricing.promoPrice) || 0);

    if (!pricing.isPromoActive || promo >= base || base === 0) {
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
      badge: pricing.promoLabel.trim() || `Diskon ${pct}%`,
    };
  }, [pricing]);

  // Handler ubah persen -> otomatis hitung promoPrice
  const handleDiscountPercentChange = (percentVal: number) => {
    const pct = Math.max(0, Math.min(99, percentVal));
    const base = Number(pricing.basePrice) || 10000;
    const computedPromo = Math.round((base * (100 - pct)) / 100);
    setPricing((prev) => ({
      ...prev,
      promoPrice: computedPromo,
      promoLabel: pct > 0 ? `Diskon ${pct}%` : 'Promo Terbatas',
    }));
  };

  // Handler ubah promoPrice -> otomatis hitung persen
  const handlePromoPriceChange = (priceVal: number) => {
    const promo = Math.max(0, priceVal);
    const base = Number(pricing.basePrice) || 10000;
    const pct = base > promo ? Math.round(((base - promo) / base) * 100) : 0;
    setPricing((prev) => ({
      ...prev,
      promoPrice: promo,
      promoLabel: pct > 0 ? `Hemat ${pct}%` : prev.promoLabel,
    }));
  };

  // Simpan harga ke backend
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
        body: JSON.stringify(pricing),
      });
      const data = await res.json();

      if (data.success) {
        setPricingMsg({ text: '✓ Harga dan diskon promo berhasil disimpan!', type: 'success' });
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

  // Salin ke clipboard
  const handleCopy = (codeStr: string, id: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Salin template WA
  const handleCopyWaTemplate = (codeStr: string) => {
    const text = `Halo kak! Terima kasih atas pemesanan Akses VIP Studio Buket Laysa.\n\nBerikut kode akses eksklusif Anda:\n👉 *${codeStr}*\n\nCara pakai:\n1. Buka website Studio Buket kami\n2. Klik "Buka VIP" lalu masukkan kode di atas\n3. Ketik nama kamu, dan seluruh bunga & bucket premium langsung aktif selamanya! 🌸✨`;
    navigator.clipboard.writeText(text);
    alert(`Pesan WhatsApp untuk kode "${codeStr}" berhasil disalin.`);
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

  // ═════════════════════════════════════════════════════════════
  // VIEW A: LOGIN SESUAI GAYA LOGINUI.HTML (UNAUTHENTICATED)
  // ═════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="loginui-page-wrapper">
        <div className="container">
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
    <div className="vault-wrapper">
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
              onClick={() => setActiveTab('pricing')}
              className={`adm-nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
            >
              <Tag size={17} />
              <span>Atur Harga & Promo</span>
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

              {/* 3 Kartu Statistik (Harga dihilangkan sesuai permintaan) */}
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
                          <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            Memuat daftar kode...
                          </td>
                        </tr>
                      ) : filteredCodes.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
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
                                    onClick={() => handleCopyWaTemplate(item.code)}
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
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              TAB 2: ATUR HARGA & DISKON PROMO
              ═══════════════════════════════════════════ */}
          {activeTab === 'pricing' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
              <div className="adm-form-card">
                <div className="adm-form-card-header">
                  <div className="adm-form-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 className="adm-card-title">Pengaturan Harga &amp; Diskon Persen</h3>
                    <p className="adm-card-sub">
                      Atur nominal harga asli, persen diskon promo, atau tentukan harga akhir yang dibayar pembeli.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSavePricing}>
                  <div className="vault-input-group">
                    <label className="vault-input-label">Harga Asli / Normal (Rp)</label>
                    <input
                      type="number"
                      step="1000"
                      value={pricing.basePrice}
                      onChange={(e) => {
                        const newBase = Math.max(0, parseInt(e.target.value) || 0);
                        setPricing((prev) => {
                          const promo = prev.promoPrice > newBase ? newBase : prev.promoPrice;
                          return { ...prev, basePrice: newBase, promoPrice: promo };
                        });
                      }}
                      className="vault-input-field"
                      placeholder="85000"
                    />
                  </div>

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
                        checked={pricing.isPromoActive}
                        onChange={(e) => setPricing({ ...pricing, isPromoActive: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <span>Aktifkan Harga Promo / Diskon Spesial</span>
                    </label>
                  </div>

                  {pricing.isPromoActive && (
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
                            {[10, 25, 50, 70, 80, 85].map((pct) => (
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
                          value={pricing.promoPrice}
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
                            Pembeli hemat <strong>Rp {discountStats.savingRupiah.toLocaleString('id-ID')}</strong> (dari Rp {pricing.basePrice.toLocaleString('id-ID')} menjadi <strong>Rp {pricing.promoPrice.toLocaleString('id-ID')}</strong>).
                          </div>
                        </div>
                      )}

                      {/* Input Label Badge Promo */}
                      <div>
                        <label className="vault-input-label">Teks Badge Promo</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={pricing.promoLabel}
                            onChange={(e) => setPricing({ ...pricing, promoLabel: e.target.value })}
                            placeholder="Cth: Promo Terbatas atau Diskon 80%"
                            className="vault-input-field"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const autoLabel = discountStats.percent > 0 ? `Hemat ${discountStats.percent}%` : 'Promo Terbatas';
                              setPricing((prev) => ({ ...prev, promoLabel: autoLabel }));
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
                    <span>{isSavingPricing ? 'Menyimpan...' : 'Simpan Harga & Diskon'}</span>
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
                    <h3 className="adm-card-title">Pratinjau Tampilan Web</h3>
                    <p className="adm-card-sub">Simulasi langsung tampilan harga di modal pengunjung studio.</p>
                  </div>
                </div>

                <div style={{ padding: '24px 26px' }}>
                  <div
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderRadius: '18px',
                      padding: '28px 24px',
                      textAlign: 'center',
                      maxWidth: '360px',
                      margin: '0 auto',
                      boxShadow: '0 4px 16px rgba(100, 130, 200, 0.05)',
                    }}
                  >
                  <div style={{ marginBottom: '12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#ffe8ec',
                        color: '#f43f5e',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {discountStats.hasDiscount ? (pricing.promoLabel || `Hemat ${discountStats.percent}%`) : '1x Bayar • Selamanya'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Akses VIP Selamanya
                  </div>

                  <div style={{ margin: '12px 0 6px' }}>
                    {discountStats.hasDiscount && (
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-dim)', textDecoration: 'line-through', marginBottom: '2px' }}>
                        Rp {pricing.basePrice.toLocaleString('id-ID')}
                      </div>
                    )}
                    <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                      Rp {discountStats.finalPrice.toLocaleString('id-ID')}
                    </div>
                  </div>

                  {discountStats.hasDiscount && (
                    <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginBottom: '16px' }}>
                      Hemat Rp {discountStats.savingRupiah.toLocaleString('id-ID')} ({discountStats.percent}%)
                    </div>
                  )}

                  <div
                    style={{
                      background: 'var(--primary)',
                      color: '#ffffff',
                      padding: '12px',
                      borderRadius: '30px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    Beli Kode via WhatsApp
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
