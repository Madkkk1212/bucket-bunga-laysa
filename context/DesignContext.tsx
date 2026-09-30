'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { DesignState, DesignContextType, TextConfig, FlowerDef, PlacedFlower, CanvasRatio, BackgroundTheme, FlowerCountVariant, ExportResolution } from '../types/design';
import { getBucketSize } from '../data/buckets';
import { FLOWERS } from '../data/flowers';

const DEFAULT_TEXT: TextConfig = {
  content: '',
  font: 'Montserrat',
  size: 32,
  color: '#4A2515',
  position: 'bottom',
  weight: 'normal',
  opacity: 1,
  cardScale: 1.0,
};

function createDefaultDesign(): DesignState {
  return {
    id: `prod_${Date.now()}`,
    name: 'Buket Bunga Eksklusif',
    bucketSize: 'bucket-1',
    wrapperType: 'matte',
    selectedFlowers: [
      { uid: 'init-1', flowerId: 'aster_purple', imageUrl: '/images/flowers/aster_purple.png', category: 'filler', order: 1, zIndex: 1, angle: -0.35, radius: 80, rotation: -0.2, stemVariation: 0 },
      { uid: 'init-2', flowerId: 'aster_purple', imageUrl: '/images/flowers/aster_purple.png', category: 'filler', order: 2, zIndex: 2, angle: 0.35, radius: 80, rotation: 0.2, stemVariation: 0 },
      { uid: 'init-3', flowerId: 'chrysanthemum_pink', imageUrl: '/images/flowers/chrysanthemum_pink.png', category: 'main', order: 3, zIndex: 3, angle: -0.15, radius: 50, rotation: -0.08, stemVariation: 0 },
      { uid: 'init-4', flowerId: 'chrysanthemum_pink', imageUrl: '/images/flowers/chrysanthemum_pink.png', category: 'main', order: 4, zIndex: 4, angle: 0.15, radius: 50, rotation: 0.08, stemVariation: 0 },
      { uid: 'init-5', flowerId: 'chrysanthemum_pink', imageUrl: '/images/flowers/chrysanthemum_pink.png', category: 'main', order: 5, zIndex: 5, angle: 0, radius: 30, rotation: 0, stemVariation: 0 },
    ],
    text: DEFAULT_TEXT,
    currentStep: 1,
    final2D: {
      image: null,
      width: 600,
      height: 600,
      status: 'draft',
    },
    canvasRatio: '1:1',
    bgTheme: 'studio-warm',
    customBgImage: null,
    bouquetScale: 1.0,
    bouquetRotation: 0,
    flowerPlacementMode: 'front',
    bucketOffset: { x: 0, y: 0 },
    targetFlowerCount: 25,
  };
}

