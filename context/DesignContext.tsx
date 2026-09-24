'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { DesignState, DesignContextType, TextConfig, FlowerDef, PlacedFlower, CanvasRatio, BackgroundTheme, FlowerCountVariant } from '../types/design';
import { getBucketSize } from '../data/buckets';

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
    bouquetScale: 1.0,
    bouquetRotation: 0,
    flowerPlacementMode: 'inside',
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
  const [selectedFlowerUid, setSelectedFlowerUid] = useState<string | null>(null);
  const [hoveredFlowerUid, setHoveredFlowerUid] = useState<string | null>(null);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState<boolean>(false);
  const [premiumUserName, setPremiumUserName] = useState<string>('');

  // Validasi sesi VIP aktif ke server — jika admin reset/hapus/nonaktifkan kode, VIP seketika dicabut
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
      if (!data.valid || data.revoked) {
        // Cabut VIP seketika dari semua perangkat
        setIsPremiumUnlocked(false);
        setPremiumUserName('');
        try {
          localStorage.removeItem('laysa_premium_unlocked');
          localStorage.removeItem('laysa_premium_user_name');
          localStorage.removeItem('laysa_access_code');
        } catch { /* ignore */ }
      } else if (data.userName && data.userName !== savedName) {
        setPremiumUserName(data.userName);
        try {
          localStorage.setItem('laysa_premium_user_name', data.userName);
        } catch { /* ignore */ }
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

      // Validasi langsung saat pertama kali mount
      validateVipSession();

      // Validasi ulang saat user kembali ke tab ini (focus)
      const onFocus = () => validateVipSession();
      window.addEventListener('focus', onFocus);

      // Cek berkala setiap 25 detik agar jika admin klik reset, device langsung kick
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
        try {
          localStorage.setItem('laysa_premium_unlocked', 'true');
          localStorage.setItem('laysa_access_code', data.code || code.trim().toUpperCase());
          if (data.userName) {
            localStorage.setItem('laysa_premium_user_name', data.userName);
          }
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
    try {
      localStorage.removeItem('laysa_premium_unlocked');
      localStorage.removeItem('laysa_premium_user_name');
      localStorage.removeItem('laysa_access_code');
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
      const maxLimit = prev.targetFlowerCount ?? 50;
      if (prev.selectedFlowers.length >= maxLimit) return prev;

      const newFlower: PlacedFlower = {
        uid: `${flower.id}_${Date.now()}_${Math.random()}`,
        flowerId: flower.id,
        imageUrl: flower.imageUrl,
        category: flower.category,
        order: prev.selectedFlowers.length + 1,
        zIndex: prev.selectedFlowers.length + 1,
        angle: 0, // will be computed on render
        radius: 60 + Math.random() * 30,
        rotation: (Math.random() - 0.5) * 0.4,
        stemVariation: (Math.random() - 0.5) * 0.2,
      };

      return {
        ...prev,
        selectedFlowers: [...prev.selectedFlowers, newFlower],
      };
    });
  }, []);

  const addFlowerAtPosition = useCallback((flower: FlowerDef, x: number, y: number) => {
    setDesign((prev) => {
      const maxLimit = prev.targetFlowerCount ?? 50;
      if (prev.selectedFlowers.length >= maxLimit) return prev;
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
  }, []);

  const removeFlowerByType = useCallback((flowerId: string) => {
    setDesign((prev) => {
      const idx = [...prev.selectedFlowers].reverse().findIndex((f) => f.flowerId === flowerId);
      if (idx === -1) return prev;
      const realIdx = prev.selectedFlowers.length - 1 - idx;
      const newFlowers = prev.selectedFlowers.filter((_, i) => i !== realIdx);
      return { ...prev, selectedFlowers: newFlowers };
    });
  }, []);

  const removeFlowerByUid = useCallback((uid: string) => {
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.filter((f) => f.uid !== uid),
    }));
  }, []);

  const updateFlower = useCallback((uid: string, updates: Partial<PlacedFlower>) => {
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.map((f) =>
        f.uid === uid ? { ...f, ...updates, isManual: true } : f,
      ),
    }));
  }, []);

  const changeFlowerLayer = useCallback(
    (uid: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
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
    [],
  );

  const duplicateFlower = useCallback((uid: string) => {
    setDesign((prev) => {
      const target = prev.selectedFlowers.find((f) => f.uid === uid);
      if (!target) return prev;
      const bucket = getBucketSize(prev.bucketSize);
      if (prev.selectedFlowers.length >= bucket.maxFlowers) return prev;

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
  }, []);

  const resetToAutoLayout = useCallback(() => {
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
  }, []);

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
    setDesign(createDefaultDesign());
  }, []);

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
  }, []);

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
  }, []);

  const setBgTheme = useCallback((theme: BackgroundTheme) => {
    setDesign((prev) => ({ ...prev, bgTheme: theme }));
  }, []);

  const setBouquetScale = useCallback((scale: number) => {
    setDesign((prev) => ({ ...prev, bouquetScale: scale }));
  }, []);

  const setBouquetRotation = useCallback((deg: number) => {
    setDesign((prev) => ({ ...prev, bouquetRotation: deg }));
  }, []);

  const setBucketOffset = useCallback((offset: { x: number; y: number }) => {
    setDesign((prev) => ({ ...prev, bucketOffset: offset }));
  }, []);

  const setFlowerPlacementMode = useCallback((mode: 'inside' | 'front') => {
    setDesign((prev) => ({
      ...prev,
      flowerPlacementMode: mode,
      selectedFlowers: prev.selectedFlowers.map((f) => ({
        ...f,
        layer: mode,
      })),
    }));
  }, []);

  const setFlowerLayer = useCallback((uid: string, layer: 'inside' | 'front') => {
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.map((f) =>
        f.uid === uid ? { ...f, layer } : f
      ),
    }));
  }, []);

  const toggleFlowerLayer = useCallback((uid: string) => {
    setDesign((prev) => ({
      ...prev,
      selectedFlowers: prev.selectedFlowers.map((f) => {
        if (f.uid !== uid) return f;
        const current = f.layer ?? (prev.flowerPlacementMode === 'front' ? 'front' : 'inside');
        const next: 'inside' | 'front' = current === 'front' ? 'inside' : 'front';
        return { ...f, layer: next };
      }),
    }));
  }, []);

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
    hoveredFlowerUid,
    setHoveredFlowerUid,
    setCanvasRatio,
    setBgTheme,
    setBouquetScale,
    setBouquetRotation,
    setBucketOffset,
    saveFinal2D,
    resetToEdit2D,
    isPremiumUnlocked,
    premiumUserName,
    unlockPremium,
    revokePremium,
  };

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign(): DesignContextType {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used within DesignProvider');
  return ctx;
}
