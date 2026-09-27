'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDesign } from '@/context/DesignContext';
import {
  drawBouquetBack,
  drawBouquetFront,
  drawFlowers,
  drawText,
  getCardBounds,
  preloadFlowers,
  computeFlowerRenderItems,
  getBouquetDimensions,
  FlowerRenderItem,
  BouquetDimensions,
  CANVAS_RATIO_DIMENSIONS,
  BACKGROUND_THEMES,
  drawCanvasBackground,
} from '@/utils/canvasUtils';
import { CanvasRatio, BackgroundTheme } from '@/types/design';

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
  } = useDesign();

  const preDragSnapshot = useRef<any>(null);
  const hasMovedDrag = useRef<boolean>(false);

  const currentRatio: CanvasRatio = design.canvasRatio ?? '1:1';
  const currentTheme: BackgroundTheme = design.bgTheme ?? 'studio-warm';
  const { width: canvasW, height: canvasH } =
    CANVAS_RATIO_DIMENSIONS[currentRatio] || CANVAS_RATIO_DIMENSIONS['1:1'];

  const [dragState, setDragState] = useState<DragState | null>(null);
  
  // Status selesai / final (Step 3 ucapan, Step 4 pratinjau, Step 5 unduh, atau status final)
  const isFinished = design.currentStep >= 3 || design.final2D.status === 'final';

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

  // Cache latest computed render items for instant hit testing
  const renderItemsRef = useRef<FlowerRenderItem[]>([]);

  // ─── 1. SELECTION HANDLES DRAWER ─────────────────────────────────────────
  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, item: FlowerRenderItem) => {
    const { x, y, sz, rot } = item;
    const half = sz / 2;
    const rotatePinDistance = half + 26;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Selection dashed boundary
    ctx.beginPath();
    ctx.roundRect(-half - 6, -half - 6, sz + 12, sz + 12, 10);
    ctx.strokeStyle = '#D97706'; // Vibrant amber gold
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();

    // Stem line to rotate knob
    ctx.beginPath();
    ctx.moveTo(0, -half - 6);
    ctx.lineTo(0, -rotatePinDistance);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.stroke();

    // Rotate Handle (Top circle with rotation icon)
    ctx.beginPath();
    ctx.arc(0, -rotatePinDistance, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Rotate icon ↻ inside circle
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#D97706';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↻', 0, -rotatePinDistance);

    // Scale Handle (Bottom-Right corner square with diagonal arrow)
    const scaleHandleX = half + 6;
    const scaleHandleY = half + 6;
    ctx.beginPath();
    ctx.arc(scaleHandleX, scaleHandleY, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '11px sans-serif';
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
    const handleRadius = isTouch ? 15 : 12;

    ctx.save();

    // 1. Dashed Bounding Box around Bucket
    ctx.beginPath();
    ctx.roundRect(bx - 8, by - 8, bw + 16, bh + 16, 18);
    ctx.strokeStyle = isSelected ? '#E11D48' : 'rgba(225, 29, 72, 0.45)';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.setLineDash(isSelected ? [8, 6] : [6, 6]);
    if (isSelected) {
      ctx.shadowColor = 'rgba(225, 29, 72, 0.35)';
      ctx.shadowBlur = 14;
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // 2. Top Pill Badge: "🪣 Buket • Seret / Putar / Ukuran"
    const pillW = isSelected ? 186 : 136;
    const pillH = 26;
    const pillX = bcx - pillW / 2;
    const pillY = by - 36;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 13);
    ctx.fillStyle = isSelected ? '#E11D48' : 'rgba(225, 29, 72, 0.88)';
    ctx.shadowColor = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = 'bold 10px "Montserrat", -apple-system, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      isSelected ? '🪣 Buket • Seret / Putar / Ukuran' : '🪣 Buket (Ketuk)',
      bcx,
      pillY + pillH / 2,
    );

    // 3. Center Drag Move Icon
    const moveRadius = isTouch ? 22 : 18;
    ctx.beginPath();
    ctx.arc(bcx, bcy, moveRadius, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? 'rgba(225, 29, 72, 0.18)' : 'rgba(225, 29, 72, 0.10)';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#E11D48' : 'rgba(225, 29, 72, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '18px sans-serif';
    ctx.fillStyle = isSelected ? '#E11D48' : 'rgba(225, 29, 72, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✥', bcx, bcy);

    // If bucket is selected, show interactive Rotate Handle and Scale Handle!
    if (isSelected) {
      // 4. ROTATE HANDLE (Top, above badge)
      const rotPinY = by - 68;
      // Stem line
      ctx.beginPath();
      ctx.moveTo(bcx, pillY);
      ctx.lineTo(bcx, rotPinY);
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotate knob circle
      ctx.beginPath();
      ctx.arc(bcx, rotPinY, handleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Rotate icon ↻
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#E11D48';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('↻', bcx, rotPinY);

      // Rotation Degree Badge
      const currentRot = Math.round(design.bouquetRotation ?? 0);
      const rotBadgeW = 42;
      const rotBadgeH = 18;
      ctx.beginPath();
      ctx.roundRect(bcx + handleRadius + 6, rotPinY - rotBadgeH / 2, rotBadgeW, rotBadgeH, 9);
      ctx.fillStyle = '#E11D48';
      ctx.fill();
      ctx.font = 'bold 9.5px "Montserrat", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${currentRot}°`, bcx + handleRadius + 6 + rotBadgeW / 2, rotPinY);

      // 5. SCALE HANDLE (Bottom-Right corner)
      const scaleHandleX = bx + bw + 14;
      const scaleHandleY = by + bh + 14;

      // Stem line to corner
      ctx.beginPath();
      ctx.moveTo(bx + bw, by + bh);
      ctx.lineTo(scaleHandleX, scaleHandleY);
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Scale knob circle
      ctx.beginPath();
      ctx.arc(scaleHandleX, scaleHandleY, handleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Scale icon ⤡
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#E11D48';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⤡', scaleHandleX, scaleHandleY);

      // Scale Percentage Badge
      const currentScalePct = Math.round((design.bouquetScale ?? 1.0) * 100);
      const scaleBadgeW = 48;
      const scaleBadgeH = 18;
      ctx.beginPath();
      ctx.roundRect(scaleHandleX + handleRadius + 4, scaleHandleY - scaleBadgeH / 2, scaleBadgeW, scaleBadgeH, 9);
      ctx.fillStyle = '#BE123C';
      ctx.fill();
      ctx.font = 'bold 9.5px "Montserrat", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${currentScalePct}%`, scaleHandleX + handleRadius + 4 + scaleBadgeW / 2, scaleHandleY);
    }

    ctx.restore();
  };

  // ─── 2. RENDER FUNCTION ──────────────────────────────────────────────────
  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Preload flower and wrapper images first
    await preloadFlowers(design.selectedFlowers, design.bucketSize);

    // Clear canvas
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Dynamic Curated Studio Backdrop Theme
    drawCanvasBackground(ctx, currentTheme, canvasW, canvasH);

    // 1. Draw bouquet back wrapper + flowers + front — all inside a rotation transform
    const bouquetRotDeg = design.bouquetRotation ?? 0;
    const bouquetRotRad = (bouquetRotDeg * Math.PI) / 180;
    const pivotX = canvasW / 2;
    const pivotY = canvasH / 2;
    const bucketOffset = design.bucketOffset ?? { x: 0, y: 0 };

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(bouquetRotRad);
    ctx.translate(-pivotX, -pivotY);

    const dims = drawBouquetBack(
      ctx,
      design.bucketSize,
      design.wrapperType,
      design.bouquetScale ?? 1.0,
      bucketOffset,
    );
    bucketDimsRef.current = dims;

    // 2. Compute current item placements
    const items = computeFlowerRenderItems(design.selectedFlowers, dims);
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

      // Subtle fill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();

      // Small badge text at top of guide
      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = 'rgba(184, 134, 11, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('Area Kantung Bunga (Bebas Geser)', centerX, guideCenterY - guideH / 2 - 8);
      ctx.restore();
    }

    // 3. Draw flowers inside and/or in front of the bucket based on layer setting
    const globalMode = design.flowerPlacementMode || 'inside';
    const insideFlowers: typeof design.selectedFlowers = [];
    const frontFlowers: typeof design.selectedFlowers = [];

    design.selectedFlowers.forEach((f) => {
      // Prioritas utama: pengaturan individual bunga (f.layer)
      // Jika f.layer belum diset, baru ikuti pengaturan global (globalMode)
      const effectiveLayer = f.layer !== undefined ? f.layer : globalMode;
      if (effectiveLayer === 'front') {
        frontFlowers.push(f);
      } else {
        insideFlowers.push(f);
      }
    });

    // Pas 1: Bunga di dalam kantung buket (terpotong alami oleh bibir/pita depan)
    if (insideFlowers.length > 0) {
      drawFlowers(ctx, insideFlowers, dims);
    }

    // 4. Draw bouquet front collar & striped ribbon bow (tucks lower stems)
    drawBouquetFront(ctx, dims, design.bucketSize, design.wrapperType);

    // Pas 2: Bunga di depan gambar buket (mekar di atas lipatan / pita buket)
    if (frontFlowers.length > 0) {
      drawFlowers(ctx, frontFlowers, dims);
    }

    // 4b. Draw Bucket Interactive Selection & Hover handles INSIDE rotated bouquet space
    const isBucketActive =
      isBucketSelected ||
      isBucketHovered ||
      dragState?.mode === 'bucket-move' ||
      dragState?.mode === 'bucket-rotate' ||
      dragState?.mode === 'bucket-scale';
    if (!isFinished && isBucketActive) {
      drawBucketInteractiveHandles(ctx, dims, isBucketSelected, isBucketHovered, dragState?.mode);
    }

    ctx.restore(); // end bouquet rotation transform

    // 5. Draw interactive selection handles if a flower is selected (hanya saat belum final/selesai)
    // NOTE: handles drawn in screen space — need to apply rotation offset to positions
    if (selectedUid && !isFinished) {
      const selectedItem = items.find((it) => it.flower.uid === selectedUid);
      if (selectedItem) {
        const cos = Math.cos(bouquetRotRad);
        const sin = Math.sin(bouquetRotRad);
        const dx = selectedItem.x - pivotX;
        const dy = selectedItem.y - pivotY;
        const rotatedItem = {
          ...selectedItem,
          x: pivotX + dx * cos - dy * sin,
          y: pivotY + dx * sin + dy * cos,
          rot: selectedItem.rot + bouquetRotRad,
        };
        drawSelectionHandles(ctx, rotatedItem);
      }
    }

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

        // Pin icon above the hovered flower
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

    // 6. Draw greeting text overlay
    drawText(ctx, design.text);

    // 7. Interactive card drag outline & scale handle
    if (design.text.content && design.text.content.trim()) {
      const b = getCardBounds(design.text, canvasW, canvasH);
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

        // Drag pill badge at top of card
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
        ctx.fillText('✉️ Seret Kartu Ucapan', b.cx, b.y - 9);

        // Scale Handle (Bottom-Right corner square with diagonal arrow)
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

        // Scale percentage badge
        const currentScalePct = Math.round((design.text.cardScale ?? 1.0) * 100);
        ctx.font = 'bold 9px "Montserrat", sans-serif';
        ctx.fillStyle = '#B45309';
        ctx.textAlign = 'left';
        ctx.fillText(`${currentScalePct}%`, scaleHandleX + 13, scaleHandleY + 3);

        ctx.restore();
      }
    }
  }, [
    design,
    canvasRef,
    showGuide,
    isFinished,
    selectedUid,
    currentRatio,
    hoveredFlowerUid,
    isDraggingCard,
    isCardHovered,
    isCardSelected,
    dragState,
    canvasW,
    canvasH,
    currentTheme,
    isBucketHovered,
    isBucketSelected,
  ]);

  useEffect(() => {
    render();
  }, [render]);

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

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
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

    // 1. Rotate handle is at (0, -half - 26)
    const rotPinDist = half + 26;
    const distToRotate = Math.hypot(localX - 0, localY - (-rotPinDist));
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0);
    const handleHitTolerance = isTouch ? 28 : 16;
    if (distToRotate <= handleHitTolerance) return 'rotate';

    // 2. Scale handle is at (half + 6, half + 6)
    const distToScale = Math.hypot(localX - (half + 6), localY - (half + 6));
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
    const rotPinY = by - 68;
    const scaleHandleX = bx + bw + 14;
    const scaleHandleY = by + bh + 14;

    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0);
    const handleHitTolerance = isTouch ? 36 : 22;

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
      flMouseX >= bx - 14 &&
      flMouseX <= bx + bw + 14 &&
      flMouseY >= by - 44 &&
      flMouseY <= by + bh + 14
    ) {
      return 'bucket-move';
    }

    return null;
  };

  // ─── 4. MOUSE & TOUCH EVENT HANDLERS ─────────────────────────────────────
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
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
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0);
    const flowerHitSlop = isTouchDevice ? 16 : 6;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const dist = Math.hypot(flMouseX - item.x, flMouseY - item.y);

      // Hit within circular bloom head boundary (with touch grace margin)
      if (dist <= item.sz / 2 + flowerHitSlop) {
        setSelectedUid(item.flower.uid);
        setIsBucketSelected(false);
        setIsCardSelected(false);

        // If not already manual, lock in its current rendered position
        if (!item.flower.isManual) {
          updateFlower(item.flower.uid, {
            x: item.x,
            y: item.y,
            size: item.sz,
            customRotation: item.rot,
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

    // 5. Check bucket body hit (select bucket and start dragging bucket directly)
    if (!isFinished && bucketDimsRef.current) {
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

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const { x: rawX, y: rawY } = getCanvasCoords(e);
    const mouseX = rawX;
    const mouseY = rawY;
    const { x: flMouseX, y: flMouseY } = toBouquetCoords(rawX, rawY);

    // Active Bucket Move Drag
    if (dragState?.mode === 'bucket-move') {
      if ('touches' in e) e.preventDefault();
      hasMovedDrag.current = true;
      const dx = flMouseX - dragState.startMouseX;
      const dy = flMouseY - dragState.startMouseY;

      // Batasi pergeseran buket dalam rentang aman agar tidak bablas keluar kanvas
      const maxClampX = Math.round(canvasW * 0.38);
      const maxClampY = Math.round(canvasH * 0.30);
      const targetX = Math.round(dragState.origX + dx);
      const targetY = Math.round(dragState.origY + dy);

      setBucketOffset({
        x: Math.max(-maxClampX, Math.min(maxClampX, targetX)),
        y: Math.max(-maxClampY, Math.min(maxClampY, targetY)),
      });
      setCursorStyle('grabbing');
      return;
    }

    // Active Bucket Rotate Drag
    if (dragState?.mode === 'bucket-rotate') {
      if ('touches' in e) e.preventDefault();
      hasMovedDrag.current = true;
      const pivotX = canvasW / 2;
      const pivotY = canvasH / 2;
      const currentAngle = Math.atan2(rawY - pivotY, rawX - pivotX);
      const startAngle = dragState.startAngle ?? 0;
      const deltaDeg = ((currentAngle - startAngle) * 180) / Math.PI;
      let newRot = Math.round(dragState.origRot + deltaDeg);
      while (newRot > 180) newRot -= 360;
      while (newRot < -180) newRot += 360;
      setBouquetRotation(newRot);
      setCursorStyle('grabbing');
      return;
    }

    // Active Bucket Scale Drag
    if (dragState?.mode === 'bucket-scale') {
      if ('touches' in e) e.preventDefault();
      hasMovedDrag.current = true;
      const currentDist = Math.hypot(flMouseX - dragState.origX, flMouseY - dragState.origY);
      const startDist = Math.hypot(dragState.startMouseX - dragState.origX, dragState.startMouseY - dragState.origY);
      const ratio = currentDist / (startDist || 1);
      const newScale = Math.max(0.4, Math.min(2.0, Number((dragState.origSize * ratio).toFixed(2))));
      setBouquetScale(newScale);
      setCursorStyle('nwse-resize');
      return;
    }

    // Active Greeting Card Scaling
    if (dragState?.mode === 'scale-card') {
      if ('touches' in e) e.preventDefault();
      hasMovedDrag.current = true;
      const currentDist = Math.hypot(mouseX - dragState.origX, mouseY - dragState.origY);
      const startDist = Math.hypot(
        dragState.startMouseX - dragState.origX,
        dragState.startMouseY - dragState.origY,
      );
      const ratio = currentDist / (startDist || 1);
      const newScale = Math.max(0.55, Math.min(2.3, Number((dragState.origRot * ratio).toFixed(2))));
      setText({ cardScale: newScale });
      setCursorStyle('nwse-resize');
      return;
    }

    // Active Greeting Card Dragging
    if (isDraggingCard) {
      if ('touches' in e) e.preventDefault();
      hasMovedDrag.current = true;
      const newCx = Math.max(40, Math.min(canvasW - 40, Math.round(mouseX - cardDragOffset.current.dx)));
      const newCy = Math.max(40, Math.min(canvasH - 40, Math.round(mouseY - cardDragOffset.current.dy)));
      setText({ cardX: newCx, cardY: newCy });
      setCursorStyle('grabbing');
      return;
    }

    // Active Flower Dragging (uses bouquet-local coords)
    if (dragState && selectedUid) {
      if ('touches' in e) e.preventDefault();
      hasMovedDrag.current = true;

      if (dragState.mode === 'move') {
        const dx = flMouseX - dragState.startMouseX;
        const dy = flMouseY - dragState.startMouseY;
        const newX = Math.round(dragState.origX + dx);
        const newY = Math.round(dragState.origY + dy);

        updateFlower(selectedUid, {
          x: newX,
          y: newY,
          size: dragState.origSize,
          customRotation: dragState.origRot,
        });
      } else if (dragState.mode === 'rotate') {
        const angle = Math.atan2(flMouseY - dragState.origY, flMouseX - dragState.origX);
        const newRot = angle + Math.PI / 2;
        updateFlower(selectedUid, { customRotation: newRot });
      } else if (dragState.mode === 'scale') {
        const dist = Math.hypot(flMouseX - dragState.origX, flMouseY - dragState.origY);
        const newSize = Math.max(45, Math.min(180, Math.round(dist * 2)));
        const newScale = Number((newSize / 92).toFixed(2));
        updateFlower(selectedUid, { size: newSize, scale: newScale });
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

  const handlePointerUp = () => {
    // If user dragged a flower, bucket, or card, commit the preDragSnapshot to undo history
    if (hasMovedDrag.current && preDragSnapshot.current) {
      recordSnapshot(preDragSnapshot.current);
    }
    preDragSnapshot.current = null;
    hasMovedDrag.current = false;

    setDragState(null);
    setIsDraggingCard(false);
  };

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
            <span>✨ Lepaskan Bunga di Posisi Ini</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={canvasW}
          height={canvasH}
          className="preview-canvas"
          style={{ cursor: cursorStyle, touchAction: 'none' }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          aria-label="Interactive flower bouquet canvas editor"
        />

        {design.selectedFlowers.length === 0 && (
          <div className="canvas-empty-hint">
            <span className="canvas-hint-emoji">🌸</span>
            <p>Pilih bunga di menu atas untuk mulai merangkai!</p>
          </div>
        )}
      </div>

      {/* User Helper Caption */}
      <div className="canvas-interaction-guide">
        <span>
          💡 <strong>Tips Interaktif:</strong> Ketuk <strong>🪣 buket</strong> di kanvas untuk atur (tarik pin <strong>↻</strong> untuk putar, pin <strong>⤡</strong> untuk ubah ukuran, atau seret buket) — ketuk <strong>bunga</strong> untuk geser/putar manual — double-click buket untuk reset.
        </span>
      </div>
    </div>
  );
}
