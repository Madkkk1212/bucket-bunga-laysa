'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useDesign } from '@/context/DesignContext';
import {
  drawBouquetBack,
  drawBouquetFront,
  drawFlowers,
  drawFlowerRenderItems,
  drawText,
  getCardBounds,
  preloadFlowers,
  areImagesCached,
  isImageCached,
  computeFlowerRenderItems,
  getBouquetDimensions,
  FlowerRenderItem,
  BouquetDimensions,
  CANVAS_RATIO_DIMENSIONS,
  BACKGROUND_THEMES,
  drawCanvasBackground,
  preloadImage,
  getImageFromCache,
} from '@/utils/canvasUtils';
import { CanvasRatio, BackgroundTheme, PlacedFlower } from '@/types/design';
import { useLanguage } from '@/context/LanguageContext';
import { RotateCcw, RotateCw } from 'lucide-react';
import TransformControlOverlay from './TransformControlOverlay';

export interface LiveFlowerTransform {
  uid: string;
  x?: number;
  y?: number;
  rotation?: number; // radians
  scale?: number;
  size?: number;
}

export interface LiveBucketTransform {
  offset?: { x: number; y: number };
  rotation?: number; // degrees
  scale?: number;
}

export interface LiveCardTransform {
  cardX?: number;
  cardY?: number;
  cardScale?: number;
}

interface PreviewCanvasProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

type DragMode = 'move' | 'rotate' | 'scale' | 'scale-card' | 'bucket-move' | 'bucket-rotate' | 'bucket-scale';

interface DragState {
  mode: DragMode;
  startMouseX: number;
  startMouseY: number;
  origX: number;
  origY: number;
  origSize: number;
  origRot: number;
  startAngle?: number;
}

