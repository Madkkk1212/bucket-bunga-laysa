'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  RotateCw,
  RefreshCw,
  Move,
  Maximize2,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PlacedFlower } from '@/types/design';
import { FlowerRenderItem, BouquetDimensions } from '@/utils/canvasUtils';

interface TransformControlOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasW: number;
  canvasH: number;
  bouquetRotation: number;
  bouquetScale: number;
  bucketOffset: { x: number; y: number };
  selectedItem: FlowerRenderItem | null;
  isBucketSelected: boolean;
  bucketDims: BouquetDimensions | null;
  onUpdateFlower: (uid: string, updates: Partial<PlacedFlower>) => void;
  onUpdateBucket: (updates: { scale?: number; rotation?: number; offset?: { x: number; y: number } }) => void;
  onLiveFlowerTransform?: (live: { uid: string; x?: number; y?: number; rotation?: number; scale?: number } | null) => void;
  onLiveBucketTransform?: (live: { offset?: { x: number; y: number }; rotation?: number; scale?: number } | null) => void;
  onCommitFlower?: (uid: string, updates: Partial<PlacedFlower>) => void;
  onCommitBucket?: (updates: { scale?: number; rotation?: number; offset?: { x: number; y: number } }) => void;
  onDeselect: () => void;
  onSelectBouquet: () => void;
  onLayerChange: (uid: string, dir: 'up' | 'down') => void;
  onDuplicate: (uid: string) => void;
  onDelete: (uid: string) => void;
  onReset: (uid?: string) => void;
  recordSnapshot: () => void;
}

type ActiveAction = 'move-flower' | 'rotate-flower' | 'scale-flower' | 'move-bucket' | 'rotate-bucket' | 'scale-bucket' | 'pinch-gesture' | null;

