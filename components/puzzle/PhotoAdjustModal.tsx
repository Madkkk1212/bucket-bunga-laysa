'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, Move, ZoomIn, ZoomOut, Check, X, Crop } from 'lucide-react';

interface PhotoAdjustModalProps {
  isOpen: boolean;
  rawImageSrc: string | null;
  onClose: () => void;
  onApply: (croppedImage: HTMLImageElement) => void;
}

export default function PhotoAdjustModal({
  isOpen,
  rawImageSrc,
  onClose,
  onApply,
}: PhotoAdjustModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number }>({
    x: 0,
    y: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  // Load raw image into memory when modal opens or src changes
  useEffect(() => {
    if (!isOpen || !rawImageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
    };
    img.src = rawImageSrc;
  }, [isOpen, rawImageSrc]);

  // Redraw canvas whenever zoom, pan, or rotation changes
  const renderCanvas = useCallback(() => {
    const cv = canvasRef.current;
    const img = imgRef.current;
    if (!cv || !img) return;

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const size = 600; // High resolution square canvas
    cv.width = size;
    cv.height = size;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    // Center origin
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const isRotated90or270 = rotation % 180 !== 0;
    const effectiveImgW = isRotated90or270 ? img.height : img.width;
    const effectiveImgH = isRotated90or270 ? img.width : img.height;

    // Base cover scale so image fills the 1:1 box
    const baseScale = Math.max(size / effectiveImgW, size / effectiveImgH);
    const finalScale = baseScale * zoom;

    // Apply pan offset (adjusted for rotation)
    let drawX = panX * (size / 320); // map from preview UI px to canvas px
    let drawY = panY * (size / 320);

    if (rotation === 90) {
      const temp = drawX;
      drawX = drawY;
      drawY = -temp;
    } else if (rotation === 180) {
      drawX = -drawX;
      drawY = -drawY;
    } else if (rotation === 270) {
      const temp = drawX;
      drawX = -drawY;
      drawY = temp;
    }

    ctx.translate(drawX, drawY);

    const drawW = img.width * finalScale;
    const drawH = img.height * finalScale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [zoom, panX, panY, rotation]);

  useEffect(() => {
    if (isOpen) {
      renderCanvas();
    }
  }, [isOpen, renderCanvas]);

  // Pointer drag for panning (Geser Kiri, Kanan, Atas, Bawah)
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panX,
      initialPanY: panY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.initialPanX + dx);
    setPanY(dragStartRef.current.initialPanY + dy);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Quick reset to center (Ketengahin)
  const handleCenter = () => {
    setPanX(0);
    setPanY(0);
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Finalize & Apply Cropped Photo
  const handleApply = () => {
    const cv = canvasRef.current;
    if (!cv) return;

    const dataUrl = cv.toDataURL('image/jpeg', 0.94);
    const finalImg = new Image();
    finalImg.onload = () => {
      onApply(finalImg);
      onClose();
    };
    finalImg.src = dataUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="pj-crop-modal-overlay">
      <div className="pj-crop-modal-card">
        {/* Modal Header */}
        <div className="pj-crop-modal-hd">
          <div className="flex items-center gap-2">
            <Crop size={18} className="text-indigo-600" />
            <h3>Atur Posisi Foto Puzzle</h3>
          </div>
          <button type="button" className="pj-crop-close-btn" onClick={onClose} title="Tutup">
            <X size={16} />
          </button>
        </div>

        <p className="pj-crop-modal-sub">
          Geser foto ke kiri/kanan, atur zoom, atau klik <b>Ketengahin</b> agar pas di kotak puzzle 1:1.
        </p>

        {/* Interactive Viewport Area */}
        <div className="pj-crop-viewport-wrapper">
          <div
            className={`pj-crop-viewport ${isDragging ? 'is-dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <canvas ref={canvasRef} className="pj-crop-canvas" />

            {/* Framing Guide Lines (Rule of Thirds) */}
            <div className="pj-crop-grid-overlay">
              <div className="pj-crop-grid-line pj-crop-grid-line--h1" />
              <div className="pj-crop-grid-line pj-crop-grid-line--h2" />
              <div className="pj-crop-grid-line pj-crop-grid-line--v1" />
              <div className="pj-crop-grid-line pj-crop-grid-line--v2" />
            </div>

            {/* Corner Markers */}
            <div className="pj-crop-corner pj-crop-corner--tl" />
            <div className="pj-crop-corner pj-crop-corner--tr" />
            <div className="pj-crop-corner pj-crop-corner--bl" />
            <div className="pj-crop-corner pj-crop-corner--br" />

            {/* Drag hint badge */}
            <div className="pj-crop-drag-hint">
              <Move size={12} />
              <span>Geser untuk atur posisi</span>
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="pj-crop-controls">
          {/* Zoom Slider */}
          <div className="pj-crop-zoom-row">
            <ZoomOut size={15} className="text-gray-400" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="pj-crop-zoom-slider"
            />
            <ZoomIn size={15} className="text-gray-400" />
            <span className="pj-crop-zoom-val">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Quick Buttons: Ketengahin & Putar 90° */}
          <div className="pj-crop-btn-row">
            <button
              type="button"
              className="pj-crop-btn pj-crop-btn--sec"
              onClick={handleCenter}
              title="Kembalikan posisi foto tepat ke tengah"
            >
              <Move size={14} />
              <span>Ketengahin (Center)</span>
            </button>
            <button
              type="button"
              className="pj-crop-btn pj-crop-btn--sec"
              onClick={handleRotate}
              title="Putar foto 90 derajat searah jarum jam"
            >
              <RotateCw size={14} />
              <span>Putar 90°</span>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pj-crop-modal-footer">
          <button type="button" className="pj-btn" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="pj-btn-pri" onClick={handleApply}>
            <Check size={15} />
            <span>Terapkan Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
