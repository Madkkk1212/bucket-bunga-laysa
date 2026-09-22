'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { DesignState, DesignContextType, TextConfig, FlowerDef, PlacedFlower, CanvasRatio, BackgroundTheme } from '../types/design';
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

const DEFAULT_DESIGN: DesignState = {
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
};

const DesignContext = createContext<DesignContextType | null>(null);

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [design, setDesign] = useState<DesignState>(DEFAULT_DESIGN);
  const [selectedFlowerUid, setSelectedFlowerUid] = useState<string | null>(null);
  const [hoveredFlowerUid, setHoveredFlowerUid] = useState<string | null>(null);

  const setBucketSize = useCallback((id: DesignState['bucketSize']) => {
    setDesign((prev) => ({ ...prev, bucketSize: id }));
  }, []);

  const setWrapperType = useCallback((id: string) => {
    setDesign((prev) => ({ ...prev, wrapperType: id }));
  }, []);

  const addFlower = useCallback((flower: FlowerDef) => {
    setDesign((prev) => {
      // Bebas Tanpa Batas: Allow user to add flowers & fillers freely!
      if (prev.selectedFlowers.length >= 40) return prev;

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
      if (prev.selectedFlowers.length >= 40) return prev;
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
    setDesign(DEFAULT_DESIGN);
  }, []);

  const getFlowerCount = useCallback(
    (flowerId: string) => design.selectedFlowers.filter((f) => f.flowerId === flowerId).length,
    [design.selectedFlowers],
  );

  const getTotalFlowers = useCallback(() => design.selectedFlowers.length, [design.selectedFlowers]);

  const getMaxFlowers = useCallback(
    () => getBucketSize(design.bucketSize).maxFlowers,
    [design.bucketSize],
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

  const value: DesignContextType = {
    design,
    setBucketSize,
    setWrapperType,
    addFlower,
    addFlowerAtPosition,
    removeFlowerByType,
    removeFlowerByUid,
    updateFlower,
    changeFlowerLayer,
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
    saveFinal2D,
    resetToEdit2D,
  };

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign(): DesignContextType {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used within DesignProvider');
  return ctx;
}