export default function PreviewCanvas({ canvasRef: externalRef }: PreviewCanvasProps) {
  const { t, isEn } = useLanguage();
  const internalRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalRef ?? internalRef;

  const {
    design,
    updateFlower,
    addFlowerAtPosition,
    setText,
    selectedFlowerUid: selectedUid,
    setSelectedFlowerUid: setSelectedUid,
    isBucketSelected,
    setIsBucketSelected,
    hoveredFlowerUid,
    setFlowerPlacementMode,
    toggleFlowerLayer,
    setBouquetScale,
    setBouquetRotation,
    setBucketOffset,
    recordSnapshot,
    undo,
    canUndo,
    redo,
    canRedo,
    resetElementTransform,
    changeFlowerLayer,
    duplicateFlower,
    removeFlowerByUid,
  } = useDesign();

  const preDragSnapshot = useRef<any>(null);
  const hasMovedDrag = useRef<boolean>(false);
  const isDraggingActiveRef = useRef<boolean>(false);

  const currentRatio: CanvasRatio = design.canvasRatio ?? '1:1';
  const currentTheme: BackgroundTheme = design.bgTheme ?? 'studio-warm';
  const { width: canvasW, height: canvasH } =
    CANVAS_RATIO_DIMENSIONS[currentRatio] || CANVAS_RATIO_DIMENSIONS['1:1'];

  const [dragState, setDragState] = useState<DragState | null>(null);
  
  // Status selesai / final terkunci (Hanya saat Step 5 unduh atau jika status sudah final)
  const isFinished = design.currentStep >= 5 || design.final2D.status === 'final';

  // Bulatan "Area Kantung Bunga (Bebas Geser)" HANYA muncul saat buket masih kosong
  const showGuide = !isFinished && design.selectedFlowers.length === 0;
  
  const [cursorStyle, setCursorStyle] = useState<string>('default');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Bucket interactive state
  const [isBucketHovered, setIsBucketHovered] = useState<boolean>(false);
  const bucketDimsRef = useRef<BouquetDimensions | null>(null);

  // Greeting card drag and scale state
  const [isDraggingCard, setIsDraggingCard] = useState<boolean>(false);
  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);
  const [isCardSelected, setIsCardSelected] = useState<boolean>(false);
  const cardDragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // 5. Capped devicePixelRatio (max 2) for retina sharpness without excessive memory
  const [dpr, setDpr] = useState<number>(1);
  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio || 1, 2));
  }, []);

  // Live transform refs for high-performance drag without React re-renders
  const liveFlowerRef = useRef<LiveFlowerTransform | null>(null);
  const liveBucketRef = useRef<LiveBucketTransform | null>(null);
  const liveCardRef = useRef<LiveCardTransform | null>(null);

  // Anti-race render counter & single rAF scheduler
  const renderIdRef = useRef<number>(0);
  const rAfIdRef = useRef<number | null>(null);

  // Cache latest computed render items for instant hit testing
  const renderItemsRef = useRef<FlowerRenderItem[]>([]);

  // Otomatis lepas pilihan buket jika masuk ke Step 2 (merangkai bunga) atau Step 3 (kartu ucapan)
  useEffect(() => {
    if (design.currentStep === 2 || design.currentStep === 3) {
      if (isBucketSelected) {
        setIsBucketSelected(false);
      }
    }
  }, [design.currentStep, isBucketSelected, setIsBucketSelected]);

  // Clear live transform refs ONLY AFTER React state commits the updates (prevents snap-back/bounce)
  useEffect(() => {
    if (liveFlowerRef.current) {
      const target = design.selectedFlowers.find((f) => f.uid === liveFlowerRef.current?.uid);
      if (target) {
        const lf = liveFlowerRef.current;
        const xMatches = lf.x === undefined || target.x === lf.x;
        const yMatches = lf.y === undefined || target.y === lf.y;
        const scaleMatches = lf.scale === undefined || target.scale === lf.scale;
        if (xMatches && yMatches && scaleMatches) {
          liveFlowerRef.current = null;
        }
      } else {
        liveFlowerRef.current = null;
      }
    }
  }, [design.selectedFlowers]);

  useEffect(() => {
    liveBucketRef.current = null;
  }, [design.bouquetScale, design.bouquetRotation, design.bucketOffset]);

  useEffect(() => {
    liveCardRef.current = null;
  }, [design.text]);

  // Synchronous memoized bouquet dimensions & flower render items
  const currentBucketDims = useMemo(() => {
    return getBouquetDimensions(
      canvasW,
      canvasH,
      design.bucketSize,
      design.bouquetScale ?? 1.0,
      design.bucketOffset ?? { x: 0, y: 0 }
    );
  }, [canvasW, canvasH, design.bucketSize, design.bouquetScale, design.bucketOffset]);

  const currentRenderItems = useMemo(() => {
    return computeFlowerRenderItems(design.selectedFlowers, currentBucketDims);
  }, [design.selectedFlowers, currentBucketDims]);

  const currentSelectedItem = useMemo(() => {
    if (!selectedUid) return null;
    return (
      currentRenderItems.find((it) => it.flower.uid === selectedUid) ??
      renderItemsRef.current.find((it) => it.flower.uid === selectedUid) ??
      null
    );
  }, [selectedUid, currentRenderItems]);

  // ─── 1. SELECTION HANDLES DRAWER ─────────────────────────────────────────
  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, item: FlowerRenderItem) => {
    const { x, y, sz, rot } = item;
    const half = sz / 2;
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0);
    const flowerHandleRadius = isTouch ? 22 : 18;
    const rotatePinDistance = half + (isTouch ? 38 : 32);
    const scaleHandleX = half + (isTouch ? 14 : 10);
    const scaleHandleY = half + (isTouch ? 14 : 10);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Selection dashed boundary
    ctx.beginPath();
    ctx.roundRect(-half - 8, -half - 8, sz + 16, sz + 16, 12);
    ctx.strokeStyle = '#D97706'; // Vibrant amber gold
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 5]);
    ctx.shadowColor = 'rgba(217, 119, 6, 0.35)';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Stem line to rotate knob
    ctx.beginPath();
    ctx.moveTo(0, -half - 8);
    ctx.lineTo(0, -rotatePinDistance);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rotate Handle (Top circle with rotation icon)
    ctx.beginPath();
    ctx.arc(0, -rotatePinDistance, flowerHandleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Rotate icon ↻ inside circle
    ctx.font = `bold ${isTouch ? 18 : 15}px sans-serif`;
    ctx.fillStyle = '#D97706';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↻', 0, -rotatePinDistance);

    // Scale Handle (Bottom-Right corner with diagonal arrow)
    ctx.beginPath();
    ctx.moveTo(half + 8, half + 8);
    ctx.lineTo(scaleHandleX, scaleHandleY);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(scaleHandleX, scaleHandleY, flowerHandleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = `bold ${isTouch ? 17 : 14}px sans-serif`;
    ctx.fillStyle = '#D97706';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⤡', scaleHandleX, scaleHandleY);

    ctx.restore();
  };

  // ─── 1b. INTERACTIVE BUCKET HANDLES DRAWER (SCALE, ROTATE & MOVE) ─────────
  const drawBucketInteractiveHandles = (
    ctx: CanvasRenderingContext2D,
    dims: BouquetDimensions,
    isSelected: boolean,
    isHovered: boolean,
    activeMode?: DragMode | null,
  ) => {
    const { bucketX: bx, bucketY: by, bucketW: bw, bucketH: bh } = dims;
    const bcx = bx + bw / 2;
    const bcy = by + bh * 0.52;

    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0);
    const bucketHandleRadius = isTouch ? 26 : 22;
    const rotPinY = by - (isTouch ? 88 : 76);
    const scaleHandleX = bx + bw + (isTouch ? 24 : 18);
    const scaleHandleY = by + bh + (isTouch ? 24 : 18);

    ctx.save();

    // 1. Dashed Bounding Box around Bucket
    ctx.beginPath();
    ctx.roundRect(bx - 10, by - 10, bw + 20, bh + 20, 20);
    ctx.strokeStyle = isSelected ? '#E11D48' : 'rgba(225, 29, 72, 0.45)';
    ctx.lineWidth = isSelected ? 2.8 : 1.6;
    ctx.setLineDash(isSelected ? [8, 6] : [6, 6]);
    if (isSelected) {
      ctx.shadowColor = 'rgba(225, 29, 72, 0.35)';
      ctx.shadowBlur = 14;
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // 2. Top Pill Badge: "🪣 Buket • Seret / Putar / Ukuran"
    const pillW = isSelected ? 204 : 144;
    const pillH = 28;
    const pillX = bcx - pillW / 2;
    const pillY = by - 40;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx.fillStyle = isSelected ? '#E11D48' : 'rgba(225, 29, 72, 0.88)';
    ctx.shadowColor = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = 'bold 10.5px "Montserrat", -apple-system, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      isSelected
        ? (isEn ? '🪣 Bouquet • Drag / Rotate / Scale' : '🪣 Buket • Seret / Putar / Ukuran')
        : (isEn ? '🪣 Bouquet (Tap)' : '🪣 Buket (Ketuk)'),
      bcx,
      pillY + pillH / 2,
    );

    // 3. Center Drag Move Icon
    const moveRadius = isTouch ? 24 : 20;
    ctx.beginPath();
    ctx.arc(bcx, bcy, moveRadius, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? 'rgba(225, 29, 72, 0.18)' : 'rgba(225, 29, 72, 0.10)';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#E11D48' : 'rgba(225, 29, 72, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '20px sans-serif';
    ctx.fillStyle = isSelected ? '#E11D48' : 'rgba(225, 29, 72, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✥', bcx, bcy);

    // If bucket is selected, show interactive Rotate Handle and Scale Handle!
    if (isSelected) {
      // 4. ROTATE HANDLE (Top, above badge)
      // Stem line
      ctx.beginPath();
      ctx.moveTo(bcx, pillY);
      ctx.lineTo(bcx, rotPinY);
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Rotate knob circle
      ctx.beginPath();
      ctx.arc(bcx, rotPinY, bucketHandleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Rotate icon ↻
      ctx.font = `bold ${isTouch ? 22 : 18}px sans-serif`;
      ctx.fillStyle = '#E11D48';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('↻', bcx, rotPinY);

      // Rotation Degree Badge
      const currentRot = Math.round(design.bouquetRotation ?? 0);
      const rotBadgeW = 48;
      const rotBadgeH = 22;
      ctx.beginPath();
      ctx.roundRect(bcx + bucketHandleRadius + 8, rotPinY - rotBadgeH / 2, rotBadgeW, rotBadgeH, 11);
      ctx.fillStyle = '#E11D48';
      ctx.fill();
      ctx.font = 'bold 10.5px "Montserrat", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${currentRot}°`, bcx + bucketHandleRadius + 8 + rotBadgeW / 2, rotPinY);

      // 5. SCALE HANDLE (Bottom-Right corner)
      // Stem line to corner
      ctx.beginPath();
      ctx.moveTo(bx + bw, by + bh);
      ctx.lineTo(scaleHandleX, scaleHandleY);
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Scale knob circle
      ctx.beginPath();
      ctx.arc(scaleHandleX, scaleHandleY, bucketHandleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Scale icon ⤡
      ctx.font = `bold ${isTouch ? 20 : 17}px sans-serif`;
      ctx.fillStyle = '#E11D48';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⤡', scaleHandleX, scaleHandleY);

      // Scale Percentage Badge
      const currentScalePct = Math.round((design.bouquetScale ?? 1.0) * 100);
      const scaleBadgeW = 54;
      const scaleBadgeH = 22;
      ctx.beginPath();
      ctx.roundRect(scaleHandleX + bucketHandleRadius + 6, scaleHandleY - scaleBadgeH / 2, scaleBadgeW, scaleBadgeH, 11);
      ctx.fillStyle = '#BE123C';
      ctx.fill();
      ctx.font = 'bold 10.5px "Montserrat", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${currentScalePct}%`, scaleHandleX + bucketHandleRadius + 6 + scaleBadgeW / 2, scaleHandleY);
    }

    ctx.restore();
  };

  // ─── 2. FAST-PATH SYNCHRONOUS CANVAS PAINTER ─────────────────────────────
  const paintCanvasSync = useCallback((ctx: CanvasRenderingContext2D) => {
    // 5. Capped DPR Transform (max 2 for retina sharpness without excessive memory)
    const effectiveDpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    ctx.save();
    ctx.setTransform(effectiveDpr, 0, 0, effectiveDpr, 0, 0);

    // Clear canvas
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Dynamic Curated Studio Backdrop Theme or Custom Image (Fast-Path Cache)
    let customImg: HTMLImageElement | null = null;
    if (currentTheme === 'custom' && design.customBgImage) {
      customImg = getImageFromCache(design.customBgImage);
    }
    drawCanvasBackground(ctx, currentTheme, canvasW, canvasH, customImg);

    // 1. Draw bouquet back wrapper + flowers + front — all inside bouquet transform
    // Live override check from liveBucketRef during drag (0 React re-renders)
    const liveBucket = liveBucketRef.current;
    const bouquetRotDeg = liveBucket?.rotation !== undefined ? liveBucket.rotation : (design.bouquetRotation ?? 0);
    const bouquetRotRad = (bouquetRotDeg * Math.PI) / 180;
    const bouquetScale = liveBucket?.scale !== undefined ? liveBucket.scale : (design.bouquetScale ?? 1.0);
    const bucketOffset = liveBucket?.offset !== undefined ? liveBucket.offset : (design.bucketOffset ?? { x: 0, y: 0 });

    const pivotX = canvasW / 2;
    const pivotY = canvasH / 2;

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(bouquetRotRad);
    ctx.translate(-pivotX, -pivotY);

    const dims = drawBouquetBack(
      ctx,
      design.bucketSize,
      design.wrapperType,
      bouquetScale,
      bucketOffset,
    );
    bucketDimsRef.current = dims;

    // 2. Compute current item placements ONCE
    const items = computeFlowerRenderItems(design.selectedFlowers, dims);

    // Apply live flower transform override during drag (0 React re-renders)
    const liveFlower = liveFlowerRef.current;
    if (liveFlower) {
      const targetItem = items.find((it) => it.flower.uid === liveFlower.uid);
      if (targetItem) {
        if (liveFlower.x !== undefined) targetItem.x = liveFlower.x;
        if (liveFlower.y !== undefined) targetItem.y = liveFlower.y;
        if (liveFlower.rotation !== undefined) targetItem.rot = liveFlower.rotation;
        if (liveFlower.size !== undefined) {
          targetItem.sz = liveFlower.size;
        } else if (liveFlower.scale !== undefined) {
          const base = targetItem.flower.size ?? 92;
          targetItem.sz = Math.round(base * liveFlower.scale);
        }
      }
    }
    renderItemsRef.current = items;

    // Optional Floral Cavity Bed Guide
    if (showGuide) {
      const { centerX, bucketY, bucketH, scale } = dims;
      const collarY = Math.round(bucketY + bucketH * 0.5373);
      const guideW = Math.round(310 * (scale / (540 / 1954)));
      const guideH = Math.round(230 * (scale / (540 / 1954)));
      const guideCenterY = collarY - Math.round(65 * (scale / (540 / 1954)));

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, guideCenterY, guideW / 2, guideH / 2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(184, 134, 11, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();

      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = 'rgba(184, 134, 11, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(
        isEn ? 'Flower Pocket Area (Free Drag)' : 'Area Kantung Bunga (Bebas Geser)',
        centerX,
        guideCenterY - guideH / 2 - 8,
      );
      ctx.restore();
    }

    // 3. Partition items into inside and front layers (drawn via drawFlowerRenderItems without recomputing)
    const globalMode = design.flowerPlacementMode || 'inside';
    const insideItems: FlowerRenderItem[] = [];
    const frontItems: FlowerRenderItem[] = [];

    items.forEach((it) => {
      const effectiveLayer = it.flower.layer !== undefined ? it.flower.layer : globalMode;
      if (effectiveLayer === 'front') {
        frontItems.push(it);
      } else {
        insideItems.push(it);
      }
    });

    // Pas 1: Bunga di dalam kantung buket (terpotong alami oleh bibir/pita depan)
    if (insideItems.length > 0) {
      drawFlowerRenderItems(ctx, insideItems);
    }

    // 4. Draw bouquet front collar & striped ribbon bow (tucks lower stems)
    drawBouquetFront(ctx, dims, design.bucketSize, design.wrapperType);

    // Pas 2: Bunga di depan gambar buket (mekar di atas lipatan / pita buket)
    if (frontItems.length > 0) {
      drawFlowerRenderItems(ctx, frontItems);
    }

    ctx.restore(); // end bouquet rotation transform

    // 5b. Beacon glow ring for hovered flower (from sidebar picker - hanya saat belum selesai)
    if (hoveredFlowerUid && hoveredFlowerUid !== selectedUid && !isFinished) {
      const hovItem = items.find((it) => it.flower.uid === hoveredFlowerUid);
      if (hovItem) {
        const cos2 = Math.cos(bouquetRotRad);
        const sin2 = Math.sin(bouquetRotRad);
        const dx2 = hovItem.x - pivotX;
        const dy2 = hovItem.y - pivotY;
        const hx = pivotX + dx2 * cos2 - dy2 * sin2;
        const hy = pivotY + dx2 * sin2 + dy2 * cos2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(hx, hy, hovItem.sz / 2 + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.shadowColor = 'rgba(225, 29, 72, 0.6)';
        ctx.shadowBlur = 12;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(hx, hy - hovItem.sz / 2 - 14, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#E11D48';
        ctx.fill();
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📍', hx, hy - hovItem.sz / 2 - 14);
        ctx.restore();
      }
    }

    // 6. Draw greeting text overlay (with live card override if dragging card)
    const effectiveText = liveCardRef.current
      ? { ...design.text, ...liveCardRef.current }
      : design.text;
    drawText(ctx, effectiveText);

    // 7. Interactive card drag outline & scale handle
    if (effectiveText.content && effectiveText.content.trim()) {
      const b = getCardBounds(effectiveText, canvasW, canvasH);
      const isCardActive =
        !isFinished &&
        (isDraggingCard ||
          isCardHovered ||
          isCardSelected ||
          design.currentStep === 3 ||
          dragState?.mode === 'scale-card');

      if (isCardActive) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 12);
        ctx.strokeStyle =
          isDraggingCard || dragState?.mode === 'scale-card'
            ? '#D97706'
            : 'rgba(217, 119, 6, 0.7)';
        ctx.lineWidth = isDraggingCard || dragState?.mode === 'scale-card' ? 2.5 : 1.5;
        ctx.setLineDash([6, 5]);
        ctx.stroke();

        const pillW = 126;
        const pillH = 22;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.roundRect(b.cx - pillW / 2, b.y - 20, pillW, pillH, 11);
        ctx.fillStyle = isDraggingCard ? '#D97706' : 'rgba(217, 119, 6, 0.92)';
        ctx.fill();

        ctx.font = 'bold 9.5px "Montserrat", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isEn ? '✉️ Drag Greeting Card' : '✉️ Seret Kartu Ucapan', b.cx, b.y - 9);

        const scaleHandleX = b.x + b.w + 6;
        const scaleHandleY = b.y + b.h + 6;

        ctx.beginPath();
        ctx.arc(scaleHandleX, scaleHandleY, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#D97706';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⤡', scaleHandleX, scaleHandleY);

        const currentScalePct = Math.round((effectiveText.cardScale ?? 1.0) * 100);
        ctx.font = 'bold 9px "Montserrat", sans-serif';
        ctx.fillStyle = '#B45309';
        ctx.textAlign = 'left';
        ctx.fillText(`${currentScalePct}%`, scaleHandleX + 13, scaleHandleY + 3);

        ctx.restore();
      }
    }

    ctx.restore(); // restore effectiveDpr transform
  }, [
    design,
    canvasW,
    canvasH,
    currentTheme,
    showGuide,
    isFinished,
    hoveredFlowerUid,
    selectedUid,
    isDraggingCard,
    isCardHovered,
    isCardSelected,
    dragState,
    isEn,
  ]);

  // ─── 2b. FAST-PATH CACHE-AWARE RENDER (0 PROMISES IF COMPLETE) ───────────
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const thisRenderId = ++renderIdRef.current;

    // Fast-path: Check if all images are already completely loaded in memory
    const isCustomBg = currentTheme === 'custom' && Boolean(design.customBgImage);
    const allCached =
      areImagesCached(design.selectedFlowers, design.bucketSize) &&
      (!isCustomBg || isImageCached(design.customBgImage));

    if (allCached) {
      // 100% SYNCHRONOUS FAST PATH - 0 Promises, 0 Microtasks, 60fps!
      paintCanvasSync(ctx);
      return;
    }

    // Slow-path: Preload missing images, with Anti-Race renderId verification
    (async () => {
      try {
        const tasks: Promise<any>[] = [preloadFlowers(design.selectedFlowers, design.bucketSize)];
        if (isCustomBg && design.customBgImage) {
          tasks.push(preloadImage(design.customBgImage));
        }
        await Promise.all(tasks);
      } catch {
        // Proceed with fallback
      }

      // ANTI-RACE: discard if a newer render was scheduled while waiting for network
      if (renderIdRef.current !== thisRenderId) {
        return;
      }

      paintCanvasSync(ctx);
    })();
  }, [canvasRef, design, currentTheme, paintCanvasSync]);

  // ─── 2c. SINGLE rAF SCHEDULER & EFFECT CLEANUP ───────────────────────────
  const scheduleRender = useCallback(() => {
    if (rAfIdRef.current !== null) {
      cancelAnimationFrame(rAfIdRef.current);
      rAfIdRef.current = null;
    }
    rAfIdRef.current = requestAnimationFrame(() => {
      rAfIdRef.current = null;
      renderCanvas();
    });
  }, [renderCanvas]);

  useEffect(() => {
    scheduleRender();
    return () => {
      if (rAfIdRef.current !== null) {
        cancelAnimationFrame(rAfIdRef.current);
        rAfIdRef.current = null;
      }
    };
  }, [scheduleRender, design]);

  // ─── 3. HIT TESTING UTILITIES ────────────────────────────────────────────
  // Transform raw canvas coords into bouquet-local coords (inverse rotation)
  const toBouquetCoords = (cx: number, cy: number): { x: number; y: number } => {
    const rotDeg = design.bouquetRotation ?? 0;
    if (rotDeg === 0) return { x: cx, y: cy };
    const rotRad = -(rotDeg * Math.PI) / 180;
    const pivX = canvasW / 2;
    const pivY = canvasH / 2;
    const dx = cx - pivX;
    const dy = cy - pivY;
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);
    return {
      x: pivX + dx * cos - dy * sin,
      y: pivY + dx * sin + dy * cos,
    };
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasW / rect.width;
    const scaleY = canvasH / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && (e as React.TouchEvent).touches && (e as React.TouchEvent).touches.length > 0) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const checkHandleHit = (mouseX: number, mouseY: number, item: FlowerRenderItem): DragMode | null => {
    const { x, y, sz, rot } = item;
    const half = sz / 2;

    // Transform mouse into flower's local coordinate space
    const dx = mouseX - x;
    const dy = mouseY - y;
    const cos = Math.cos(-rot);
    const sin = Math.sin(-rot);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0);
    const rotatePinDistance = half + (isTouch ? 38 : 32);
    const scaleHandleX = half + (isTouch ? 14 : 10);
    const scaleHandleY = half + (isTouch ? 14 : 10);
    const handleHitTolerance = isTouch ? 38 : 24;

    // 1. Rotate handle is at (0, -rotatePinDistance)
    const distToRotate = Math.hypot(localX - 0, localY - (-rotatePinDistance));
    if (distToRotate <= handleHitTolerance) return 'rotate';

    // 2. Scale handle is at (scaleHandleX, scaleHandleY)
    const distToScale = Math.hypot(localX - scaleHandleX, localY - scaleHandleY);
    if (distToScale <= handleHitTolerance) return 'scale';

    return null;
  };

  const checkBucketHandleHit = (
    flMouseX: number,
    flMouseY: number,
    dims: BouquetDimensions,
  ): 'bucket-rotate' | 'bucket-scale' | 'bucket-move' | null => {
    const { bucketX: bx, bucketY: by, bucketW: bw, bucketH: bh } = dims;
    const bcx = bx + bw / 2;
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0);
    const rotPinY = by - (isTouch ? 88 : 76);
    const scaleHandleX = bx + bw + (isTouch ? 24 : 18);
    const scaleHandleY = by + bh + (isTouch ? 24 : 18);
    const handleHitTolerance = isTouch ? 44 : 30;

    // 1. Check Rotate Handle Hit
    if (Math.hypot(flMouseX - bcx, flMouseY - rotPinY) <= handleHitTolerance) {
      return 'bucket-rotate';
    }

    // 2. Check Scale Handle Hit
    if (Math.hypot(flMouseX - scaleHandleX, flMouseY - scaleHandleY) <= handleHitTolerance) {
      return 'bucket-scale';
    }

    // 3. Check Bucket Body or Top Pill Badge Hit
    if (
      flMouseX >= bx - 16 &&
      flMouseX <= bx + bw + 16 &&
      flMouseY >= by - 50 &&
      flMouseY <= by + bh + 16
    ) {
      return 'bucket-move';
    }

    return null;
  };

  // ─── 4. MOUSE & TOUCH EVENT HANDLERS ─────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingActiveRef.current = true;
    try {
      e.currentTarget?.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is not supported
    }

    // Snapshot current state in case a drag move occurs
    try {
      preDragSnapshot.current = JSON.parse(JSON.stringify(design));
    } catch {
      preDragSnapshot.current = null;
    }
    hasMovedDrag.current = false;

    const { x: rawX, y: rawY } = getCanvasCoords(e);
    const mouseX = rawX;
    const mouseY = rawY;
    // For bouquet hit-testing, use bouquet-local (inverse-rotated) coords
    const { x: flMouseX, y: flMouseY } = toBouquetCoords(rawX, rawY);

    // 1. Check if user clicked on greeting card or its scale handle
    if (design.text.content && design.text.content.trim()) {
      const cardB = getCardBounds(design.text, canvasW, canvasH);
      const scalePinX = cardB.x + cardB.w + 6;
      const scalePinY = cardB.y + cardB.h + 6;
      const distToCardScale = Math.hypot(mouseX - scalePinX, mouseY - scalePinY);

      // Hit card resize handle
      if (distToCardScale <= 18) {
        setDragState({
          mode: 'scale-card',
          startMouseX: mouseX,
          startMouseY: mouseY,
          origX: cardB.cx,
          origY: cardB.cy,
          origSize: cardB.w,
          origRot: design.text.cardScale ?? 1.0,
        });
        setIsCardSelected(true);
        setSelectedUid(null);
        setIsBucketSelected(false);
        setIsDraggingCard(false);
        return;
      }

      // Hit card body to drag
      if (
        mouseX >= cardB.x - 4 &&
        mouseX <= cardB.x + cardB.w + 4 &&
        mouseY >= cardB.y - 20 &&
        mouseY <= cardB.y + cardB.h + 4
      ) {
        setIsDraggingCard(true);
        setIsCardSelected(true);
        cardDragOffset.current = { dx: mouseX - cardB.cx, dy: mouseY - cardB.cy };
        setSelectedUid(null);
        setIsBucketSelected(false);
        setDragState(null);
        return;
      }
    }

    // 2. If bucket is already selected, check its rotate or scale handles first!
    if (isBucketSelected && bucketDimsRef.current && !isFinished) {
      const bDims = bucketDimsRef.current;
      const bucketHit = checkBucketHandleHit(flMouseX, flMouseY, bDims);
      if (bucketHit === 'bucket-rotate') {
        const pivotX = canvasW / 2;
        const pivotY = canvasH / 2;
        setDragState({
          mode: 'bucket-rotate',
          startMouseX: rawX,
          startMouseY: rawY,
          origX: pivotX,
          origY: pivotY,
          origSize: design.bouquetScale ?? 1.0,
          origRot: design.bouquetRotation ?? 0,
          startAngle: Math.atan2(rawY - pivotY, rawX - pivotX),
        });
        setSelectedUid(null);
        setIsCardSelected(false);
        return;
      }
      if (bucketHit === 'bucket-scale') {
        const bcx = bDims.bucketX + bDims.bucketW / 2;
        const bcy = bDims.bucketY + bDims.bucketH / 2;
        setDragState({
          mode: 'bucket-scale',
          startMouseX: flMouseX,
          startMouseY: flMouseY,
          origX: bcx,
          origY: bcy,
          origSize: design.bouquetScale ?? 1.0,
          origRot: design.bouquetRotation ?? 0,
        });
        setSelectedUid(null);
        setIsCardSelected(false);
        return;
      }

      // 2b. Saat buket sedang dipilih, klik di mana saja pada area buket (bunga maupun kertas buket)
      // akan menggeser SELURUH BUKET sebagai satu kesatuan. Bunga TIDAK BISA diklik satuan lagi!
      const groupMinY = Math.min(bDims.bucketY - 160, bDims.wrapperTopY - 80);
      const groupMaxY = bDims.bottomY + 40;
      const groupMinX = bDims.bucketX - 40;
      const groupMaxX = bDims.bucketX + bDims.bucketW + 40;

      if (
        flMouseX >= groupMinX &&
        flMouseX <= groupMaxX &&
        flMouseY >= groupMinY &&
        flMouseY <= groupMaxY
      ) {
        const bucketOffset = design.bucketOffset ?? { x: 0, y: 0 };
        setDragState({
          mode: 'bucket-move',
          startMouseX: flMouseX,
          startMouseY: flMouseY,
          origX: bucketOffset.x,
          origY: bucketOffset.y,
          origSize: design.bouquetScale ?? 1.0,
          origRot: design.bouquetRotation ?? 0,
        });
        return;
      }

      // Jika klik di luar area buket pada kanvas kosong, lepas pilihan buket
      setSelectedUid(null);
      setIsBucketSelected(false);
      setIsCardSelected(false);
      return;
    }

    const items = renderItemsRef.current;

    // 3. If a flower is selected, check its rotate or scale handles
    if (selectedUid) {
      const selectedItem = items.find((it) => it.flower.uid === selectedUid);
      if (selectedItem) {
        const handleHit = checkHandleHit(flMouseX, flMouseY, selectedItem);
        if (handleHit) {
          setIsCardSelected(false);
          setIsBucketSelected(false);
          setDragState({
            mode: handleHit,
            startMouseX: flMouseX,
            startMouseY: flMouseY,
            origX: selectedItem.x,
            origY: selectedItem.y,
            origSize: selectedItem.sz,
            origRot: selectedItem.rot,
          });
          return;
        }
      }
    }

    // 4. Check flower bloom hits (bouquet-local coords, topmost flower first)
    // Di Step 4 (Pratinjau / Review), bunga dan buket sudah TERKUNCI menjadi 1 grup utuh,
    // sehingga bunga TIDAK BISA diklik/dipilih satuan lagi.
    if (design.currentStep !== 4) {
      const activeItems = currentRenderItems.length > 0 ? currentRenderItems : items;
      const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0);
      const flowerHitSlop = isTouchDevice ? 22 : 14;
      for (let i = activeItems.length - 1; i >= 0; i--) {
        const item = activeItems[i];
        const dist = Math.hypot(flMouseX - item.x, flMouseY - item.y);

        // Hit within circular bloom head boundary (with generous touch grace margin)
        if (dist <= Math.max(item.sz / 2 + flowerHitSlop, 36)) {
          setSelectedUid(item.flower.uid);
          setIsBucketSelected(false);
          setIsCardSelected(false);

          // If not already manual, lock in its current rendered position
          if (!item.flower.isManual) {
            updateFlower(item.flower.uid, {
              x: item.x,
              y: item.y,
              size: 92,
              customRotation: item.rot,
              rotation: Math.round(((item.rot * 180) / Math.PI) * 10) / 10,
              scale: item.flower.scale ?? 1.0,
              isManual: true,
            });
          }

          setDragState({
            mode: 'move',
            startMouseX: flMouseX,
            startMouseY: flMouseY,
            origX: item.x,
            origY: item.y,
            origSize: item.sz,
            origRot: item.rot,
          });
          return;
        }
      }
    }

    // 5. Check bucket body hit (select bucket and start dragging bucket directly)
    // Di Step 2 (merangkai bunga) atau Step 3 (kartu ucapan), buket TIDAK BISA diklik/dipilih.
    // Buket hanya bisa dipilih/diatur di Step 4 (Pratinjau / Review) atau Step 1!
    const allowBucketSelection = design.currentStep === 4 || design.currentStep === 1;
    if (allowBucketSelection && !isFinished && bucketDimsRef.current) {
      const bDims = bucketDimsRef.current;
      if (
        flMouseX >= bDims.bucketX - 14 &&
        flMouseX <= bDims.bucketX + bDims.bucketW + 14 &&
        flMouseY >= bDims.bucketY - 44 &&
        flMouseY <= bDims.bucketY + bDims.bucketH + 14
      ) {
        setIsBucketSelected(true);
        setSelectedUid(null);
        setIsCardSelected(false);
        const bucketOffset = design.bucketOffset ?? { x: 0, y: 0 };
        setDragState({
          mode: 'bucket-move',
          startMouseX: flMouseX,
          startMouseY: flMouseY,
          origX: bucketOffset.x,
          origY: bucketOffset.y,
          origSize: design.bouquetScale ?? 1.0,
          origRot: design.bouquetRotation ?? 0,
        });
        return;
      }
    }

    // 6. Clicked empty canvas space
    setSelectedUid(null);
    setIsBucketSelected(false);
    setIsCardSelected(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x: rawX, y: rawY } = getCanvasCoords(e);
    const mouseX = rawX;
    const mouseY = rawY;
    const { x: flMouseX, y: flMouseY } = toBouquetCoords(rawX, rawY);

    // Active Bucket Move Drag (Live Ref without React re-render)
    if (dragState?.mode === 'bucket-move') {
      e.preventDefault();
      hasMovedDrag.current = true;
      const dx = flMouseX - dragState.startMouseX;
      const dy = flMouseY - dragState.startMouseY;

      const maxClampX = Math.round(canvasW * 0.38);
      const maxClampY = Math.round(canvasH * 0.30);
      const targetX = Math.round(dragState.origX + dx);
      const targetY = Math.round(dragState.origY + dy);

      liveBucketRef.current = {
        ...liveBucketRef.current,
        offset: {
          x: Math.max(-maxClampX, Math.min(maxClampX, targetX)),
          y: Math.max(-maxClampY, Math.min(maxClampY, targetY)),
        },
      };
      scheduleRender();
      setCursorStyle('grabbing');
      return;
    }

    // Active Bucket Rotate Drag (Live Ref without React re-render)
    if (dragState?.mode === 'bucket-rotate') {
      e.preventDefault();
      hasMovedDrag.current = true;
      const pivotX = canvasW / 2;
      const pivotY = canvasH / 2;
      const currentAngle = Math.atan2(rawY - pivotY, rawX - pivotX);
      const startAngle = dragState.startAngle ?? 0;
      const deltaDeg = ((currentAngle - startAngle) * 180) / Math.PI;
      let newRot = Math.round(dragState.origRot + deltaDeg);
      while (newRot > 180) newRot -= 360;
      while (newRot < -180) newRot += 360;
      liveBucketRef.current = {
        ...liveBucketRef.current,
        rotation: newRot,
      };
      scheduleRender();
      setCursorStyle('grabbing');
      return;
    }

    // Active Bucket Scale Drag (Live Ref without React re-render)
    if (dragState?.mode === 'bucket-scale') {
      e.preventDefault();
      hasMovedDrag.current = true;
      const currentDist = Math.hypot(flMouseX - dragState.origX, flMouseY - dragState.origY);
      const startDist = Math.hypot(dragState.startMouseX - dragState.origX, dragState.startMouseY - dragState.origY);
      const ratio = currentDist / (startDist || 1);
      const newScale = Math.max(0.4, Math.min(2.0, Number((dragState.origSize * ratio).toFixed(2))));
      liveBucketRef.current = {
        ...liveBucketRef.current,
        scale: newScale,
      };
      scheduleRender();
      setCursorStyle('nwse-resize');
      return;
    }

    // Active Greeting Card Scaling (Live Ref without React re-render)
    if (dragState?.mode === 'scale-card') {
      e.preventDefault();
      hasMovedDrag.current = true;
      const currentDist = Math.hypot(mouseX - dragState.origX, mouseY - dragState.origY);
      const startDist = Math.hypot(
        dragState.startMouseX - dragState.origX,
        dragState.startMouseY - dragState.origY,
      );
      const ratio = currentDist / (startDist || 1);
      const newScale = Math.max(0.55, Math.min(2.3, Number((dragState.origRot * ratio).toFixed(2))));
      liveCardRef.current = {
        ...liveCardRef.current,
        cardScale: newScale,
      };
      scheduleRender();
      setCursorStyle('nwse-resize');
      return;
    }

    // Active Greeting Card Dragging (Live Ref without React re-render)
    if (isDraggingCard) {
      e.preventDefault();
      hasMovedDrag.current = true;
      const newCx = Math.max(40, Math.min(canvasW - 40, Math.round(mouseX - cardDragOffset.current.dx)));
      const newCy = Math.max(40, Math.min(canvasH - 40, Math.round(mouseY - cardDragOffset.current.dy)));
      liveCardRef.current = {
        ...liveCardRef.current,
        cardX: newCx,
        cardY: newCy,
      };
      scheduleRender();
      setCursorStyle('grabbing');
      return;
    }

    // Active Flower Dragging (Live Ref without React re-render)
    if (dragState && selectedUid) {
      e.preventDefault();
      hasMovedDrag.current = true;

      if (dragState.mode === 'move') {
        const dx = flMouseX - dragState.startMouseX;
        const dy = flMouseY - dragState.startMouseY;
        const newX = Math.round(dragState.origX + dx);
        const newY = Math.round(dragState.origY + dy);

        liveFlowerRef.current = {
          uid: selectedUid,
          x: newX,
          y: newY,
          size: dragState.origSize,
          rotation: dragState.origRot,
        };
        scheduleRender();
      } else if (dragState.mode === 'rotate') {
        const angle = Math.atan2(flMouseY - dragState.origY, flMouseX - dragState.origX);
        const newRot = angle + Math.PI / 2;
        liveFlowerRef.current = {
          uid: selectedUid,
          rotation: newRot,
        };
        scheduleRender();
      } else if (dragState.mode === 'scale') {
        const dist = Math.hypot(flMouseX - dragState.origX, flMouseY - dragState.origY);
        const newSize = Math.max(45, Math.min(180, Math.round(dist * 2)));
        const newScale = Number((newSize / 92).toFixed(2));
        liveFlowerRef.current = {
          uid: selectedUid,
          size: newSize,
          scale: newScale,
        };
        scheduleRender();
      }
      return;
    }

    // Card Hover Check (screen coords, card not rotated)
    if (design.text.content && design.text.content.trim()) {
      const cardB = getCardBounds(design.text, canvasW, canvasH);
      const scalePinX = cardB.x + cardB.w + 6;
      const scalePinY = cardB.y + cardB.h + 6;
      const distToCardScale = Math.hypot(mouseX - scalePinX, mouseY - scalePinY);

      if (distToCardScale <= 16) {
        setIsCardHovered(true);
        setCursorStyle('nwse-resize');
        return;
      }

      if (
        mouseX >= cardB.x &&
        mouseX <= cardB.x + cardB.w &&
        mouseY >= cardB.y - 12 &&
        mouseY <= cardB.y + cardB.h
      ) {
        setIsCardHovered(true);
        setCursorStyle('grab');
        return;
      }
    }
    setIsCardHovered(false);

    // Hover Cursor Detection for Selected Flower Handles (bouquet-local coords)
    const items = renderItemsRef.current;
    if (selectedUid) {
      const selectedItem = items.find((it) => it.flower.uid === selectedUid);
      if (selectedItem) {
        const handleHit = checkHandleHit(flMouseX, flMouseY, selectedItem);
        if (handleHit === 'rotate') {
          setCursorStyle('grab');
          return;
        }
        if (handleHit === 'scale') {
          setCursorStyle('nwse-resize');
          return;
        }
      }
    }

    // Flower Hover (bouquet-local coords)
    let hovered = false;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (Math.hypot(flMouseX - item.x, flMouseY - item.y) <= item.sz / 2 + 6) {
        hovered = true;
        break;
      }
    }
    if (hovered) {
      setIsBucketHovered(false);
      setCursorStyle('move');
      return;
    }

    // Bucket Handles Hover Detection when Bucket is Selected
    if (!isFinished && isBucketSelected && bucketDimsRef.current) {
      const bDims = bucketDimsRef.current;
      const bHit = checkBucketHandleHit(flMouseX, flMouseY, bDims);
      if (bHit === 'bucket-rotate') {
        setCursorStyle('grab');
        return;
      }
      if (bHit === 'bucket-scale') {
        setCursorStyle('nwse-resize');
        return;
      }
      if (bHit === 'bucket-move') {
        setCursorStyle('grab');
        return;
      }
    }

    // Bucket Hover Check (when not selected)
    if (!isFinished && bucketDimsRef.current) {
      const bDims = bucketDimsRef.current;
      const isOverBucket =
        flMouseX >= bDims.bucketX - 14 &&
        flMouseX <= bDims.bucketX + bDims.bucketW + 14 &&
        flMouseY >= bDims.bucketY - 44 &&
        flMouseY <= bDims.bucketY + bDims.bucketH + 14;
      setIsBucketHovered(isOverBucket);
      if (isOverBucket) {
        setCursorStyle('pointer');
        return;
      }
    } else {
      setIsBucketHovered(false);
    }

    setCursorStyle('default');
  };

  const commitDrag = useCallback(() => {
    if (!isDraggingActiveRef.current && !hasMovedDrag.current) return;
    isDraggingActiveRef.current = false;

    // Commit live transforms once on pointer release (commit to React state only upon release)
    if (hasMovedDrag.current) {
      if (liveBucketRef.current) {
        const lb = liveBucketRef.current;
        if (lb.offset) setBucketOffset(lb.offset);
        if (lb.rotation !== undefined) setBouquetRotation(lb.rotation);
        if (lb.scale !== undefined) setBouquetScale(lb.scale);
      } else if (liveFlowerRef.current) {
        const lf = liveFlowerRef.current;
        const targetUid = lf.uid || selectedUid;
        if (targetUid) {
          updateFlower(targetUid, {
            ...(lf.x !== undefined ? { x: lf.x } : {}),
            ...(lf.y !== undefined ? { y: lf.y } : {}),
            ...(lf.scale !== undefined ? { scale: lf.scale } : {}),
            ...(lf.rotation !== undefined
              ? {
                  customRotation: lf.rotation,
                  rotation: Math.round(((lf.rotation * 180) / Math.PI) * 10) / 10,
                }
              : {}),
            isManual: true,
          });
        }
      } else if (liveCardRef.current) {
        setText(liveCardRef.current);
      }

      // Commit the preDragSnapshot to undo history
      if (preDragSnapshot.current) {
        recordSnapshot(preDragSnapshot.current);
      }
    }

    // Clear drag state & snapshot (live refs remain active until React state commits to prevent bounce/mantul)
    preDragSnapshot.current = null;
    hasMovedDrag.current = false;
    setDragState(null);
    setIsDraggingCard(false);

    scheduleRender();
  }, [
    selectedUid,
    setBucketOffset,
    setBouquetRotation,
    setBouquetScale,
    updateFlower,
    setText,
    recordSnapshot,
    scheduleRender,
  ]);

  const cancelDrag = useCallback(() => {
    isDraggingActiveRef.current = false;

    // Revert transform to preDragSnapshot (batal), JANGAN commit posisi tengah drag
    if (preDragSnapshot.current) {
      const snap = preDragSnapshot.current;
      if (snap.bucketOffset !== undefined) setBucketOffset(snap.bucketOffset);
      if (snap.bouquetRotation !== undefined) setBouquetRotation(snap.bouquetRotation);
      if (snap.bouquetScale !== undefined) setBouquetScale(snap.bouquetScale);
      if (snap.text) setText(snap.text);

      const targetUid = liveFlowerRef.current?.uid || selectedUid;
      if (targetUid && snap.selectedFlowers) {
        const origFl = snap.selectedFlowers.find((f: any) => f.uid === targetUid);
        if (origFl) {
          updateFlower(targetUid, {
            x: origFl.x,
            y: origFl.y,
            size: origFl.size,
            scale: origFl.scale,
            rotation: origFl.rotation,
            customRotation: origFl.customRotation,
            isManual: origFl.isManual,
          });
        }
      }
    }

    // Unconditionally clear all liveRefs and drag state without recording undo history
    liveBucketRef.current = null;
    liveFlowerRef.current = null;
    liveCardRef.current = null;
    preDragSnapshot.current = null;
    hasMovedDrag.current = false;
    setDragState(null);
    setIsDraggingCard(false);

    scheduleRender();
  }, [
    selectedUid,
    setBucketOffset,
    setBouquetRotation,
    setBouquetScale,
    updateFlower,
    setText,
    scheduleRender,
  ]);

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      if (e.currentTarget?.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    commitDrag();
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      if (e.currentTarget?.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    cancelDrag();
  };

  const handleLostPointerCapture = (_e: React.PointerEvent<HTMLCanvasElement>) => {
    // Pastikan lostpointercapture tidak memicu commit kedua setelah pointerup (tidak ada entri undo ganda)
    if (isDraggingActiveRef.current) {
      commitDrag();
    }
  };

  // Live transform bridge for TransformControlOverlay
  const handleLiveFlowerTransform = useCallback((live: LiveFlowerTransform | null) => {
    liveFlowerRef.current = live;
    scheduleRender();
  }, [scheduleRender]);

  const handleLiveBucketTransform = useCallback((live: LiveBucketTransform | null) => {
    liveBucketRef.current = live;
    scheduleRender();
  }, [scheduleRender]);

  const handleCommitFlower = useCallback((uid: string, updates: Partial<PlacedFlower>) => {
    // Keep liveFlowerRef alive until React commits the update to prevent bounce/flash
    updateFlower(uid, updates);
  }, [updateFlower]);

  const handleCommitBucket = useCallback((updates: { scale?: number; rotation?: number; offset?: { x: number; y: number } }) => {
    // Keep liveBucketRef alive until React commits the update to prevent bounce/flash
    if (updates.scale !== undefined) setBouquetScale(updates.scale);
    if (updates.rotation !== undefined) setBouquetRotation(updates.rotation);
    if (updates.offset !== undefined) setBucketOffset(updates.offset);
  }, [setBouquetScale, setBouquetRotation, setBucketOffset]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isFinished) return;
    const { x: rawX, y: rawY } = getCanvasCoords(e);
    const { x: flMouseX, y: flMouseY } = toBouquetCoords(rawX, rawY);
    const bucketOffset = design.bucketOffset ?? { x: 0, y: 0 };
    const bDims = bucketDimsRef.current ?? getBouquetDimensions(canvasW, canvasH, design.bucketSize, design.bouquetScale ?? 1.0, bucketOffset);
    if (
      flMouseX >= bDims.bucketX - 14 &&
      flMouseX <= bDims.bucketX + bDims.bucketW + 14 &&
      flMouseY >= bDims.bucketY - 44 &&
      flMouseY <= bDims.bucketY + bDims.bucketH + 14
    ) {
      // Double click buket untuk mereset posisi kembali tepat di tengah dan rotasi 0
      recordSnapshot();
      setBucketOffset({ x: 0, y: 0 });
      setBouquetRotation(0);
    }
  };

  // ─── 5. DRAG-FROM-CATALOG DROP HANDLER ───────────────────────────────────
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const data = e.dataTransfer.types.includes('application/flower');
    if (data) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      if (!isDragOver) setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const rawData = e.dataTransfer.getData('application/flower');
    if (!rawData) return;

    try {
      const flower = JSON.parse(rawData);
      const { x, y } = getCanvasCoords(e);
      addFlowerAtPosition(flower, x, y);
    } catch {
      // Ignore JSON parse errors
    }
  };

  // ─── 6. KEYBOARD SHORTCUTS (UNDO, REDO, ESCAPE, DELETE) ────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        if (canRedo) redo();
      } else if (e.key === 'Escape') {
        cancelDrag();
        setSelectedUid(null);
        setIsBucketSelected(false);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedUid) {
        e.preventDefault();
        removeFlowerByUid(selectedUid);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, selectedUid, setSelectedUid, setIsBucketSelected, removeFlowerByUid, cancelDrag]);

  return (
    <div className="preview-canvas-container">
      {/* Visual Canvas Area */}
      <div
        className={`canvas-wrapper ${isDragOver ? 'canvas-drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="canvas-drop-overlay">
            <span>{t('canvas_drop_overlay')}</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={Math.round(canvasW * dpr)}
          height={Math.round(canvasH * dpr)}
          className="preview-canvas"
          style={{ cursor: cursorStyle, touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handleLostPointerCapture}
          onDoubleClick={handleDoubleClick}
          aria-label="Interactive flower bouquet canvas editor"
        />

        {/* DOM-based interactive transform overlay for flowers & whole bouquet */}
        {!isFinished && (
          <TransformControlOverlay
            canvasRef={canvasRef}
            canvasW={canvasW}
            canvasH={canvasH}
            bouquetRotation={design.bouquetRotation ?? 0}
            bouquetScale={design.bouquetScale ?? 1.0}
            bucketOffset={design.bucketOffset ?? { x: 0, y: 0 }}
            selectedItem={currentSelectedItem}
            isBucketSelected={isBucketSelected}
            bucketDims={currentBucketDims}
            onUpdateFlower={updateFlower}
            onUpdateBucket={(updates) => {
              if (updates.scale !== undefined) setBouquetScale(updates.scale);
              if (updates.rotation !== undefined) setBouquetRotation(updates.rotation);
              if (updates.offset !== undefined) setBucketOffset(updates.offset);
            }}
            onLiveFlowerTransform={handleLiveFlowerTransform}
            onLiveBucketTransform={handleLiveBucketTransform}
            onCommitFlower={handleCommitFlower}
            onCommitBucket={handleCommitBucket}
            onDeselect={() => {
              liveFlowerRef.current = null;
              liveBucketRef.current = null;
              liveCardRef.current = null;
              setSelectedUid(null);
              setIsBucketSelected(false);
            }}
            onSelectBouquet={() => {
              setSelectedUid(null);
              setIsBucketSelected((prev: boolean) => !prev);
            }}
            onLayerChange={changeFlowerLayer}
            onDuplicate={duplicateFlower}
            onDelete={removeFlowerByUid}
            onReset={resetElementTransform}
            recordSnapshot={recordSnapshot}
            currentStep={design.currentStep}
          />
        )}

        {/* Floating Undo/Redo Controls */}
        {!isFinished && (
          <div className="canvas-history-controls" aria-label="Undo and Redo">
            <button
              type="button"
              className="canvas-history-btn"
              onClick={() => undo()}
              disabled={!canUndo}
              title={isEn ? 'Undo (Ctrl+Z)' : 'Batalkan (Ctrl+Z)'}
              aria-label={t('btn_undo')}
            >
              <RotateCcw size={15} />
              <span className="history-btn-label">{t('btn_undo')}</span>
            </button>
            <button
              type="button"
              className="canvas-history-btn"
              onClick={() => redo()}
              disabled={!canRedo}
              title={isEn ? 'Redo (Ctrl+Y)' : 'Ulangi (Ctrl+Y)'}
              aria-label={t('btn_redo')}
            >
              <RotateCw size={15} />
              <span className="history-btn-label">{t('btn_redo')}</span>
            </button>
          </div>
        )}

        {design.selectedFlowers.length === 0 && (
          <div className="canvas-empty-hint">
            <span className="canvas-hint-emoji">🌸</span>
            <p>{t('canvas_empty_hint')}</p>
          </div>
        )}
      </div>

      {/* User Helper Caption */}
      <div className="canvas-interaction-guide">
        <span>{t('canvas_tips_interactive')}</span>
      </div>
    </div>
  );
}
