'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Crown,
  Search,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  Clock,
  History,
  Check,
  AlertCircle,
  Eye,
  Layers,
  FileText,
  Gift,
  Palette,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FLOWERS } from '@/data/flowers';
import { BUCKET_SIZES } from '@/data/buckets';
import { GIFT_TEMPLATES } from '@/components/gift/templates';
import type { VipCategory, VipAuditLogRecord } from '@/lib/vipItems';
import VipItemPreviewModal from './VipItemPreviewModal';

interface CatalogItem {
  id: string;
  name: string;
  category: VipCategory;
  categoryLabel: string;
  thumbnail?: string;
  colorHex?: string;
  badge?: string;
  isVip: boolean;
}

// 4 Opsi Kartu Ucapan Standar
const CARD_ITEMS: CatalogItem[] = [
  {
    id: 'simple',
    name: 'Kartu Minimalis Putih',
    category: 'card',
    categoryLabel: 'Kartu Ucapan',
    colorHex: '#ffffff',
    badge: 'Standard',
    isVip: false,
  },
  {
    id: 'birthday',
    name: 'Pesta Ulang Tahun (Pink Ribbon)',
    category: 'card',
    categoryLabel: 'Kartu Ucapan',
    colorHex: '#fff1f2',
    badge: 'Special Occasion',
    isVip: false,
  },
  {
    id: 'elegant',
    name: 'Luxury Gold Foil (Foil Emas Mewah)',
    category: 'card',
    categoryLabel: 'Kartu Ucapan',
    colorHex: '#fef3c7',
    badge: 'Edisi Mewah',
    isVip: true,
  },
  {
    id: 'graduation',
    name: 'Happy Graduation (Wisuda Spesial)',
    category: 'card',
    categoryLabel: 'Kartu Ucapan',
    colorHex: '#e0e7ff',
    badge: 'Edisi Wisuda',
    isVip: true,
  },
];