export default function TransformControlOverlay({
  canvasRef,
  canvasW,
  canvasH,
  bouquetRotation,
  bouquetScale,
  bucketOffset,
  selectedItem,
  isBucketSelected,
  bucketDims,
  onUpdateFlower,
  onUpdateBucket,
  onLiveFlowerTransform,
  onLiveBucketTransform,
  onCommitFlower,
  onCommitBucket,
  onDeselect,
  onSelectBouquet,
  onLayerChange,
  onDuplicate,
  onDelete,
  onReset,
  recordSnapshot,
}: TransformControlOverlayProps) {
  const { t, isEn } = useLanguage();

  // Ref to the selection box DOM element for zero-react-render live transform during drag
  const boxRef = useRef<HTMLDivElement>(null);

  // Accumulated pending updates committed ONCE on pointerup
  const pendingFlowerUpdatesRef = useRef<Partial<PlacedFlower>>({});
  const pendingBucketUpdatesRef = useRef<{ scale?: number; rotation?: number; offset?: { x: number; y: number } }>({});

  // First-time guide tooltip visibility
  const [showHint, setShowHint] = useState<boolean>(false);
  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem('laysa_transform_hint_seen');
      if (!hasSeen && (selectedItem || isBucketSelected)) {
        setShowHint(true);
        sessionStorage.setItem('laysa_transform_hint_seen', 'true');
        const timer = setTimeout(() => setShowHint(false), 5500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore sessionStorage error
    }
  }, [selectedItem, isBucketSelected]);

  // Live interaction drag state
  const activeActionRef = useRef<ActiveAction>(null);
  const startPointerRef = useRef<{ x: number; y: number; clientX: number; clientY: number }>({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const startItemRef = useRef<{
    x: number;
    y: number;
    rotDeg: number;
    scale: number;
    dist: number;
    startAngleRad: number;
  }>({ x: 0, y: 0, rotDeg: 0, scale: 1, dist: 1, startAngleRad: 0 });

  // Two-pointer pinch & twist gesture tracking
  const activePointersRef = useRef<Map<number, { clientX: number; clientY: number }>>(new Map());
  const pinchStartRef = useRef<{ dist: number; angle: number; startScale: number; startRot: number }>({ dist: 0, angle: 0, startScale: 1, startRot: 0 });
  const isDraggingActiveRef = useRef<boolean>(false);

  // Floating feedback badge (e.g. "45°" or "125%")
  const [liveTooltip, setLiveTooltip] = useState<string | null>(null);

  // RAF synchronization for buttery smooth 60fps
  const rafId = useRef<number | null>(null);

  // Measure canvas viewport scale
  const getCanvasScale = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return { scaleX: 1, scaleY: 1, rect: null };
    const rect = cv.getBoundingClientRect();
    return {
      scaleX: rect.width / canvasW,
      scaleY: rect.height / canvasH,
      rect,
    };
  }, [canvasRef, canvasW, canvasH]);

  // Convert client (screen) coordinates to canvas coordinates (taking canvas scaling into account)
  const clientToCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const { rect, scaleX, scaleY } = getCanvasScale();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left) / scaleX,
      y: (clientY - rect.top) / scaleY,
    };
  }, [getCanvasScale]);

  // Convert canvas coordinates to bouquet-local coordinates (inverse bouquet rotation)
  const toBouquetLocalCoords = useCallback((canvasX: number, canvasY: number) => {
    const rotRad = -((bouquetRotation || 0) * Math.PI) / 180;
    const pivX = canvasW / 2;
    const pivY = canvasH / 2;
    const dx = canvasX - pivX;
    const dy = canvasY - pivY;
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);
    return {
      x: pivX + dx * cos - dy * sin,
      y: pivY + dx * sin + dy * cos,
    };
  }, [bouquetRotation, canvasW, canvasH]);

  // Global pointer move listener during drag
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!activeActionRef.current) return;

    // Track multi-pointer
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    }

    // ── TWO-FINGER PINCH & TWIST GESTURE ──
    if (activePointersRef.current.size === 2 && activeActionRef.current === 'pinch-gesture') {
      const pts = Array.from(activePointersRef.current.values());
      const p1 = pts[0];
      const p2 = pts[1];
      const curDist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      const curAngle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX);

      const distRatio = curDist / (pinchStartRef.current.dist || 1);
      const angleDiffDeg = ((curAngle - pinchStartRef.current.angle) * 180) / Math.PI;

      const newScale = Math.max(0.3, Math.min(3.0, Number((pinchStartRef.current.startScale * distRatio).toFixed(2))));
      let newRot = Math.round(pinchStartRef.current.startRot + angleDiffDeg);
      while (newRot > 180) newRot -= 360;
      while (newRot < -180) newRot += 360;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (selectedItem) {
          pendingFlowerUpdatesRef.current = {
            ...pendingFlowerUpdatesRef.current,
            scale: newScale,
            rotation: newRot,
            customRotation: (newRot * Math.PI) / 180,
            isManual: true,
          };
          onLiveFlowerTransform?.({
            uid: selectedItem.flower.uid,
            ...pendingFlowerUpdatesRef.current,
          });
          if (boxRef.current) {
            const baseSz = Math.max(52, Math.round(selectedItem.sz * (newScale / (selectedItem.flower.scale || 1))));
            boxRef.current.style.width = `${(baseSz / canvasW) * 100}%`;
            boxRef.current.style.height = `${(baseSz / canvasH) * 100}%`;
            const bouquetRot = bouquetRotation || 0;
            boxRef.current.style.transform = `translate(-50%, -50%) rotate(${newRot + bouquetRot}deg)`;
          }
          setLiveTooltip(`${Math.round(newScale * 100)}% • ${newRot}°`);
        } else if (isBucketSelected) {
          pendingBucketUpdatesRef.current = {
            ...pendingBucketUpdatesRef.current,
            scale: newScale,
            rotation: newRot,
          };
          onLiveBucketTransform?.({
            ...pendingBucketUpdatesRef.current,
          });
          if (boxRef.current && bucketDims) {
            const boxW = Math.max(160, bucketDims.bucketW * 1.15 * (newScale / (bouquetScale || 1)));
            const boxH = Math.max(180, bucketDims.bucketH * 1.08 * (newScale / (bouquetScale || 1)));
            boxRef.current.style.width = `${(boxW / canvasW) * 100}%`;
            boxRef.current.style.height = `${(boxH / canvasH) * 100}%`;
            boxRef.current.style.transform = `translate(-50%, -50%) rotate(${newRot}deg)`;
          }
          setLiveTooltip(`${Math.round(newScale * 100)}% • ${newRot}°`);
        }
      });
      return;
    }

    const { x: curCanvasX, y: curCanvasY } = clientToCanvasCoords(e.clientX, e.clientY);
    const { x: curLocalX, y: curLocalY } = toBouquetLocalCoords(curCanvasX, curCanvasY);

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      // ── MOVE INDIVIDUAL FLOWER ──
      if (activeActionRef.current === 'move-flower' && selectedItem) {
        const dx = curLocalX - startPointerRef.current.x;
        const dy = curLocalY - startPointerRef.current.y;
        const newX = Math.round(startItemRef.current.x + dx);
        const newY = Math.round(startItemRef.current.y + dy);

        // Clamp inside canvas boundary
        const clampedX = Math.max(30, Math.min(canvasW - 30, newX));
        const clampedY = Math.max(30, Math.min(canvasH - 30, newY));

        pendingFlowerUpdatesRef.current = {
          ...pendingFlowerUpdatesRef.current,
          x: clampedX,
          y: clampedY,
          isManual: true,
        };
        onLiveFlowerTransform?.({
          uid: selectedItem.flower.uid,
          ...pendingFlowerUpdatesRef.current,
        });

        // Direct DOM update for 60fps responsiveness
        if (boxRef.current) {
          const bouquetRotRad = ((bouquetRotation || 0) * Math.PI) / 180;
          const pivX = canvasW / 2;
          const pivY = canvasH / 2;
          const dxBox = clampedX - pivX;
          const dyBox = clampedY - pivY;
          const cos = Math.cos(bouquetRotRad);
          const sin = Math.sin(bouquetRotRad);
          const screenCenterX = pivX + dxBox * cos - dyBox * sin;
          const screenCenterY = pivY + dxBox * sin + dyBox * cos;
          boxRef.current.style.left = `${(screenCenterX / canvasW) * 100}%`;
          boxRef.current.style.top = `${(screenCenterY / canvasH) * 100}%`;
        }
      }

      // ── ROTATE INDIVIDUAL FLOWER ──
      else if (activeActionRef.current === 'rotate-flower' && selectedItem) {
        const cx = selectedItem.x;
        const cy = selectedItem.y;
        const currentAngle = Math.atan2(curLocalY - cy, curLocalX - cx);
        const deltaRad = currentAngle - startItemRef.current.startAngleRad;
        let deltaDeg = (deltaRad * 180) / Math.PI;

        let newDeg = Math.round(startItemRef.current.rotDeg + deltaDeg);
        if (e.shiftKey) {
          newDeg = Math.round(newDeg / 15) * 15;
        }
        while (newDeg > 180) newDeg -= 360;
        while (newDeg < -180) newDeg += 360;

        pendingFlowerUpdatesRef.current = {
          ...pendingFlowerUpdatesRef.current,
          rotation: newDeg,
          customRotation: (newDeg * Math.PI) / 180,
          isManual: true,
        };
        onLiveFlowerTransform?.({
          uid: selectedItem.flower.uid,
          ...pendingFlowerUpdatesRef.current,
        });

        if (boxRef.current) {
          const totalRotDeg = Math.round(newDeg + (bouquetRotation || 0));
          boxRef.current.style.transform = `translate(-50%, -50%) rotate(${totalRotDeg}deg)`;
        }
        setLiveTooltip(`${newDeg}°`);
      }

      // ── SCALE INDIVIDUAL FLOWER ──
      else if (activeActionRef.current === 'scale-flower' && selectedItem) {
        const cx = selectedItem.x;
        const cy = selectedItem.y;
        const currentDist = Math.hypot(curLocalX - cx, curLocalY - cy);
        const ratio = currentDist / (startItemRef.current.dist || 1);
        const newScale = Math.max(0.3, Math.min(3.0, Number((startItemRef.current.scale * ratio).toFixed(2))));

        pendingFlowerUpdatesRef.current = {
          ...pendingFlowerUpdatesRef.current,
          scale: newScale,
          isManual: true,
        };
        onLiveFlowerTransform?.({
          uid: selectedItem.flower.uid,
          ...pendingFlowerUpdatesRef.current,
        });

        if (boxRef.current) {
          const baseSz = Math.max(52, Math.round(selectedItem.sz * (newScale / (selectedItem.flower.scale || 1))));
          boxRef.current.style.width = `${(baseSz / canvasW) * 100}%`;
          boxRef.current.style.height = `${(baseSz / canvasH) * 100}%`;
        }
        setLiveTooltip(`${Math.round(newScale * 100)}%`);
      }

      // ── MOVE ENTIRE BOUQUET ──
      else if (activeActionRef.current === 'move-bucket') {
        const dx = curLocalX - startPointerRef.current.x;
        const dy = curLocalY - startPointerRef.current.y;
        const maxClampX = Math.round(canvasW * 0.38);
        const maxClampY = Math.round(canvasH * 0.30);
        const targetX = Math.max(-maxClampX, Math.min(maxClampX, Math.round(startItemRef.current.x + dx)));
        const targetY = Math.max(-maxClampY, Math.min(maxClampY, Math.round(startItemRef.current.y + dy)));

        pendingBucketUpdatesRef.current = {
          ...pendingBucketUpdatesRef.current,
          offset: { x: targetX, y: targetY },
        };
        onLiveBucketTransform?.({
          ...pendingBucketUpdatesRef.current,
        });

        if (boxRef.current && bucketDims) {
          const bouquetRotRad = ((bouquetRotation || 0) * Math.PI) / 180;
          const pivX = canvasW / 2;
          const pivY = canvasH / 2;
          const bcx = bucketDims.bucketX + bucketDims.bucketW / 2 + (targetX - (bucketOffset.x || 0));
          const bcy = bucketDims.bucketY + bucketDims.bucketH * 0.48 + (targetY - (bucketOffset.y || 0));
          const cos = Math.cos(bouquetRotRad);
          const sin = Math.sin(bouquetRotRad);
          const screenCenterX = pivX + (bcx - pivX) * cos - (bcy - pivY) * sin;
          const screenCenterY = pivY + (bcx - pivX) * sin + (bcy - pivY) * cos;
          boxRef.current.style.left = `${(screenCenterX / canvasW) * 100}%`;
          boxRef.current.style.top = `${(screenCenterY / canvasH) * 100}%`;
        }
      }

      // ── ROTATE ENTIRE BOUQUET ──
      else if (activeActionRef.current === 'rotate-bucket') {
        const pivX = canvasW / 2;
        const pivY = canvasH / 2;
        const curAngle = Math.atan2(curCanvasY - pivY, curCanvasX - pivX);
        const deltaDeg = ((curAngle - startItemRef.current.startAngleRad) * 180) / Math.PI;

        let newDeg = Math.round(startItemRef.current.rotDeg + deltaDeg);
        if (e.shiftKey) {
          newDeg = Math.round(newDeg / 15) * 15;
        }
        while (newDeg > 180) newDeg -= 360;
        while (newDeg < -180) newDeg += 360;

        pendingBucketUpdatesRef.current = {
          ...pendingBucketUpdatesRef.current,
          rotation: newDeg,
        };
        onLiveBucketTransform?.({
          ...pendingBucketUpdatesRef.current,
        });

        if (boxRef.current) {
          boxRef.current.style.transform = `translate(-50%, -50%) rotate(${newDeg}deg)`;
        }
        setLiveTooltip(`${newDeg}°`);
      }

      // ── SCALE ENTIRE BOUQUET ──
      else if (activeActionRef.current === 'scale-bucket' && bucketDims) {
        const bcx = bucketDims.bucketX + bucketDims.bucketW / 2;
        const bcy = bucketDims.bucketY + bucketDims.bucketH * 0.48;
        const currentDist = Math.hypot(curLocalX - bcx, curLocalY - bcy);
        const ratio = currentDist / (startItemRef.current.dist || 1);
        const newScale = Math.max(0.3, Math.min(3.0, Number((startItemRef.current.scale * ratio).toFixed(2))));

        pendingBucketUpdatesRef.current = {
          ...pendingBucketUpdatesRef.current,
          scale: newScale,
        };
        onLiveBucketTransform?.({
          ...pendingBucketUpdatesRef.current,
        });

        if (boxRef.current) {
          const boxW = Math.max(160, bucketDims.bucketW * 1.15 * (newScale / (bouquetScale || 1)));
          const boxH = Math.max(180, bucketDims.bucketH * 1.08 * (newScale / (bouquetScale || 1)));
          boxRef.current.style.width = `${(boxW / canvasW) * 100}%`;
          boxRef.current.style.height = `${(boxH / canvasH) * 100}%`;
        }
        setLiveTooltip(`${Math.round(newScale * 100)}%`);
      }
    });
  }, [
    clientToCanvasCoords,
    toBouquetLocalCoords,
    selectedItem,
    isBucketSelected,
    bucketDims,
    canvasW,
    canvasH,
    bouquetRotation,
    bouquetScale,
    bucketOffset,
    onLiveFlowerTransform,
    onLiveBucketTransform,
  ]);

  const handlePointerUp = useCallback((e: PointerEvent | React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size === 0) {
      if (isDraggingActiveRef.current && activeActionRef.current) {
        isDraggingActiveRef.current = false;
        // Commit changes once on pointer up (atomic commit preventing re-render loop during drag)
        if (selectedItem && Object.keys(pendingFlowerUpdatesRef.current).length > 0) {
          if (onCommitFlower) {
            onCommitFlower(selectedItem.flower.uid, pendingFlowerUpdatesRef.current);
          } else {
            onUpdateFlower(selectedItem.flower.uid, pendingFlowerUpdatesRef.current);
          }
        } else if (isBucketSelected && Object.keys(pendingBucketUpdatesRef.current).length > 0) {
          if (onCommitBucket) {
            onCommitBucket(pendingBucketUpdatesRef.current);
          } else {
            onUpdateBucket(pendingBucketUpdatesRef.current);
          }
        }
        recordSnapshot();
      }

      // MANDATORY: ALWAYS clear liveRefs and pending updates after release
      pendingFlowerUpdatesRef.current = {};
      pendingBucketUpdatesRef.current = {};
      onLiveFlowerTransform?.(null);
      onLiveBucketTransform?.(null);
      activeActionRef.current = null;
      isDraggingActiveRef.current = false;
      setLiveTooltip(null);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    }
  }, [
    selectedItem,
    isBucketSelected,
    onCommitFlower,
    onUpdateFlower,
    onCommitBucket,
    onUpdateBucket,
    onLiveFlowerTransform,
    onLiveBucketTransform,
    recordSnapshot,
  ]);

  const handleCancel = useCallback(() => {
    activePointersRef.current.clear();
    isDraggingActiveRef.current = false;
    activeActionRef.current = null;
    pendingFlowerUpdatesRef.current = {};
    pendingBucketUpdatesRef.current = {};
    onLiveFlowerTransform?.(null);
    onLiveBucketTransform?.(null);
    setLiveTooltip(null);
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    if (boxRef.current) {
      boxRef.current.style.transform = '';
      boxRef.current.style.width = '';
      boxRef.current.style.height = '';
    }
  }, [onLiveFlowerTransform, onLiveBucketTransform]);

  const handlePointerCancel = useCallback((e: PointerEvent | React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size === 0) {
      handleCancel();
    }
  }, [handleCancel]);

  const handleLostPointerCapture = useCallback((e: PointerEvent | React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);
    // Pastikan lostpointercapture tidak memicu commit kedua setelah pointerup (tidak ada entri undo ganda)
    if (activePointersRef.current.size === 0 && isDraggingActiveRef.current) {
      handlePointerUp(e);
    }
  }, [handlePointerUp]);

  // Register pointermove, pointerup, pointercancel, and lostpointercapture globally during active drag with cleanup on unmount
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('lostpointercapture', handleLostPointerCapture);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('lostpointercapture', handleLostPointerCapture);
    };
  }, [handlePointerMove, handlePointerUp, handlePointerCancel, handleLostPointerCapture]);

  // Cancel transform on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDraggingActiveRef.current) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCancel]);

  // ── INITIATE ROTATE ──
  const startRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
    isDraggingActiveRef.current = true;
    activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    const { x: curCanvasX, y: curCanvasY } = clientToCanvasCoords(e.clientX, e.clientY);

    if (selectedItem) {
      const { x: curLocalX, y: curLocalY } = toBouquetLocalCoords(curCanvasX, curCanvasY);
      const cx = selectedItem.x;
      const cy = selectedItem.y;
      const curRotDeg = selectedItem.flower.rotation !== undefined
        ? selectedItem.flower.rotation
        : Math.round((selectedItem.rot * 180) / Math.PI);

      activeActionRef.current = 'rotate-flower';
      startItemRef.current = {
        x: cx,
        y: cy,
        rotDeg: curRotDeg,
        scale: selectedItem.flower.scale ?? 1,
        dist: 1,
        startAngleRad: Math.atan2(curLocalY - cy, curLocalX - cx),
      };
      setLiveTooltip(`${curRotDeg}°`);
    } else if (isBucketSelected) {
      const pivX = canvasW / 2;
      const pivY = canvasH / 2;
      activeActionRef.current = 'rotate-bucket';
      startItemRef.current = {
        x: pivX,
        y: pivY,
        rotDeg: bouquetRotation || 0,
        scale: bouquetScale || 1,
        dist: 1,
        startAngleRad: Math.atan2(curCanvasY - pivY, curCanvasX - pivX),
      };
      setLiveTooltip(`${bouquetRotation || 0}°`);
    }
  };

  // ── INITIATE SCALE ──
  const startScale = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
    isDraggingActiveRef.current = true;
    activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    const { x: curCanvasX, y: curCanvasY } = clientToCanvasCoords(e.clientX, e.clientY);
    const { x: curLocalX, y: curLocalY } = toBouquetLocalCoords(curCanvasX, curCanvasY);

    if (selectedItem) {
      const cx = selectedItem.x;
      const cy = selectedItem.y;
      activeActionRef.current = 'scale-flower';
      startItemRef.current = {
        x: cx,
        y: cy,
        rotDeg: selectedItem.flower.rotation ?? 0,
        scale: selectedItem.flower.scale ?? 1,
        dist: Math.hypot(curLocalX - cx, curLocalY - cy) || 1,
        startAngleRad: 0,
      };
      setLiveTooltip(`${Math.round((selectedItem.flower.scale ?? 1) * 100)}%`);
    } else if (isBucketSelected && bucketDims) {
      const bcx = bucketDims.bucketX + bucketDims.bucketW / 2;
      const bcy = bucketDims.bucketY + bucketDims.bucketH * 0.48;
      activeActionRef.current = 'scale-bucket';
      startItemRef.current = {
        x: bcx,
        y: bcy,
        rotDeg: bouquetRotation || 0,
        scale: bouquetScale || 1,
        dist: Math.hypot(curLocalX - bcx, curLocalY - bcy) || 1,
        startAngleRad: 0,
      };
      setLiveTooltip(`${Math.round((bouquetScale || 1) * 100)}%`);
    }
  };

  // ── INITIATE MOVE ──
  const startMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
    isDraggingActiveRef.current = true;
    activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    // Handle 2-finger gesture initialization
    if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const p1 = pts[0];
      const p2 = pts[1];
      activeActionRef.current = 'pinch-gesture';
      pinchStartRef.current = {
        dist: Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY),
        angle: Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX),
        startScale: selectedItem ? (selectedItem.flower.scale ?? 1) : (bouquetScale || 1),
        startRot: selectedItem
          ? (selectedItem.flower.rotation ?? Math.round((selectedItem.rot * 180) / Math.PI))
          : (bouquetRotation || 0),
      };
      return;
    }

    const { x: curCanvasX, y: curCanvasY } = clientToCanvasCoords(e.clientX, e.clientY);
    const { x: curLocalX, y: curLocalY } = toBouquetLocalCoords(curCanvasX, curCanvasY);

    if (selectedItem) {
      activeActionRef.current = 'move-flower';
      startPointerRef.current = { x: curLocalX, y: curLocalY, clientX: e.clientX, clientY: e.clientY };
      startItemRef.current = {
        x: selectedItem.x,
        y: selectedItem.y,
        rotDeg: selectedItem.rot,
        scale: selectedItem.flower.scale ?? 1,
        dist: 1,
        startAngleRad: 0,
      };
    } else if (isBucketSelected) {
      activeActionRef.current = 'move-bucket';
      startPointerRef.current = { x: curLocalX, y: curLocalY, clientX: e.clientX, clientY: e.clientY };
      startItemRef.current = {
        x: bucketOffset.x,
        y: bucketOffset.y,
        rotDeg: bouquetRotation || 0,
        scale: bouquetScale || 1,
        dist: 1,
        startAngleRad: 0,
      };
    }
  };

  // Calculate box geometry in screen/DOM coordinates
  const { scaleX, scaleY } = getCanvasScale();

  let targetBox: {
    pctLeft: number;
    pctTop: number;
    pctWidth: number;
    pctHeight: number;
    totalRotDeg: number;
    label: string;
    isGroup: boolean;
  } | null = null;

  if (selectedItem) {
    const bouquetRotRad = ((bouquetRotation || 0) * Math.PI) / 180;
    const pivX = canvasW / 2;
    const pivY = canvasH / 2;
    const dx = selectedItem.x - pivX;
    const dy = selectedItem.y - pivY;
    const cos = Math.cos(bouquetRotRad);
    const sin = Math.sin(bouquetRotRad);

    const screenCenterX = pivX + dx * cos - dy * sin;
    const screenCenterY = pivY + dx * sin + dy * cos;
    const itemRotRad = selectedItem.rot;
    const totalRotRad = itemRotRad + bouquetRotRad;
    const totalRotDeg = Math.round((totalRotRad * 180) / Math.PI);

    const boxSize = Math.max(52, selectedItem.sz);

    targetBox = {
      pctLeft: (screenCenterX / canvasW) * 100,
      pctTop: (screenCenterY / canvasH) * 100,
      pctWidth: (boxSize / canvasW) * 100,
      pctHeight: (boxSize / canvasH) * 100,
      totalRotDeg,
      label: selectedItem.flower.flowerId,
      isGroup: false,
    };
  } else if (isBucketSelected && bucketDims) {
    const pivX = canvasW / 2;
    const pivY = canvasH / 2;
    const bouquetRotRad = ((bouquetRotation || 0) * Math.PI) / 180;
    const cos = Math.cos(bouquetRotRad);
    const sin = Math.sin(bouquetRotRad);

    const bcx = bucketDims.bucketX + bucketDims.bucketW / 2;
    const bcy = bucketDims.bucketY + bucketDims.bucketH * 0.48;
    const dx = bcx - pivX;
    const dy = bcy - pivY;

    const screenCenterX = pivX + dx * cos - dy * sin;
    const screenCenterY = pivY + dx * sin + dy * cos;

    const boxW = Math.max(160, bucketDims.bucketW * 1.15);
    const boxH = Math.max(180, bucketDims.bucketH * 1.08);

    targetBox = {
      pctLeft: (screenCenterX / canvasW) * 100,
      pctTop: (screenCenterY / canvasH) * 100,
      pctWidth: (boxW / canvasW) * 100,
      pctHeight: (boxH / canvasH) * 100,
      totalRotDeg: bouquetRotation || 0,
      label: 'Buket',
      isGroup: true,
    };
  }

  return (
    <div className="transform-overlay-layer" aria-label="Transform Canvas Overlay">
      {/* ── TOP-LEFT BUTTON: SELECT WHOLE BOUQUET ── */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectBouquet();
        }}
        className={`transform-whole-bouquet-pill ${isBucketSelected ? 'active' : ''}`}
        title={t('btn_select_bouquet')}
        id="btn-select-whole-bouquet"
      >
        <span className="shrink-0 text-xs">💐</span>
        <span>{t('btn_select_bouquet')}</span>
      </button>

      {/* ── FIRST-TIME USER HELPER TOAST ── */}
      {showHint && (
        <div className="transform-hint-banner animate-in fade-in slide-in-from-top-3 duration-300">
          <Sparkles size={14} className="text-amber-400 shrink-0 animate-spin" />
          <span>{t('transform_hint')}</span>
          <button
            type="button"
            onClick={() => setShowHint(false)}
            className="transform-hint-dismiss"
            aria-label="Tutup Bantuan"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── LIVE INTERACTION TOOLTIP (DEGREE / PERCENTAGE) ── */}
      {liveTooltip && targetBox && (
        <div
          className="transform-live-feedback-pill"
          style={{
            left: `${targetBox.pctLeft}%`,
            top: `calc(${targetBox.pctTop - targetBox.pctHeight / 2}% - 38px)`,
          }}
        >
          {liveTooltip}
        </div>
      )}

      {/* ── SELECTION BOX CONTAINER & HANDLES ── */}
      {targetBox && (
        <div
          ref={boxRef}
          className="transform-box-container"
          style={{
            left: `${targetBox.pctLeft}%`,
            top: `${targetBox.pctTop}%`,
            width: `${targetBox.pctWidth}%`,
            height: `${targetBox.pctHeight}%`,
            transform: `translate(-50%, -50%) rotate(${targetBox.totalRotDeg}deg)`,
            transformOrigin: 'center center',
            touchAction: 'none',
          }}
        >
          {/* Dashed Bounding Box Body (Draggable for Translation) */}
          <div
            className={`transform-bounding-box ${targetBox.isGroup ? 'box-group' : 'box-element'}`}
            onPointerDown={startMove}
            onPointerCancel={handlePointerCancel}
            onLostPointerCapture={handleLostPointerCapture}
            style={{ touchAction: 'none' }}
            title={targetBox.isGroup ? 'Seret untuk menggeser buket' : 'Seret untuk menggeser posisi'}
          />

          {/* ── HANDLE 1: ROTATE BUTTON (POJOK KIRI ATAS) ── */}
          <button
            type="button"
            className="transform-handle-btn handle-rotate"
            onPointerDown={startRotate}
            onPointerCancel={handlePointerCancel}
            onLostPointerCapture={handleLostPointerCapture}
            style={{ touchAction: 'none' }}
            title={isEn ? 'Drag to rotate (Shift: snap 15°)' : 'Seret untuk memutar (Shift: snap 15°)'}
            aria-label="Rotate Handle"
            id="handle-rotate-btn"
          >
            <RefreshCw size={19} strokeWidth={2.4} className="handle-icon-rotate" />
          </button>

          {/* ── HANDLE 2: RESIZE / SCALE BUTTON (POJOK KANAN BAWAH) ── */}
          <button
            type="button"
            className="transform-handle-btn handle-scale"
            onPointerDown={startScale}
            onPointerCancel={handlePointerCancel}
            onLostPointerCapture={handleLostPointerCapture}
            style={{ touchAction: 'none' }}
            title={isEn ? 'Drag to scale (0.3x - 3.0x)' : 'Seret untuk perbesar/perkecil (0.3x - 3.0x)'}
            aria-label="Scale Handle"
            id="handle-scale-btn"
          >
            <Move size={19} strokeWidth={2.4} className="handle-icon-scale" />
          </button>

          {/* ── FLOATING ACTION TOOLBAR (ATTACHED TO BOX) ── */}
          <div className="transform-floating-actions" onPointerDown={(e) => e.stopPropagation()}>
            {targetBox.isGroup ? (
              // Actions for entire bouquet: sleek reset button without cluttered labels
              <div className="transform-actions-cluster">
                <button
                  type="button"
                  onClick={() => onReset()}
                  className="transform-action-btn action-reset"
                  title={isEn ? 'Reset Bouquet Transform' : 'Reset Ukuran & Posisi Buket'}
                >
                  <RotateCcw size={13} />
                  <span>{isEn ? 'Reset Bouquet' : 'Reset Buket'}</span>
                </button>
              </div>
            ) : selectedItem ? (
              // Actions for selected individual flower
              <div className="transform-actions-cluster">
                <button
                  type="button"
                  onClick={() => onLayerChange(selectedItem.flower.uid, 'up')}
                  className="transform-action-btn"
                  title={t('btn_layer_forward')}
                >
                  <ArrowUp size={13} />
                  <span className="hidden sm:inline">{t('btn_layer_forward')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLayerChange(selectedItem.flower.uid, 'down')}
                  className="transform-action-btn"
                  title={t('btn_layer_backward')}
                >
                  <ArrowDown size={13} />
                  <span className="hidden sm:inline">{t('btn_layer_backward')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(selectedItem.flower.uid)}
                  className="transform-action-btn"
                  title={t('btn_duplicate')}
                >
                  <Copy size={13} />
                  <span className="hidden sm:inline">{t('btn_duplicate')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onReset(selectedItem.flower.uid)}
                  className="transform-action-btn"
                  title={t('btn_reset_transform')}
                >
                  <RotateCcw size={13} />
                  <span>{t('btn_reset_transform')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(selectedItem.flower.uid)}
                  className="transform-action-btn btn-danger"
                  title={t('btn_delete')}
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">{t('btn_delete')}</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
