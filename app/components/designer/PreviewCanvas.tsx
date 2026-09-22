'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDesign } from '../../context/DesignContext';
import {
  drawBouquetBack,
  drawBouquetFront,
  drawFlowers,
  drawText,
  getCardBounds,
  preloadFlowers,
  computeFlowerRenderItems,
  FlowerRenderItem,
  CANVAS_RATIO_DIMENSIONS,
  BACKGROUND_THEMES,
  drawCanvasBackground,
} from '../../utils/canvasUtils';
import { CanvasRatio, BackgroundTheme } from '../../types/design';
import SmartNumberInput from '../ui/SmartNumberInput';

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
    setCanvasRatio,
    setBgTheme,
    setBouquetScale,
    setBouquetRotation,
  } = useDesign();

  const currentRatio: CanvasRatio = design.canvasRatio ?? '1:1';
  const currentTheme: BackgroundTheme = design.bgTheme ?? 'studio-warm';
  const { width: canvasW, height: canvasH } =
    CANVAS_RATIO_DIMENSIONS[currentRatio] || CANVAS_RATIO_DIMENSIONS['1:1'];

  const [dragState, setDragState] = useState<DragState | null>(null);
  const showGuide = true;
  const [cursorStyle, setCursorStyle] = useState<string>('default');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

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

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(bouquetRotRad);
    ctx.translate(-pivotX, -pivotY);

    const dims = drawBouquetBack(
      ctx,
      design.bucketSize,
      design.wrapperType,
      design.bouquetScale ?? 1.0,
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

    // 3. Draw flowers
    drawFlowers(ctx, design.selectedFlowers, dims);

    // 4. Draw bouquet front collar & striped ribbon bow (tucks lower stems)
    drawBouquetFront(ctx, dims, design.bucketSize, design.wrapperType);

    ctx.restore(); // end bouquet rotation transform

    // 5. Draw interactive selection handles if a flower is selected
    // NOTE: handles drawn in screen space — need to apply rotation offset to positions
    if (selectedUid) {
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

    // 5b. Beacon glow ring for hovered flower (from sidebar picker)
    if (hoveredFlowerUid && hoveredFlowerUid !== selectedUid) {
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
        isDraggingCard ||
        isCardHovered ||
        isCardSelected ||
        design.currentStep === 3 ||
        dragState?.mode === 'scale-card';

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
    selectedUid,
    hoveredFlowerUid,
    isDraggingCard,
    isCardHovered,
    isCardSelected,
    dragState,
    canvasW,
    canvasH,
    currentTheme,
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

    // Otherwise, search items in reverse order (topmost zIndex first)
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

    // Clicked empty canvas space
    setSelectedUid(null);
    setIsCardSelected(false);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const { x: rawX, y: rawY } = getCanvasCoords(e);
    const mouseX = rawX;
    const mouseY = rawY;
    const { x: flMouseX, y: flMouseY } = toBouquetCoords(rawX, rawY);

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
        const newSize = Math.max(45, Math.min(170, Math.round(dist * 2)));
        updateFlower(selectedUid, { size: newSize });
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
    setCursorStyle(hovered ? 'move' : 'default');
  };

  const handlePointerUp = () => {
    setDragState(null);
    setIsDraggingCard(false);
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
      {/* Studio Toolbar: Ratio Selector & Studio Themes */}
      <div className="canvas-studio-toolbar">
        {/* Ratio Selector */}
        <div className="canvas-ratio-group">
          <span className="studio-toolbar-title">Rasio Kanvas:</span>
          <div className="canvas-ratio-pills">
            {(Object.keys(CANVAS_RATIO_DIMENSIONS) as CanvasRatio[]).map((r) => {
              const info = CANVAS_RATIO_DIMENSIONS[r];
              const isActive = currentRatio === r;
              return (
                <button
                  key={r}
                  type="button"
                  className={`ratio-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setCanvasRatio(r)}
                  title={`${info.label} (${info.width}x${info.height}px)`}
                >
                  <span className="ratio-icon">{info.icon}</span>
                  <span className="ratio-label">{info.label}</span>
                  <span className="ratio-sub">{info.subLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Theme Selector */}
        <div className="canvas-theme-group">
          <span className="studio-toolbar-title">Tema Latar:</span>
          <div className="canvas-theme-swatches">
            {BACKGROUND_THEMES.map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-swatch-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setBgTheme(theme.id)}
                  title={theme.name}
                >
                  <span
                    className="theme-swatch-dot"
                    style={{ backgroundColor: theme.previewColor }}
                  />
                  <span className="theme-name">{theme.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bouquet Scale / Size Controller */}
        <div className="canvas-scale-group">
          <span className="studio-toolbar-title">Ukuran Buket:</span>
          <div className="canvas-scale-controls">
            <button
              type="button"
              className="scale-step-btn"
              onClick={() =>
                setBouquetScale(
                  Math.max(0.7, Number(((design.bouquetScale ?? 1.0) - 0.05).toFixed(2))),
                )
              }
              title="Perkecil buket"
              aria-label="Perkecil buket"
            >
              −
            </button>
            <input
              type="range"
              className="bouquet-scale-range"
              min={70}
              max={135}
              step={1}
              value={Math.round((design.bouquetScale ?? 1.0) * 100)}
              onChange={(e) => setBouquetScale(Number(e.target.value) / 100)}
              aria-label="Atur besar kecilnya buket"
            />
            <SmartNumberInput
              value={Math.round((design.bouquetScale ?? 1.0) * 100)}
              min={70}
              max={135}
              step={1}
              unit="%"
              onChange={(val) => setBouquetScale(val / 100)}
              ariaLabel="Ketik ukuran buket (%)"
              title="Ketik ukuran buket (%)"
            />
            <button
              type="button"
              className="scale-step-btn"
              onClick={() =>
                setBouquetScale(
                  Math.min(1.35, Number(((design.bouquetScale ?? 1.0) + 0.05).toFixed(2))),
                )
              }
              title="Perbesar buket"
              aria-label="Perbesar buket"
            >
              +
            </button>
            {(design.bouquetScale ?? 1.0) !== 1.0 && (
              <button
                type="button"
                className="scale-reset-chip"
                onClick={() => setBouquetScale(1.0)}
                title="Kembalikan ukuran buket ke 100%"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Bouquet Rotation Controller */}
        <div className="canvas-scale-group">
          <span className="studio-toolbar-title">Putar Buket:</span>
          <div className="canvas-scale-controls">
            <button
              type="button"
              className="scale-step-btn"
              onClick={() =>
                setBouquetRotation(
                  Math.max(-180, Math.round((design.bouquetRotation ?? 0) - 15)),
                )
              }
              title="Putar kiri 15°"
              aria-label="Putar kiri"
            >
              ↺
            </button>
            <input
              type="range"
              className="bouquet-scale-range"
              min={-180}
              max={180}
              step={1}
              value={design.bouquetRotation ?? 0}
              onChange={(e) => setBouquetRotation(Number(e.target.value))}
              aria-label="Putar buket"
            />
            <SmartNumberInput
              value={design.bouquetRotation ?? 0}
              min={-180}
              max={180}
              step={1}
              unit="°"
              onChange={(val) => setBouquetRotation(val)}
              ariaLabel="Ketik rotasi buket (°)"
              title="Ketik rotasi buket (°)"
            />
            <button
              type="button"
              className="scale-step-btn"
              onClick={() =>
                setBouquetRotation(
                  Math.min(180, Math.round((design.bouquetRotation ?? 0) + 15)),
                )
              }
              title="Putar kanan 15°"
              aria-label="Putar kanan"
            >
              ↻
            </button>
            {(design.bouquetRotation ?? 0) !== 0 && (
              <button
                type="button"
                className="scale-reset-chip"
                onClick={() => setBouquetRotation(0)}
                title="Kembalikan rotasi buket ke 0°"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

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
          💡 <strong>Tips Interaktif:</strong> Klik bunga / kartu ucapan untuk <strong>geser posisi</strong> atau tarik pin <strong>⤡</strong> di sudut untuk <strong>perbesar / perkecil</strong>.
        </span>
      </div>
    </div>
  );
}