interface ToastNotice {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface VipManagementPanelProps {
  adminKey?: string;
}

export default function VipManagementPanel({ adminKey }: VipManagementPanelProps) {
  const [activeCategory, setActiveCategory] = useState<VipCategory>('bucket');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVip, setFilterVip] = useState<'all' | 'vip' | 'non_vip'>('all');
  const [vipCatalog, setVipCatalog] = useState<Record<VipCategory, Record<string, boolean>>>({
    bucket: {},
    flower: {},
    card: {},
    gift_template: {},
  });
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 20;
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [auditLogs, setAuditLogs] = useState<VipAuditLogRecord[]>([]);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [previewItem, setPreviewItem] = useState<CatalogItem | null>(null);

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // ── Ambil data VIP dari server ──
  const fetchVipData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }
      const res = await fetch('/api/admin/vip', {
        headers,
      });

      if (!res.ok) {
        throw new Error('Gagal memuat status VIP admin');
      }

      const data = await res.json();
      if (data.success && data.vipCatalog) {
        setVipCatalog(data.vipCatalog);
        if (Array.isArray(data.logs)) {
          setAuditLogs(data.logs);
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'Koneksi ke server terganggu saat memuat VIP');
    } finally {
      setIsLoading(false);
    }
  }, [adminKey, showToast]);

  useEffect(() => {
    fetchVipData();
  }, [fetchVipData]);

  // ── Transformasi Katalog per Kategori ──
  const allItemsByCategory = useMemo<Record<VipCategory, CatalogItem[]>>(() => {
    // 1. Bucket
    const bucketList: CatalogItem[] = BUCKET_SIZES.map((b) => ({
      id: b.id,
      name: b.label,
      category: 'bucket',
      categoryLabel: 'Pembungkus Buket',
      thumbnail: b.image,
      badge: b.tag || b.themeName || b.colorName,
      isVip: Boolean(vipCatalog.bucket?.[b.id] ?? b.isPremium),
    }));

    // 2. Flower
    const flowerList: CatalogItem[] = FLOWERS.map((f) => ({
      id: f.id,
      name: f.name,
      category: 'flower',
      categoryLabel: 'Bunga',
      thumbnail: f.imageUrl,
      colorHex: f.color,
      badge: f.colorName || f.category,
      isVip: Boolean(vipCatalog.flower?.[f.id] ?? f.isPremium),
    }));

    // 3. Card
    const cardList: CatalogItem[] = CARD_ITEMS.map((c) => ({
      ...c,
      isVip: Boolean(vipCatalog.card?.[c.id] ?? c.isVip),
    }));

    // 4. Gift Templates
    const templateList: CatalogItem[] = Object.values(GIFT_TEMPLATES).map((t) => ({
      id: t.id,
      name: t.name,
      category: 'gift_template',
      categoryLabel: 'Template Kado Digital',
      colorHex: t.colors.primary,
      badge: t.isFree ? 'Tema Terbuka' : 'Eksklusif',
      isVip: Boolean(vipCatalog.gift_template?.[t.id] ?? !t.isFree),
    }));

    return {
      bucket: bucketList,
      flower: flowerList,
      card: cardList,
      gift_template: templateList,
    };
  }, [vipCatalog]);

  // ── Hitungan Total VIP per Kategori ──
  const categoryStats = useMemo(() => {
    const stats: Record<VipCategory, { total: number; vip: number }> = {
      bucket: { total: 0, vip: 0 },
      flower: { total: 0, vip: 0 },
      card: { total: 0, vip: 0 },
      gift_template: { total: 0, vip: 0 },
    };

    (Object.keys(allItemsByCategory) as VipCategory[]).forEach((cat) => {
      const items = allItemsByCategory[cat];
      stats[cat] = {
        total: items.length,
        vip: items.filter((i) => i.isVip).length,
      };
    });

    return stats;
  }, [allItemsByCategory]);

  // ── Filter dan Pencarian pada Kategori Aktif ──
  const currentCategoryItems = allItemsByCategory[activeCategory] || [];

  const filteredItems = useMemo(() => {
    let result = currentCategoryItems;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
      );
    }

    if (filterVip === 'vip') {
      result = result.filter((i) => i.isVip);
    } else if (filterVip === 'non_vip') {
      result = result.filter((i) => !i.isVip);
    }

    return result;
  }, [currentCategoryItems, searchQuery, filterVip]);

  // ── Paginasi Item Katalog (Maksimal 20 Item per Halaman) ──
  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE) || 1;

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredItems, currentPage, PAGE_SIZE]);

  // Bersihkan seleksi dan reset ke halaman 1 jika pindah kategori atau ubah filter
  useEffect(() => {
    setCurrentPage(1);
    setSelectedItemKeys(new Set());
  }, [activeCategory, searchQuery, filterVip]);

  // ── Toggle Status VIP Tunggal (Optimistic UI + Rollback) ──
  const handleToggleVip = async (item: CatalogItem) => {
    const newStatus = !item.isVip;

    // 1. Optimistic Update di State Lokal
    setVipCatalog((prev) => ({
      ...prev,
      [item.category]: {
        ...prev[item.category],
        [item.id]: newStatus,
      },
    }));

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const res = await fetch('/api/admin/vip', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category: item.category,
          item_key: item.id,
          is_vip: newStatus,
          item_name: item.name,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Gagal menyimpan status VIP');
      }

      // Perbarui log audit jika dikembalikan
      if (Array.isArray(resData.logs)) {
        setAuditLogs(resData.logs);
      } else {
        // Fallback optimis tambah 1 log
        setAuditLogs((prev) => [
          {
            category: item.category,
            item_key: item.id,
            item_name: item.name,
            old_status: item.isVip,
            new_status: newStatus,
            changed_by: 'admin',
            created_at: new Date().toISOString(),
          },
          ...prev.slice(0, 19),
        ]);
      }

      showToast(
        'success',
        `"${item.name}" berhasil ${newStatus ? 'dijadikan VIP' : 'diubah ke Non-VIP'}.`
      );
    } catch (err: any) {
      // 2. Rollback ke status semula jika request gagal
      setVipCatalog((prev) => ({
        ...prev,
        [item.category]: {
          ...prev[item.category],
          [item.id]: item.isVip,
        },
      }));

      showToast('error', `Gagal mengubah status: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  // ── Seleksi Bulk ──
  const handleToggleSelect = (itemKey: string) => {
    setSelectedItemKeys((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedItemKeys.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedItemKeys(new Set());
    } else {
      setSelectedItemKeys(new Set(filteredItems.map((i) => i.id)));
    }
  };

  // ── Bulk Update Status VIP ──
  const handleBulkUpdate = async (targetVipStatus: boolean) => {
    if (selectedItemKeys.size === 0) return;

    const itemsToUpdate = filteredItems.filter((i) => selectedItemKeys.has(i.id));
    if (itemsToUpdate.length === 0) return;

    setIsBulkUpdating(true);

    // Optimistic Update
    const prevCatalog = { ...vipCatalog };
    setVipCatalog((prev) => {
      const updatedCat = { ...prev[activeCategory] };
      itemsToUpdate.forEach((i) => {
        updatedCat[i.id] = targetVipStatus;
      });
      return {
        ...prev,
        [activeCategory]: updatedCat,
      };
    });

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) {
        headers['x-admin-key'] = adminKey;
      }

      const bulkPayload = itemsToUpdate.map((i) => ({
        category: i.category,
        item_key: i.id,
        is_vip: targetVipStatus,
        item_name: i.name,
      }));

      const res = await fetch('/api/admin/vip', {
        method: 'POST',
        headers,
        body: JSON.stringify({ bulk: bulkPayload }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Gagal memperbarui item terpilih');
      }

      if (resData.vipCatalog) {
        setVipCatalog(resData.vipCatalog);
      }
      if (Array.isArray(resData.logs)) {
        setAuditLogs(resData.logs);
      }

      showToast(
        'success',
        `${itemsToUpdate.length} item berhasil ${
          targetVipStatus ? 'dijadikan VIP' : 'dinonaktifkan dari VIP'
        }.`
      );
      setSelectedItemKeys(new Set());
    } catch (err: any) {
      // Rollback
      setVipCatalog(prevCatalog);
      showToast('error', `Gagal aksi massal: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <div className="adm-vip-manager">
      {/* ── Toast Notifications Float ── */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              background:
                t.type === 'success'
                  ? 'linear-gradient(135deg, #16a34a, #15803d)'
                  : t.type === 'error'
                  ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'auto',
              animation: 'slideIn 0.25s ease-out',
            }}
          >
            {t.type === 'success' && <Check size={16} />}
            {t.type === 'error' && <AlertCircle size={16} />}
            {t.type === 'info' && <RefreshCw size={16} className="animate-spin" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* ── Header Kelola VIP ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: '18px',
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(49, 46, 129, 0.2)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
              }}
            >
              <Crown size={22} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Kelola Item VIP Katalog
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#c7d2fe', maxWidth: '640px' }}>
            Atur status VIP item buket, bunga, kartu ucapan, dan tema kado secara real-time.
            Perubahan langsung tersimpan di Supabase dan disinkronkan ke editor pelanggan.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchVipData}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          <span>Muat Ulang</span>
        </button>
      </div>

      {/* ── 4 Category Tabs & Counts ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {(
          [
            { key: 'bucket', label: 'Bucket / Pembungkus', icon: Layers, desc: 'Bahan pembungkus buket' },
            { key: 'flower', label: 'Bunga', icon: Sparkles, desc: 'Spesies & varian bunga' },
            { key: 'card', label: 'Kartu Ucapan', icon: FileText, desc: 'Gaya & desain kartu ucapan' },
            { key: 'gift_template', label: 'Kado Digital / Template', icon: Gift, desc: 'Tema landing page kado' },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.key;
          const stats = categoryStats[tab.key];

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              style={{
                background: isActive ? '#ffffff' : '#f8fafc',
                border: isActive ? '2px solid #6366f1' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: isActive ? '0 6px 20px rgba(99, 102, 241, 0.15)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: isActive ? '#e0e7ff' : '#f1f5f9',
                      color: isActive ? '#4338ca' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isActive ? '#1e1b4b' : '#334155' }}>
                    {tab.label}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: stats.vip > 0 ? '#fef3c7' : '#f1f5f9',
                    color: stats.vip > 0 ? '#b45309' : '#64748b',
                  }}
                >
                  <Crown size={11} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
                  {stats.vip} VIP
                </span>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>{tab.desc}</span>
                <span style={{ fontWeight: 600 }}>Total: {stats.total}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar: Search, Filter, Bulk Actions ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', flex: '1 1 320px' }}>
          {/* Input Search */}
          <div
            style={{
              position: 'relative',
              flex: '1 1 200px',
              maxWidth: '340px',
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder={`Cari nama ${activeCategory}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Filter Status VIP */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setFilterVip('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: filterVip === 'all' ? '#ffffff' : 'transparent',
                fontWeight: filterVip === 'all' ? 700 : 500,
                color: filterVip === 'all' ? '#1e293b' : '#64748b',
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: filterVip === 'all' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Semua ({currentCategoryItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterVip('vip')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: filterVip === 'vip' ? '#ffffff' : 'transparent',
                fontWeight: filterVip === 'vip' ? 700 : 500,
                color: filterVip === 'vip' ? '#b45309' : '#64748b',
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: filterVip === 'vip' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Hanya VIP ({currentCategoryItems.filter((i) => i.isVip).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterVip('non_vip')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: filterVip === 'non_vip' ? '#ffffff' : 'transparent',
                fontWeight: filterVip === 'non_vip' ? 700 : 500,
                color: filterVip === 'non_vip' ? '#1e293b' : '#64748b',
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: filterVip === 'non_vip' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Non-VIP ({currentCategoryItems.filter((i) => !i.isVip).length})
            </button>
          </div>
        </div>

        {/* ── Bulk Actions Section ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSelectAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            {selectedItemKeys.size === filteredItems.length && filteredItems.length > 0 ? (
              <CheckSquare size={16} color="#6366f1" />
            ) : (
              <Square size={16} color="#94a3b8" />
            )}
            <span>Pilih Semua ({selectedItemKeys.size})</span>
          </button>

          {selectedItemKeys.size > 0 && (
            <>
              <button
                type="button"
                onClick={() => handleBulkUpdate(true)}
                disabled={isBulkUpdating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: isBulkUpdating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                <Crown size={14} />
                <span>Jadikan VIP ({selectedItemKeys.size})</span>
              </button>

              <button
                type="button"
                onClick={() => handleBulkUpdate(false)}
                disabled={isBulkUpdating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: isBulkUpdating ? 'not-allowed' : 'pointer',
                }}
              >
                <span>Nonaktifkan VIP ({selectedItemKeys.size})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Catalog Item Grid (Responsive HP & Desktop) ── */}
      {filteredItems.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
            padding: '48px 20px',
            textAlign: 'center',
            color: '#64748b',
            marginBottom: '24px',
          }}
        >
          <Search size={32} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b' }}>
            Tidak ada item yang sesuai kriteria pencarian
          </h4>
          <p style={{ margin: 0, fontSize: '0.82rem' }}>
            Coba ubah kata kunci pencarian atau ganti filter status di atas.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '14px',
            marginBottom: '32px',
          }}
        >
          {paginatedItems.map((item) => {
            const isSelected = selectedItemKeys.has(item.id);

            return (
              <div
                key={item.id}
                style={{
                  background: item.isVip ? '#fffdf7' : '#ffffff',
                  border: item.isVip ? '2px solid #fde68a' : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.18s ease',
                  boxShadow: item.isVip ? '0 4px 16px rgba(245, 158, 11, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)',
                  position: 'relative',
                }}
              >
                {/* Header item: Select checkbox + Badge VIP */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelect(item.id);
                    }}
                  >
                    {isSelected ? (
                      <CheckSquare size={18} color="#6366f1" />
                    ) : (
                      <Square size={18} color="#cbd5e1" />
                    )}
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                      {item.id}
                    </span>
                  </label>

                  {item.isVip ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        color: '#92400e',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        border: '1px solid #fcd34d',
                      }}
                    >
                      <Crown size={12} />
                      VIP AKTIF
                    </span>
                  ) : (
                    <span
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}
                    >
                      Standar
                    </span>
                  )}
                </div>

                {/* Body item: Thumbnail & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      background: item.colorHex || '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <Palette size={24} color="#94a3b8" />
                    )}
                  </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4
                        style={{
                          margin: '0 0 4px 0',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: '#64748b',
                              background: '#f8fafc',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                        {(item.category === 'card' || item.category === 'gift_template') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem(item);
                            }}
                            title="Lihat hasil visual kartu atau gift template"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: '#4f46e5',
                              background: '#eef2ff',
                              border: '1px solid #c7d2fe',
                              borderRadius: '4px',
                              padding: '2px 7px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Eye size={12} />
                            Preview Hasil
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                {/* Footer item: Toggle Switch VIP */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: item.isVip ? '#b45309' : '#64748b', fontWeight: 600 }}>
                    {item.isVip ? 'Berbayar / Akses VIP' : 'Bebas Dipilih Pengguna'}
                  </span>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleVip(item)}
                    role="switch"
                    aria-checked={item.isVip}
                    style={{
                      width: '46px',
                      height: '26px',
                      borderRadius: '999px',
                      background: item.isVip ? '#f59e0b' : '#cbd5e1',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '3px',
                        left: item.isVip ? '23px' : '3px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.isVip ? (
                        <Crown size={11} color="#d97706" />
                      ) : (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Navigasi Paginasi (Jika Item > 20) ── */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.83rem', color: '#64748b' }}>
            Menampilkan <strong>{(currentPage - 1) * PAGE_SIZE + 1}</strong> -{' '}
            <strong>{Math.min(currentPage * PAGE_SIZE, filteredItems.length)}</strong> dari{' '}
            <strong>{filteredItems.length}</strong> item • Halaman <strong>{currentPage}</strong> dari{' '}
            <strong>{totalPages}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                color: currentPage === 1 ? '#94a3b8' : '#334155',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={15} />
              <span>Sebelumnya</span>
            </button>

            {/* Nomor Halaman */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
              })
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const hasGap = prev && page - prev > 1;

                return (
                  <span key={page} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {hasGap && <span style={{ padding: '0 4px', color: '#94a3b8', fontSize: '0.8rem' }}>...</span>}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: page === currentPage ? 'none' : '1px solid #e2e8f0',
                        background: page === currentPage ? '#6366f1' : '#ffffff',
                        color: page === currentPage ? '#ffffff' : '#475569',
                        fontWeight: page === currentPage ? 800 : 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}

            <button
              type="button"
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
                color: currentPage === totalPages ? '#94a3b8' : '#334155',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <span>Selanjutnya</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── 20 Riwayat Log Perubahan Terakhir (Audit Log) ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
              Riwayat 20 Perubahan Status VIP Terakhir
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Tersimpan di tabel <code>vip_items_log</code>
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <Clock size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
            Belum ada riwayat perubahan status VIP yang tercatat.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '10px 12px' }}>Waktu</th>
                  <th style={{ padding: '10px 12px' }}>Kategori</th>
                  <th style={{ padding: '10px 12px' }}>Item</th>
                  <th style={{ padding: '10px 12px' }}>Perubahan</th>
                  <th style={{ padding: '10px 12px' }}>Oleh</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 20).map((log, index) => {
                  const dateStr = log.created_at
                    ? new Date(log.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : '-';

                  return (
                    <tr
                      key={log.id || `${log.created_at}_${index}`}
                      style={{
                        borderBottom: '1px solid #f8fafc',
                        background: index % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                    >
                      <td style={{ padding: '10px 12px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.74rem',
                          }}
                        >
                          {log.category}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                        {log.item_name || log.item_key}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ color: log.old_status ? '#b45309' : '#64748b', fontWeight: 600 }}>
                          {log.old_status ? 'VIP' : 'Non-VIP'}
                        </span>
                        <span style={{ margin: '0 6px', color: '#94a3b8' }}>→</span>
                        <span
                          style={{
                            color: log.new_status ? '#b45309' : '#16a34a',
                            fontWeight: 700,
                            background: log.new_status ? '#fef3c7' : '#dcfce7',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {log.new_status ? 'VIP' : 'Non-VIP'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>
                        {log.changed_by || 'admin'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Preview Realistis untuk Kartu & Gift Template */}
      {previewItem && (previewItem.category === 'card' || previewItem.category === 'gift_template') && (
        <VipItemPreviewModal
          type={previewItem.category as 'card' | 'gift_template'}
          itemKey={previewItem.id}
          itemName={previewItem.name}
          isVip={previewItem.isVip}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
}
