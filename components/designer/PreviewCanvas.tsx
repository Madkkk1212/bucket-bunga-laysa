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
  CANVAS_RATIO_DIMENSIONS,
  BACKGROUND_THEMES,
  drawCanvasBackground,
} from '@/utils/canvasUtils';
import { CanvasRatio, BackgroundTheme } from '@/types/design';

interface PreviewCanvasProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

type DragMode = 'move' | 'rotate' | 'scale' | 'scale-card';

interface DragState {
  mode: DragMode;
  startMouseX: number;
  startMouseY: number;
  origX: number;
  origY: number;
  origSize: number;
  origRot: number;
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
    hoveredFlowerUid,
    setFlowerPlacementMode,
    toggleFlowerLayer,
    setBucketOffset,
  } = useDesign();

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

  // Bucket drag state
  const [isDraggingBucket, setIsDraggingBucket] = useState<boolean>(false);
  const [isBucketHovered, setIsBucketHovered] = useState<boolean>(false);
  const bucketDragStart = useRef<{ mouseX: number; mouseY: number; origOffsetX: number; origOffsetY: number } | null>(null);

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

  // ─── 1b. BUCKET DRAG HANDLE DRAWER ───────────────────────────────────────
  const drawBucketDragHandle = (
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    bw: number,
    bh: number,
    active: boolean,
  ) => {
    ctx.save();

    // Dashed border around entire bucket
    ctx.beginPath();
    ctx.roundRect(bx - 6, by - 6, bw + 12, bh + 12, 16);
    ctx.strokeStyle = active ? '#7C3AED' : 'rgba(124, 58, 237, 0.55)';
    ctx.lineWidth = active ? 2.5 : 1.8;
    ctx.setLineDash([7, 5]);
    ctx.shadowColor = 'rgba(124, 58, 237, 0.45)';
    ctx.shadowBlur = active ? 18 : 8;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Drag pill badge at top center of bucket
    const pillW = 148;
    const pillH = 24;
    const pillX = bx + bw / 2 - pillW / 2;
    const pillY = by - 34;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 12);
    ctx.fillStyle = active ? '#7C3AED' : 'rgba(124, 58, 237, 0.88)';
    ctx.fill();

    ctx.font = 'bold 10px "Montserrat", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪣 Seret Buket Bebas', bx + bw / 2, pillY + pillH / 2);

    // Center move icon
    const iconCx = bx + bw / 2;
    const iconCy = by + bh * 0.52;
    ctx.beginPath();
    ctx.arc(iconCx, iconCy, 22, 0, Math.PI * 2);
    ctx.fillStyle = active ? 'rgba(124,58,237,0.22)' : 'rgba(124,58,237,0.12)';
    ctx.fill();
    ctx.strokeStyle = active ? '#7C3AED' : 'rgba(124,58,237,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '20px sans-serif';
    ctx.fillStyle = active ? '#7C3AED' : 'rgba(124,58,237,0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✥', iconCx, iconCy);

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

    ctx.restore(); // end bouquet rotation transform

    // 4b. Bucket drag/hover handle overlay (screen-space, sebelum handles bunga)
    if (!isFinished && (isBucketHovered || isDraggingBucket)) {
      // Re-compute dims in screen space to draw handle correctly (no canvas rotation, just offset)
      const screenBucketX = dims.bucketX;
      const screenBucketY = dims.bucketY;
      // Apply rotation to corner coords to find screen position
      const cos = Math.cos(bouquetRotRad);
      const sin = Math.sin(bouquetRotRad);
      const rotX = (x: number, y: number) =>
        pivotX + (x - pivotX) * cos - (y - pivotY) * sin;
      const rotY = (x: number, y: number) =>
        pivotY + (x - pivotX) * sin + (y - pivotY) * cos;
      // Use center point of bucket for pill positioning
      const bcx = screenBucketX + dims.bucketW / 2;
      const bcy = screenBucketY + dims.bucketH / 2;
      const sBcx = rotX(bcx, bcy);
      const sBcy = rotY(bcx, bcy);
      // Draw handle centered on rotated bucket center
      drawBucketDragHandle(
        ctx,
        sBcx - dims.bucketW / 2,
        sBcy - dims.bucketH / 2,
        dims.bucketW,
        dims.bucketH,
        isDraggingBucket,
      );
    }

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
    isDraggingBucket,
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
    if (distToRotate <= 16) return 'rotate';

    // 2. Scale handle is at (half + 6, half + 6)
    const distToScale = Math.hypot(localX - (half + 6), localY - (half + 6));
    if (distToScale <= 16) return 'scale';

    return null;
  };

  // ─── 4. MOUSE & TOUCH EVENT HANDLERS ─────────────────────────────────────
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const { x: rawX, y: rawY } = getCanvasCoords(e);
    const mouseX = rawX;
    const mouseY = rawY;
    // For flower hit-testing, use bouquet-local (inverse-rotated) coords
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
        setDragState(null);
        return;
      }
    }

    const items = renderItemsRef.current;

    // If an item is already selected, check if user clicked on its handles first
    if (selectedUid) {
      const selectedItem = items.find((it) => it.flower.uid === selectedUid);
      if (selectedItem) {
        const handleHit = checkHandleHit(flMouseX, flMouseY, selectedItem);
        if (handleHit) {
          setIsCardSelected(false);
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

    // 2. Check flower hits (bouquet-local coords)
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const dist = Math.hypot(flMouseX - item.x, flMouseY - item.y);

      // Hit within circular bloom head boundary (with 6px grace margin)
      if (dist <= item.sz / 2 + 6) {
        setSelectedUid(item.flower.uid);
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

    // 3. Check bucket body hit (bouquet-local coords) — only when not finished
    if (!isFinished) {
      const bucketOffset = design.bucketOffset ?? { x: 0, y: 0 };
      const bDims = getBouquetDimensions(canvasW, canvasH, design.bucketSize, design.bouquetScale ?? 1.0, bucketOffset);

      if (
        flMouseX >= bDims.bucketX &&
        flMouseX <= bDims.bucketX + bDims.bucketW &&
        flMouseY >= bDims.bucketY &&
        flMouseY <= bDims.bucketY + bDims.bucketH
      ) {
        // Start dragging bucket
        setIsDraggingBucket(true);
        setSelectedUid(null);
        setIsCardSelected(false);
        setDragState(null);
        bucketDragStart.current = {
          mouseX: flMouseX,
          mouseY: flMouseY,
          origOffsetX: bucketOffset.x,
          origOffsetY: bucketOffset.y,
        };
        return;
      }
    }

    // Clicked empty canvas space
    setSelectedUid(null);
    setIsCardSelected(false);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const { x: rawX, y: rawY } = getCanvasCoords(e);
    const mouseX = rawX;
    const mouseY = rawY;
    const { x: flMouseX, y: flMouseY } = toBouquetCoords(rawX, rawY);

    // Active Bucket Drag (dibatasi dalam batas aman, jangan allow bebas keluar kanvas)
    if (isDraggingBucket && bucketDragStart.current) {
      if ('touches' in e) e.preventDefault();
      const dx = flMouseX - bucketDragStart.current.mouseX;
      const dy = flMouseY - bucketDragStart.current.mouseY;

      // Batasi pergeseran buket dalam rentang aman agar tidak lepas / bablas keluar kanvas
      const maxClampX = Math.round(canvasW * 0.28);
      const maxClampY = Math.round(canvasH * 0.22);
      const targetX = Math.round(bucketDragStart.current.origOffsetX + dx);
      const targetY = Math.round(bucketDragStart.current.origOffsetY + dy);

      setBucketOffset({
        x: Math.max(-maxClampX, Math.min(maxClampX, targetX)),
        y: Math.max(-maxClampY, Math.min(maxClampY, targetY)),
      });
      setCursorStyle('grabbing');
      return;
    }

    // Active Greeting Card Scaling
    if (dragState?.mode === 'scale-card') {
      if ('touches' in e) e.preventDefault();
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
      const newCx = Math.max(40, Math.min(canvasW - 40, Math.round(mouseX - cardDragOffset.current.dx)));
      const newCy = Math.max(40, Math.min(canvasH - 40, Math.round(mouseY - cardDragOffset.current.dy)));
      setText({ cardX: newCx, cardY: newCy });
      setCursorStyle('grabbing');
      return;
    }

    // Active Flower Dragging (uses bouquet-local coords)
    if (dragState && selectedUid) {
      if ('touches' in e) e.preventDefault();

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

    // Bucket Hover Check (bouquet-local, only when not finished)
    if (!isFinished) {
      const bucketOffset = design.bucketOffset ?? { x: 0, y: 0 };
      const bDims = getBouquetDimensions(canvasW, canvasH, design.bucketSize, design.bouquetScale ?? 1.0, bucketOffset);
      const isOverBucket =
        flMouseX >= bDims.bucketX &&
        flMouseX <= bDims.bucketX + bDims.bucketW &&
        flMouseY >= bDims.bucketY &&
        flMouseY <= bDims.bucketY + bDims.bucketH;
      setIsBucketHovered(isOverBucket);
      if (isOverBucket) {
        setCursorStyle('grab');
        return;
      }
    } else {
      setIsBucketHovered(false);
    }

    setCursorStyle('default');
  };

  const handlePointerUp = () => {
    setDragState(null);
    setIsDraggingCard(false);
    setIsDraggingBucket(false);
    bucketDragStart.current = null;
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isFinished) return;
    const { x: rawX, y: rawY } = getCanvasCoords(e);
    const { x: flMouseX, y: flMouseY } = toBouquetCoords(rawX, rawY);
    const bucketOffset = design.bucketOffset ?? { x: 0, y: 0 };
    const bDims = getBouquetDimensions(canvasW, canvasH, design.bucketSize, design.bouquetScale ?? 1.0, bucketOffset);
    if (
      flMouseX >= bDims.bucketX &&
      flMouseX <= bDims.bucketX + bDims.bucketW &&
      flMouseY >= bDims.bucketY &&
      flMouseY <= bDims.bucketY + bDims.bucketH
    ) {
      // Double click buket untuk mereset posisi kembali tepat di tengah
      setBucketOffset({ x: 0, y: 0 });
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
          style={{ cursor: cursorStyle }}
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
          💡 <strong>Tips Interaktif:</strong> Drag <strong>🪣 buket</strong> untuk geser posisi (double-click buket untuk reset tengah) — klik <strong>bunga</strong> / kartu ucapan untuk <strong>geser &amp; resize</strong> — tarik pin <strong>⤡</strong> untuk <strong>perbesar / perkecil</strong>.
        </span>
      </div>
    </div>
  );
}