const DesignContext = createContext<DesignContextType | null>(null);

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem('laysa_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem('laysa_device_id', id);
    }
    return id;
  } catch {
    return '';
  }
}

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [design, setDesign] = useState<DesignState>(createDefaultDesign);
  // ─── UNDO HISTORY STACK ─────────────────────────────────────────────────
  const historyRef = useRef<DesignState[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const MAX_HISTORY = 35;

  const recordSnapshot = useCallback((customSnapshot?: DesignState) => {
    if (customSnapshot) {
      historyRef.current = [JSON.parse(JSON.stringify(customSnapshot)), ...historyRef.current].slice(0, MAX_HISTORY);
      setCanUndo(true);
    } else {
      setDesign((current) => {
        historyRef.current = [JSON.parse(JSON.stringify(current)), ...historyRef.current].slice(0, MAX_HISTORY);
        setCanUndo(true);
        return current;
      });
    }
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const [prev, ...rest] = historyRef.current;
    historyRef.current = rest;
    setCanUndo(rest.length > 0);
    setDesign(prev);
  }, []);

  const [selectedFlowerUid, setSelectedFlowerUidState] = useState<string | null>(null);
  const [isBucketSelected, setIsBucketSelectedState] = useState<boolean>(false);

  const setSelectedFlowerUid = useCallback((uid: string | null) => {
    setSelectedFlowerUidState(uid);
    if (uid) {
      setIsBucketSelectedState(false);
    }
  }, []);

  const setIsBucketSelected = useCallback((selected: boolean) => {
    setIsBucketSelectedState(selected);
    if (selected) {
      setSelectedFlowerUidState(null);
    }
  }, []);

  const [hoveredFlowerUid, setHoveredFlowerUid] = useState<string | null>(null);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState<boolean>(false);
  const [premiumUserName, setPremiumUserName] = useState<string>('');
  const [premiumTier, setPremiumTier] = useState<'daily' | 'weekly' | 'lifetime' | null>(null);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<string | null>(null);
  const [hasGardenAccess, setHasGardenAccess] = useState<boolean>(false);
  const [isFlowerLimitModalOpen, setIsFlowerLimitModalOpen] = useState<boolean>(false);
  const [exportResolution, setExportResolution] = useState<ExportResolution>('4k');
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState<string | null>(null);

  // ── Auto-restore draft from LocalStorage on mount ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const localDraft = localStorage.getItem('laysa_bouquet_draft');
      if (localDraft) {
        const parsed = JSON.parse(localDraft);
        if (parsed && Array.isArray(parsed.selectedFlowers)) {
          setDesign(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Auto-save draft: LocalStorage (all users) & Supabase Encrypted Cloud Vault (VIP only) ──
  const localSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const cloudSaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (localSaveTimer.current) clearTimeout(localSaveTimer.current);
    localSaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem('laysa_bouquet_draft', JSON.stringify(design));
      } catch {
        // ignore
      }
    }, 1000);

    if (isPremiumUnlocked) {
      const code = localStorage.getItem('laysa_access_code') || '';
      if (code) {
        setCloudSyncStatus('saving');
        if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
        cloudSaveTimer.current = setTimeout(async () => {
          try {
            const deviceId = getOrCreateDeviceId();
            const res = await fetch('/api/vip/drafts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code,
                deviceId,
                userName: premiumUserName,
                draft: design,
              }),
            });
            const data = await res.json();
            if (data.success) {
              setCloudSyncStatus('saved');
              setLastCloudSavedAt(data.savedAt || new Date().toISOString());
            } else {
              setCloudSyncStatus('error');
            }
          } catch {
            setCloudSyncStatus('error');
          }
        }, 2500);
      }
    }

    return () => {
      if (localSaveTimer.current) clearTimeout(localSaveTimer.current);
      if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    };
  }, [design, isPremiumUnlocked, premiumUserName]);

  // Validasi sesi VIP aktif ke server — jika admin reset/hapus/nonaktifkan/expired kode, VIP seketika dicabut
  const validateVipSession = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('laysa_premium_unlocked');
      const savedCode = localStorage.getItem('laysa_access_code');
      const savedName = localStorage.getItem('laysa_premium_user_name');

      if (saved !== 'true' || !savedCode) return;

      const deviceId = getOrCreateDeviceId();
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: savedCode,
          userName: savedName || '',
          deviceId,
          checkSession: true,
        }),
      });

      const data = await res.json();
      if (!data.valid || data.revoked || data.expired) {
        // Cabut VIP seketika dari semua perangkat jika dicabut / habis masa aktif
        setIsPremiumUnlocked(false);
        setPremiumUserName('');
        setPremiumTier(null);
        setPremiumExpiresAt(null);
        setHasGardenAccess(false);
        try {
          localStorage.removeItem('laysa_premium_unlocked');
          localStorage.removeItem('laysa_premium_user_name');
          localStorage.removeItem('laysa_access_code');
          localStorage.removeItem('laysa_premium_tier');
          localStorage.removeItem('laysa_premium_expires_at');
          localStorage.removeItem('laysa_premium_garden_access');
        } catch { /* ignore */ }
      } else {
        if (data.tier) {
          setPremiumTier(data.tier);
          try { localStorage.setItem('laysa_premium_tier', data.tier); } catch { /* ignore */ }
        }
        if (data.expiresAt !== undefined) {
          setPremiumExpiresAt(data.expiresAt);
          try {
            if (data.expiresAt) localStorage.setItem('laysa_premium_expires_at', data.expiresAt);
            else localStorage.removeItem('laysa_premium_expires_at');
          } catch { /* ignore */ }
        }
        if (data.hasGardenAccess !== undefined) {
          setHasGardenAccess(Boolean(data.hasGardenAccess));
          try { localStorage.setItem('laysa_premium_garden_access', data.hasGardenAccess ? 'true' : 'false'); } catch { /* ignore */ }
        }
        if (data.userName && data.userName !== savedName) {
          setPremiumUserName(data.userName);
          try {
            localStorage.setItem('laysa_premium_user_name', data.userName);
          } catch { /* ignore */ }
        }
      }
    } catch {
      // Jika offline, pertahankan status lokal
    }
  }, []);

  // Load status awal + pasang listener periodic & window focus
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('laysa_premium_unlocked');
      if (saved === 'true') {
        setIsPremiumUnlocked(true);
      }
      const savedName = localStorage.getItem('laysa_premium_user_name');
      if (savedName) {
        setPremiumUserName(savedName);
      }
      const savedTier = localStorage.getItem('laysa_premium_tier') as any;
      if (savedTier) {
        setPremiumTier(savedTier);
      }
      const savedExp = localStorage.getItem('laysa_premium_expires_at');
      if (savedExp) {
        setPremiumExpiresAt(savedExp);
      }
      const savedGarden = localStorage.getItem('laysa_premium_garden_access');
      if (savedGarden === 'true') {
        setHasGardenAccess(true);
      }

      // Validasi langsung saat pertama kali mount
      validateVipSession();

      // Validasi ulang saat user kembali ke tab ini (focus)
      const onFocus = () => validateVipSession();
      window.addEventListener('focus', onFocus);

      // Cek berkala setiap 25 detik agar jika admin klik reset/expired, device langsung kick
      const interval = setInterval(validateVipSession, 25000);

      return () => {
        window.removeEventListener('focus', onFocus);
        clearInterval(interval);
      };
    } catch {
      // Ignore localStorage errors
    }
  }, [validateVipSession]);

  const unlockPremium = useCallback(async (code: string, userName?: string) => {
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userName, deviceId }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsPremiumUnlocked(true);
        if (data.userName) {
          setPremiumUserName(data.userName);
        }
        if (data.tier) {
          setPremiumTier(data.tier);
        }
        if (data.expiresAt) {
          setPremiumExpiresAt(data.expiresAt);
        }
        setHasGardenAccess(Boolean(data.hasGardenAccess));

        try {
          localStorage.setItem('laysa_premium_unlocked', 'true');
          localStorage.setItem('laysa_access_code', data.code || code.trim().toUpperCase());
          if (data.userName) {
            localStorage.setItem('laysa_premium_user_name', data.userName);
          }
          if (data.tier) {
            localStorage.setItem('laysa_premium_tier', data.tier);
          }
          if (data.expiresAt) {
            localStorage.setItem('laysa_premium_expires_at', data.expiresAt);
          }
          localStorage.setItem('laysa_premium_garden_access', data.hasGardenAccess ? 'true' : 'false');
        } catch {
          // Ignore
        }
        return { success: true, message: data.message, userName: data.userName };
      }
      return { success: false, message: data.message || 'Kode tidak valid.' };
    } catch {
      return { success: false, message: 'Gagal menghubungi server verifikasi kode.' };
    }
  }, []);

  const revokePremium = useCallback(() => {
    setIsPremiumUnlocked(false);
    setPremiumUserName('');
    setPremiumTier(null);
    setPremiumExpiresAt(null);
    setHasGardenAccess(false);
    try {
      localStorage.removeItem('laysa_premium_unlocked');
      localStorage.removeItem('laysa_premium_user_name');
      localStorage.removeItem('laysa_access_code');
      localStorage.removeItem('laysa_premium_tier');
      localStorage.removeItem('laysa_premium_expires_at');
      localStorage.removeItem('laysa_premium_garden_access');
    } catch {
      // Ignore
    }
  }, []);

  const setBucketSize = useCallback((id: DesignState['bucketSize']) => {
    setDesign((prev) => ({ ...prev, bucketSize: id }));
  }, []);

  const setWrapperType = useCallback((id: string) => {
    setDesign((prev) => ({ ...prev, wrapperType: id }));
  }, []);

  const setTargetFlowerCount = useCallback((count: FlowerCountVariant) => {
    setDesign((prev) => {
      let flowers = prev.selectedFlowers;
      if (flowers.length > count) {
        flowers = flowers.slice(0, count);
      }
      return {
        ...prev,
        targetFlowerCount: count,
        selectedFlowers: flowers,
      };
    });
  }, []);

  const addFlower = useCallback((flower: FlowerDef) => {
    setDesign((prev) => {
      const maxLimit = prev.targetFlowerCount ?? 25;
      if (prev.selectedFlowers.length >= maxLimit) {
        setIsFlowerLimitModalOpen(true);
        return prev;
      }

      recordSnapshot();
      const newFlower: PlacedFlower = {
        uid: `${flower.id}_${Date.now()}_${Math.random()}`,
        flowerId: flower.id,
        imageUrl: flower.imageUrl,
        category: flower.category,
        order: prev.selectedFlowers.length + 1,
        zIndex: prev.selectedFlowers.length + 1,
        angle: 0,
        radius: 60 + Math.random() * 30,
        rotation: (Math.random() - 0.5) * 0.4,
        stemVariation: (Math.random() - 0.5) * 0.2,
      };

      return {
        ...prev,
        selectedFlowers: [...prev.selectedFlowers, newFlower],
      };
    });
  }, [recordSnapshot]);

  const addFlowerAtPosition = useCallback((flower: FlowerDef, x: number, y: number) => {
    setDesign((prev) => {
      const maxLimit = prev.targetFlowerCount ?? 25;
      if (prev.selectedFlowers.length >= maxLimit) {
        setIsFlowerLimitModalOpen(true);
        return prev;
      }

      recordSnapshot();
      const newFlower: PlacedFlower = {
        uid: `${flower.id}_${Date.now()}_${Math.random()}`,
        flowerId: flower.id,
        imageUrl: flower.imageUrl,
        category: flower.category,
        order: prev.selectedFlowers.length + 1,
        zIndex: prev.selectedFlowers.length + 1,
        angle: 0,
        radius: 60 + Math.random() * 30,
        rotation: (Math.random() - 0.5) * 0.4,
        stemVariation: (Math.random() - 0.5) * 0.2,
        x,
        y,
        isManual: true,
      };
      return { ...prev, selectedFlowers: [...prev.selectedFlowers, newFlower] };
    });
  }, [recordSnapshot]);

  const removeFlowerByType = useCallback((flowerId: string) => {
    recordSnapshot();
    setDesign((prev) => {
      const idx = [...prev.selectedFlowers].reverse().findIndex((f) => f.flowerId === flowerId);
      if (idx === -1) return prev;
      const realIdx = prev.selectedFlowers.length - 1 - idx;
      const newFlowers = prev.selectedFlowers.filter((_, i) => i !== realIdx);
      return { ...prev, selectedFlowers: newFlowers };
    });
  }, [recordSnapshot]);

  const removeFlowerByUid = useCallback((uid: string) => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.filter((f) => f.uid !== uid),
    }));
  }, [recordSnapshot]);

  const updateFlower = useCallback((uid: string, updates: Partial<PlacedFlower>) => {
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.map((f) =>
        f.uid === uid ? { ...f, ...updates, isManual: true } : f,
      ),
    }));
  }, []);

  const nudgeFlower = useCallback((uid: string, dx: number, dy: number) => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.map((f) => {
        if (f.uid !== uid) return f;
        const currentX = f.x ?? 300;
        const currentY = f.y ?? 260;
        return {
          ...f,
          x: Math.round(currentX + dx),
          y: Math.round(currentY + dy),
          isManual: true,
        };
      }),
    }));
  }, [recordSnapshot]);

  const changeFlowerLayer = useCallback(
    (uid: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
      recordSnapshot();
      setDesign((prev) => {
        const index = prev.selectedFlowers.findIndex((f) => f.uid === uid);
        if (index === -1) return prev;
        const list = [...prev.selectedFlowers];
        const [item] = list.splice(index, 1);

        if (direction === 'top') {
          list.push(item);
        } else if (direction === 'bottom') {
          list.unshift(item);
        } else if (direction === 'up') {
          const target = Math.min(list.length, index + 1);
          list.splice(target, 0, item);
        } else if (direction === 'down') {
          const target = Math.max(0, index - 1);
          list.splice(target, 0, item);
        }

        // Reassign zIndex sequence
        const updatedList = list.map((f, i) => ({
          ...f,
          zIndex: (i + 1) * 2,
        }));

        return { ...prev, selectedFlowers: updatedList };
      });
    },
    [recordSnapshot],
  );

  const duplicateFlower = useCallback((uid: string) => {
    setDesign((prev) => {
      const target = prev.selectedFlowers.find((f) => f.uid === uid);
      if (!target) return prev;
      const maxLimit = prev.targetFlowerCount ?? getBucketSize(prev.bucketSize).maxFlowers;
      if (prev.selectedFlowers.length >= maxLimit) {
        setIsFlowerLimitModalOpen(true);
        return prev;
      }

      recordSnapshot();
      const newFlower: PlacedFlower = {
        ...target,
        uid: `${target.flowerId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: target.x !== undefined ? target.x + 20 : undefined,
        y: target.y !== undefined ? target.y - 15 : undefined,
        isManual: target.isManual ?? false,
      };

      return {
        ...prev,
        selectedFlowers: [...prev.selectedFlowers, newFlower],
      };
    });
  }, [recordSnapshot]);

  const resetToAutoLayout = useCallback(() => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.map((f) => ({
        ...f,
        x: undefined,
        y: undefined,
        size: undefined,
        customRotation: undefined,
        isManual: false,
      })),
    }));
  }, [recordSnapshot]);

  const setText = useCallback((textUpdate: Partial<TextConfig>) => {
    setDesign((prev) => ({
      ...prev,
      text: { ...prev.text, ...textUpdate },
    }));
  }, []);

  const setStep = useCallback((step: number) => {
    setDesign((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const resetDesign = useCallback(() => {
    recordSnapshot();
    setDesign(createDefaultDesign());
  }, [recordSnapshot]);

  const getFlowerCount = useCallback(
    (flowerId: string) => design.selectedFlowers.filter((f) => f.flowerId === flowerId).length,
    [design.selectedFlowers],
  );

  const getTotalFlowers = useCallback(() => design.selectedFlowers.length, [design.selectedFlowers]);

  const getMaxFlowers = useCallback(
    () => design.targetFlowerCount ?? getBucketSize(design.bucketSize).maxFlowers ?? 25,
    [design.targetFlowerCount, design.bucketSize],
  );

  const moveFlower = useCallback((uid: string, toIndex: number) => {
    recordSnapshot();
    setDesign((prev) => {
      const flowers = [...prev.selectedFlowers];
      const fromIndex = flowers.findIndex((f) => f.uid === uid);
      if (fromIndex === -1 || toIndex < 0 || toIndex >= flowers.length) return prev;
      const [item] = flowers.splice(fromIndex, 1);
      flowers.splice(toIndex, 0, item);
      return {
        ...prev,
        selectedFlowers: flowers.map((f, i) => ({ ...f, zIndex: (i + 1) * 2 })),
      };
    });
  }, [recordSnapshot]);

  const saveFinal2D = useCallback((imageDataUrl: string, width: number = 600, height: number = 600) => {
    setDesign((prev) => ({
      ...prev,
      final2D: {
        image: imageDataUrl,
        width,
        height,
        status: 'final',
        savedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const resetToEdit2D = useCallback(() => {
    setDesign((prev) => ({
      ...prev,
      final2D: {
        ...prev.final2D,
        status: 'draft',
      },
      currentStep: 2, // Return to 2D arrangement step
    }));
  }, []);

  const setCanvasRatio = useCallback((ratio: CanvasRatio) => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      canvasRatio: ratio,
      // Reset manual coordinates so flowers automatically re-arrange to the new ratio's center bouquet
      selectedFlowers: prev.selectedFlowers.map((f) => ({
        ...f,
        x: undefined,
        y: undefined,
        isManual: false,
      })),
    }));
  }, [recordSnapshot]);

  const setBgTheme = useCallback((theme: BackgroundTheme) => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      bgTheme: theme,
      // If user chose a non-custom theme, clear customBgImage
      customBgImage: theme === 'custom' ? prev.customBgImage : null,
    }));
  }, [recordSnapshot]);

  const setCustomBgImage = useCallback((url: string | null) => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      customBgImage: url,
      bgTheme: url ? 'custom' : (prev.bgTheme === 'custom' ? 'studio-warm' : prev.bgTheme),
    }));
  }, [recordSnapshot]);

  const manualCloudSave = useCallback(async (): Promise<boolean> => {
    if (!isPremiumUnlocked) return false;
    const code = localStorage.getItem('laysa_access_code') || '';
    if (!code) return false;
    setCloudSyncStatus('saving');
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch('/api/vip/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          deviceId,
          userName: premiumUserName,
          draft: design,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCloudSyncStatus('saved');
        setLastCloudSavedAt(data.savedAt || new Date().toISOString());
        return true;
      }
      setCloudSyncStatus('error');
      return false;
    } catch {
      setCloudSyncStatus('error');
      return false;
    }
  }, [isPremiumUnlocked, premiumUserName, design]);

  const setBouquetScale = useCallback((scale: number) => {
    recordSnapshot();
    setDesign((prev) => ({ ...prev, bouquetScale: scale }));
  }, [recordSnapshot]);

  const setBouquetRotation = useCallback((deg: number) => {
    recordSnapshot();
    setDesign((prev) => ({ ...prev, bouquetRotation: deg }));
  }, [recordSnapshot]);

  const setBucketOffset = useCallback((offset: { x: number; y: number }) => {
    setDesign((prev) => ({ ...prev, bucketOffset: offset }));
  }, []);

  const setFlowerPlacementMode = useCallback((mode: 'inside' | 'front') => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      flowerPlacementMode: mode,
      selectedFlowers: prev.selectedFlowers.map((f) => ({
        ...f,
        layer: mode,
      })),
    }));
  }, [recordSnapshot]);

  const setFlowerLayer = useCallback((uid: string, layer: 'inside' | 'front') => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.map((f) =>
        f.uid === uid ? { ...f, layer } : f
      ),
    }));
  }, [recordSnapshot]);

  const toggleFlowerLayer = useCallback((uid: string) => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.map((f) => {
        if (f.uid !== uid) return f;
        const current = f.layer ?? (prev.flowerPlacementMode === 'front' ? 'front' : 'inside');
        const next: 'inside' | 'front' = current === 'front' ? 'inside' : 'front';
        return { ...f, layer: next };
      }),
    }));
  }, [recordSnapshot]);

  const clearAllFlowers = useCallback(() => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: [],
    }));
  }, [recordSnapshot]);

  const randomizeFlowers = useCallback(() => {
    recordSnapshot();
    setDesign((prev) => {
      const targetCount = prev.targetFlowerCount ?? 25;
      const available = FLOWERS.filter((f) => !f.isPremium || isPremiumUnlocked);
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      // Pick 3-5 harmonious species
      const speciesCount = Math.min(shuffled.length, Math.max(3, Math.min(5, Math.ceil(targetCount / 5))));
      const chosenSpecies = shuffled.slice(0, speciesCount);

      const newFlowers: PlacedFlower[] = [];
      for (let i = 0; i < targetCount; i++) {
        const species = chosenSpecies[i % chosenSpecies.length];
        newFlowers.push({
          uid: `${species.id}_rnd_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          flowerId: species.id,
          imageUrl: species.imageUrl,
          category: species.category,
          order: i + 1,
          zIndex: (i + 1) * 2,
          angle: 0,
          radius: 50 + Math.random() * 40,
          rotation: (Math.random() - 0.5) * 0.4,
          stemVariation: (Math.random() - 0.5) * 0.2,
          isManual: false,
        });
      }

      return {
        ...prev,
        selectedFlowers: newFlowers,
      };
    });
  }, [isPremiumUnlocked]);

  const applyFlowerFormation = useCallback((newFlowers: PlacedFlower[]) => {
    recordSnapshot();
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: newFlowers,
    }));
  }, [recordSnapshot]);

  const value: DesignContextType = {
    design,
    setBucketSize,
    setWrapperType,
    setTargetFlowerCount,
    addFlower,
    addFlowerAtPosition,
    removeFlowerByType,
    removeFlowerByUid,
    updateFlower,
    changeFlowerLayer,
    toggleFlowerLayer,
    setFlowerLayer,
    setFlowerPlacementMode,
    duplicateFlower,
    resetToAutoLayout,
    setText,
    setStep,
    resetDesign,
    getFlowerCount,
    getTotalFlowers,
    getMaxFlowers,
    moveFlower,
    selectedFlowerUid,
    setSelectedFlowerUid,
    isBucketSelected,
    setIsBucketSelected,
    hoveredFlowerUid,
    setHoveredFlowerUid,
    setCanvasRatio,
    setBgTheme,
    setCustomBgImage,
    exportResolution,
    setExportResolution,
    cloudSyncStatus,
    lastCloudSavedAt,
    manualCloudSave,
    setBouquetScale,
    setBouquetRotation,
    setBucketOffset,
    saveFinal2D,
    resetToEdit2D,
    isPremiumUnlocked,
    premiumUserName,
    premiumTier,
    premiumExpiresAt,
    hasGardenAccess,
    unlockPremium,
    revokePremium,
    randomizeFlowers,
    applyFlowerFormation,
    clearAllFlowers,
    undo,
    canUndo,
    nudgeFlower,
    recordSnapshot,
    isFlowerLimitModalOpen,
    setIsFlowerLimitModalOpen,
  };

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useOptionalDesign(): DesignContextType | null {
  return useContext(DesignContext);
}

export function useDesign(): DesignContextType {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used within DesignProvider');
  return ctx;
}

