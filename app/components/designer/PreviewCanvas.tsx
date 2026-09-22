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
} from '../../utils/canvasUtils';

const CANVAS_SIZE = 600;

interface PreviewCanvasProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

type DragMode = 'move' | 'rotate' | 'scale';

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
  } = useDesign();

  const [dragState, setDragState] = useState<DragState | null>(null);
  const showGuide = true;
  const [cursorStyle, setCursorStyle] = useState<string>('default');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Greeting card drag state
  const [isDraggingCard, setIsDraggingCard] = useState<boolean>(false);
  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);
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
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Elegant gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
    bgGrad.addColorStop(0, '#FEFAF7');
    bgGrad.addColorStop(1, '#F5EDE4');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Draw bouquet back wrapper
    const dims = drawBouquetBack(ctx, design.bucketSize, design.wrapperType);

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

    // 5. Draw interactive selection handles if a flower is selected
    if (selectedUid) {
      const selectedItem = items.find((it) => it.flower.uid === selectedUid);
      if (selectedItem) {
        drawSelectionHandles(ctx, selectedItem);
      }
    }

    // 5b. Beacon glow ring for hovered flower (from sidebar picker)
    if (hoveredFlowerUid && hoveredFlowerUid !== selectedUid) {
      const hovItem = items.find((it) => it.flower.uid === hoveredFlowerUid);
      if (hovItem) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(hovItem.x, hovItem.y, hovItem.sz / 2 + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.shadowColor = 'rgba(225, 29, 72, 0.6)';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Pin icon above the hovered flower
        ctx.beginPath();
        ctx.arc(hovItem.x, hovItem.y - hovItem.sz / 2 - 14, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#E11D48';
        ctx.fill();
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📍', hovItem.x, hovItem.y - hovItem.sz / 2 - 14);
        ctx.restore();
      }
    }

    // 6. Draw greeting text overlay
    drawText(ctx, design.text);

    // 7. Interactive card drag outline & guide badge
    if (design.text.content && design.text.content.trim()) {
      const b = getCardBounds(design.text, CANVAS_SIZE, CANVAS_SIZE);
      const isCardActive = isDraggingCard || isCardHovered || design.currentStep === 3;
      if (isCardActive) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 12);
        ctx.strokeStyle = isDraggingCard ? '#D97706' : 'rgba(217, 119, 6, 0.7)';
        ctx.lineWidth = isDraggingCard ? 2.5 : 1.5;
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
        ctx.restore();
      }
    }
  }, [design, canvasRef, showGuide, selectedUid, hoveredFlowerUid, isDraggingCard, isCardHovered]);

  useEffect(() => {
    render();
  }, [render]);


  // ─── 3. HIT TESTING UTILITIES ────────────────────────────────────────────
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
    const { x: mouseX, y: mouseY } = getCanvasCoords(e);

    // 1. Check if user clicked on the greeting card
    if (design.text.content && design.text.content.trim()) {
      const cardB = getCardBounds(design.text, CANVAS_SIZE, CANVAS_SIZE);
      if (
        mouseX >= cardB.x &&
        mouseX <= cardB.x + cardB.w &&
        mouseY >= cardB.y - 12 &&
        mouseY <= cardB.y + cardB.h
      ) {
        setIsDraggingCard(true);
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
        const handleHit = checkHandleHit(mouseX, mouseY, selectedItem);
        if (handleHit) {
          setDragState({
            mode: handleHit,
            startMouseX: mouseX,
            startMouseY: mouseY,
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
      const dist = Math.hypot(mouseX - item.x, mouseY - item.y);

      // Hit within circular bloom head boundary (with 6px grace margin)
      if (dist <= item.sz / 2 + 6) {
        setSelectedUid(item.flower.uid);

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
          startMouseX: mouseX,
          startMouseY: mouseY,
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
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const { x: mouseX, y: mouseY } = getCanvasCoords(e);

    // Active Greeting Card Dragging
    if (isDraggingCard) {
      if ('touches' in e) e.preventDefault();
      const newCx = Math.max(70, Math.min(530, Math.round(mouseX - cardDragOffset.current.dx)));
      const newCy = Math.max(50, Math.min(550, Math.round(mouseY - cardDragOffset.current.dy)));
      setText({ cardX: newCx, cardY: newCy });
      setCursorStyle('grabbing');
      return;
    }

    // Active Flower Dragging
    if (dragState && selectedUid) {
      if ('touches' in e) e.preventDefault();

      if (dragState.mode === 'move') {
        const dx = mouseX - dragState.startMouseX;
        const dy = mouseY - dragState.startMouseY;
        const newX = Math.round(dragState.origX + dx);
        const newY = Math.round(dragState.origY + dy);

        updateFlower(selectedUid, {
          x: newX,
          y: newY,
          size: dragState.origSize,
          customRotation: dragState.origRot,
        });
      } else if (dragState.mode === 'rotate') {
        const angle = Math.atan2(mouseY - dragState.origY, mouseX - dragState.origX);
        const newRot = angle + Math.PI / 2;
        updateFlower(selectedUid, { customRotation: newRot });
      } else if (dragState.mode === 'scale') {
        const dist = Math.hypot(mouseX - dragState.origX, mouseY - dragState.origY);
        const newSize = Math.max(45, Math.min(170, Math.round(dist * 2)));
        updateFlower(selectedUid, { size: newSize });
      }
      return;
    }

    // Card Hover Check
    if (design.text.content && design.text.content.trim()) {
      const cardB = getCardBounds(design.text, CANVAS_SIZE, CANVAS_SIZE);
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

    // Hover Cursor Detection for Selected Flower Handles
    const items = renderItemsRef.current;
    if (selectedUid) {
      const selectedItem = items.find((it) => it.flower.uid === selectedUid);
      if (selectedItem) {
        const handleHit = checkHandleHit(mouseX, mouseY, selectedItem);
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

    // Flower Hover
    let hovered = false;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (Math.hypot(mouseX - item.x, mouseY - item.y) <= item.sz / 2 + 6) {
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
      {/* Visual Canvas Canvas Area */}
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
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
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
            <p>Pilih bunga di menu kiri untuk mulai merangkai!</p>
          </div>
        )}
      </div>

      {/* User Helper Caption */}
      <div className="canvas-interaction-guide">
        <span>💡 <strong>Tips Interaktif:</strong> Klik bunga di atas buket untuk <strong>geser posisi</strong>, putar pin <strong>↻</strong> (atas), atau tarik pin <strong>⤡</strong> (sudut) untuk atur ukuran.</span>
      </div>
    </div>
  );
}
