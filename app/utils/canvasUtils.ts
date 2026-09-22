import { PlacedFlower, TextConfig, FlowerCategory, CanvasRatio, BackgroundTheme } from '../types/design';
import { getBucketSize } from '../data/buckets';
import { getWrapper as getWrapperData } from '../data/wrappers';
import { getFlowerById } from '../data/flowers';

// ─── Canvas Ratios & Studio Background Themes ────────────────────────────────

export const CANVAS_RATIO_DIMENSIONS: Record<
  CanvasRatio,
  { width: number; height: number; label: string; subLabel: string; icon: string }
> = {
  '9:16': { width: 540, height: 960, label: 'Snapgram', subLabel: '9 : 16', icon: '📱' },
  '4:5': { width: 576, height: 720, label: 'Feed IG', subLabel: '4 : 5', icon: '📷' },
  '1:1': { width: 600, height: 600, label: 'Persegi', subLabel: '1 : 1', icon: '⏹️' },
  '3:4': { width: 540, height: 720, label: 'Portrait', subLabel: '3 : 4', icon: '🖼️' },
};

export interface BackgroundThemeDef {
  id: BackgroundTheme;
  name: string;
  badge: string;
  previewColor: string;
}

export const BACKGROUND_THEMES: BackgroundThemeDef[] = [
  { id: 'studio-warm', name: 'Studio Warm Ivory', badge: 'Warm', previewColor: '#F2ECE2' },
  { id: 'rose-milk', name: 'Rose Velvet Blush', badge: 'Pastel', previewColor: '#FCE4E9' },
  { id: 'midnight-noir', name: 'Midnight Luxury Noir', badge: 'Dark', previewColor: '#1A1716' },
  { id: 'sage-botanical', name: 'Sage Botanical Garden', badge: 'Sage', previewColor: '#DFEAE2' },
  { id: 'kraft-warm', name: 'Artisanal Kraft Paper', badge: 'Kraft', previewColor: '#E8DCBE' },
];

export function drawCanvasBackground(
  ctx: CanvasRenderingContext2D,
  theme: BackgroundTheme = 'studio-warm',
  width: number,
  height: number,
): void {
  ctx.save();
  const cx = width / 2;
  const cy = height / 2;

  if (theme === 'midnight-noir') {
    // Deep charcoal velvet with subtle warm golden spotlight
    const grad = ctx.createRadialGradient(cx, cy * 0.9, 40, cx, cy, Math.max(width, height) * 0.75);
    grad.addColorStop(0, '#262220');
    grad.addColorStop(0.4, '#181514');
    grad.addColorStop(1, '#0C0A09');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Warm golden spotlight aura behind bouquet
    const glow = ctx.createRadialGradient(cx, cy * 0.85, 20, cx, cy * 0.85, Math.min(width, height) * 0.6);
    glow.addColorStop(0, 'rgba(217, 119, 6, 0.16)');
    glow.addColorStop(0.5, 'rgba(180, 83, 9, 0.06)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'rose-milk') {
    // Gentle romantic blush pink gradient with studio lighting
    const grad = ctx.createLinearGradient(0, 0, width * 0.25, height);
    grad.addColorStop(0, '#FFF6F7');
    grad.addColorStop(0.5, '#FDEBED');
    grad.addColorStop(1, '#F8DCE1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Soft warm floral vignette
    const vig = ctx.createRadialGradient(cx, cy, width * 0.35, cx, cy, Math.max(width, height) * 0.7);
    vig.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    vig.addColorStop(1, 'rgba(225, 29, 72, 0.05)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'sage-botanical') {
    // Fresh organic eucalyptus sage
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#F6F9F7');
    grad.addColorStop(0.5, '#ECF3EE');
    grad.addColorStop(1, '#DEEAE2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Warm soft center light
    const light = ctx.createRadialGradient(cx, cy * 0.85, 30, cx, cy * 0.85, width * 0.65);
    light.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    light.addColorStop(1, 'rgba(20, 83, 45, 0.04)');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'kraft-warm') {
    // Artisanal warm kraft & coffee linen
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#FBF7F0');
    grad.addColorStop(0.5, '#F2E8DC');
    grad.addColorStop(1, '#E6D7C5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle paper border glow
    const vig = ctx.createRadialGradient(cx, cy, width * 0.3, cx, cy, Math.max(width, height) * 0.7);
    vig.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    vig.addColorStop(1, 'rgba(120, 53, 15, 0.06)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
  } else {
    // 'studio-warm' (default): Elegant soft ivory to cashmere gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#FEFAF7');
    grad.addColorStop(0.6, '#F7F0E8');
    grad.addColorStop(1, '#EDE2D4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Studio spotlight overhead
    const light = ctx.createRadialGradient(cx, cy * 0.6, 50, cx, cy * 0.7, Math.max(width, height) * 0.65);
    light.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    light.addColorStop(1, 'rgba(0, 0, 0, 0.03)');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

// ─── Image Cache ─────────────────────────────────────────────────────────────

const imageCache: Record<string, HTMLImageElement> = {};

export function preloadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache[src] && imageCache[src].complete && imageCache[src].naturalWidth) {
    return Promise.resolve(imageCache[src]);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(img);
    };
    img.src = src;
  });
}

export function preloadFlowers(
  flowers: PlacedFlower[],
  bucketId = 'bucket-1',
): Promise<(HTMLImageElement | void)[]> {
  const flowerUrls = flowers.map((f) => f.imageUrl);
  const bucket = getBucketSize(bucketId);
  const bucketUrls = [
    bucket.backImage || '/images/bucket/bucket-1_back.png',
    bucket.frontImage || '/images/bucket/bucket-1_front.png',
    bucket.image || '/images/bucket/bucket-1.png',
    '/images/bucket/bucket-1_back.png',
    '/images/bucket/bucket-1_front.png',
    '/images/bucket/bucket-2_back.png',
    '/images/bucket/bucket-2_front.png',
    '/images/bucket/bucket-3_back.png',
    '/images/bucket/bucket-3_front.png',
  ];
  const allUrls = [...new Set([...flowerUrls, ...bucketUrls])];
  return Promise.all(allUrls.map(preloadImage));
}

// ─── Bouquet Dimensions & Geometry ──────────────────────────────────────────

export interface BouquetDimensions {
  centerX: number;
  wrapperTopY: number; // top of wrapper opening
  ribbonY: number;     // waist tie point where ribbon is tied
  bottomY: number;     // very bottom of bouquet handle
  wrapperTopWidth: number;
  wrapperBottomWidth: number;
  bucketX: number;
  bucketY: number;
  bucketW: number;
  bucketH: number;
  scale: number;
}

export function getBouquetDimensions(
  canvasW: number,
  canvasH: number,
  bucketId = 'bucket-1',
  bouquetScale = 1.0,
): BouquetDimensions {
  void bucketId;
  const centerX = canvasW / 2;
  const ratioVal = canvasH / canvasW;
  const bMultiplier = Math.max(0.65, Math.min(1.45, bouquetScale));

  // Adapt target dimensions to ratio so bouquet is well proportioned and unclipped
  let baseTargetW: number;
  if (ratioVal >= 1.6) {
    // 9:16 Snapgram (tall vertical)
    baseTargetW = Math.round(Math.min(canvasW * 0.88, 475));
  } else if (ratioVal > 1.1) {
    // 4:5 or 3:4 portrait
    baseTargetW = Math.round(Math.min(canvasW * 0.84, 480));
  } else {
    // 1:1 square: well proportioned so top flowers and bottom wrapper/ribbon are never cut off
    baseTargetW = Math.round(Math.min(canvasW * 0.76, 455));
  }

  const targetW = Math.round(baseTargetW * bMultiplier);
  const scale = targetW / 1866;
  const targetH = Math.round(1954 * scale);

  const bucketX = Math.round((canvasW - targetW) / 2);

  // Position bouquet in the vertical center of the canvas according to the ratio
  // The bouquet visual center (including flowers blooming above collar) is at bucketY + targetH * 0.45
  let bucketY: number;
  if (ratioVal >= 1.4) {
    // For tall vertical ratios (Snapgram 9:16, etc.), center bouquet nicely in the middle zone
    const visualCenterOffset = Math.round(targetH * 0.44);
    bucketY = Math.round(canvasH / 2 - visualCenterOffset);
  } else if (ratioVal > 1.1) {
    // 4:5 or 3:4 portrait
    const visualCenterOffset = Math.round(targetH * 0.46);
    bucketY = Math.round(canvasH / 2 - visualCenterOffset);
  } else {
    // 1:1 square: centered with balanced margins top and bottom
    const visualCenterOffset = Math.round(targetH * 0.45);
    bucketY = Math.round(canvasH / 2 - visualCenterOffset);
  }

  const bottomY = bucketY + targetH;

  // Key landmarks from bucket-1 photo:
  // Collar starts at Y = 1050 (in 1954px height)
  // Ribbon center knot is at Y = 1420
  const ribbonY = Math.round(bucketY + 1050 * scale);
  const wrapperTopY = Math.round(bucketY + 80 * scale);

  const wrapperTopWidth = targetW;
  const wrapperBottomWidth = Math.round(targetW * 0.28);

  return {
    centerX,
    wrapperTopY,
    ribbonY,
    bottomY,
    wrapperTopWidth,
    wrapperBottomWidth,
    bucketX,
    bucketY,
    bucketW: targetW,
    bucketH: targetH,
    scale,
  };
}

// ─── 1. BACK WRAPPER (Wings + Kraft Backing from images/bucket) ──────────────

export function drawBouquetBack(
  ctx: CanvasRenderingContext2D,
  bucketId: string,
  wrapperTypeId: string,
  bouquetScale = 1.0,
): BouquetDimensions {
  void wrapperTypeId;
  const dims = getBouquetDimensions(ctx.canvas.width, ctx.canvas.height, bucketId, bouquetScale);
  const bucket = getBucketSize(bucketId);
  const backSrc = bucket.backImage || `/images/bucket/${bucketId}_back.png`;
  const backImg = imageCache[backSrc] || imageCache['/images/bucket/bucket-1_back.png'];

  ctx.save();

  // If real bucket image from images/bucket is loaded, render it directly!
  if (backImg && backImg.complete && backImg.naturalWidth) {
    if (bucket.canvasFilter) {
      ctx.filter = bucket.canvasFilter;
    }
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.drawImage(backImg, dims.bucketX, dims.bucketY, dims.bucketW, dims.bucketH);
    ctx.restore();
    return dims;
  }

  // Fallback procedural Korean origami wings if image not yet cached
  const { centerX, wrapperTopY, ribbonY, wrapperTopWidth, wrapperBottomWidth } = dims;
  const halfTop = wrapperTopWidth / 2;
  const halfBot = wrapperBottomWidth / 2;

  // Kraft Backing Sheet
  const kraftGrad = ctx.createLinearGradient(centerX, wrapperTopY - 60, centerX, ribbonY);
  kraftGrad.addColorStop(0, '#4A3A31');
  kraftGrad.addColorStop(0.5, '#342822');
  kraftGrad.addColorStop(1, '#231B17');

  ctx.beginPath();
  ctx.moveTo(centerX - halfTop * 0.58, wrapperTopY - 65);
  ctx.lineTo(centerX + halfTop * 0.65, wrapperTopY - 95);
  ctx.lineTo(centerX + halfTop * 0.82, wrapperTopY + 35);
  ctx.lineTo(centerX + halfBot * 1.2, ribbonY);
  ctx.lineTo(centerX - halfBot * 1.2, ribbonY);
  ctx.lineTo(centerX - halfTop * 0.78, wrapperTopY + 25);
  ctx.closePath();
  ctx.fillStyle = kraftGrad;
  ctx.fill();

  ctx.restore();
  return dims;
}

// ─── 2. DENSE LUSH FLORAL ARRANGEMENT (Role-Based Anti-Clumping Engine) ─────

export interface FlowerRenderItem {
  flower: PlacedFlower;
  x: number;
  y: number;
  sz: number;
  rot: number;
  zIndex: number;
}

export function computeFlowerRenderItems(
  flowers: PlacedFlower[],
  dims: BouquetDimensions,
): FlowerRenderItem[] {
  const total = flowers.length;
  if (total === 0) return [];

  const { centerX, bucketH, bucketY, scale } = dims;
  const collarY = Math.round(bucketY + bucketH * 0.5373);
  const frontW = Math.round(1359 * scale);
  const sf = scale / (540 / 1954); // standard scaleFactor = 1.0

  const getCategory = (f: PlacedFlower): FlowerCategory => {
    if (f.category) return f.category;
    return getFlowerById(f.flowerId)?.category || 'main';
  };

  const manualItems: FlowerRenderItem[] = [];
  const autoFlowers: PlacedFlower[] = [];

  flowers.forEach((f) => {
    if (f.isManual && f.x !== undefined && f.y !== undefined) {
      manualItems.push({
        flower: f,
        x: Math.round(f.x),
        y: Math.round(f.y),
        sz: Math.round(f.size ?? 92),
        rot: f.customRotation ?? f.rotation ?? 0,
        zIndex: f.zIndex ?? 10,
      });
    } else {
      autoFlowers.push(f);
    }
  });

  const mains = autoFlowers.filter((f) => getCategory(f) === 'main');
  const fillers = autoFlowers.filter((f) => getCategory(f) === 'filler');
  const greens = autoFlowers.filter((f) => getCategory(f) === 'greenery');

  const renderItems: FlowerRenderItem[] = [...manualItems];

  // Greenery Placement
  const greenAnchors = [
    { x: centerX - Math.round(105 * sf), y: collarY - Math.round(115 * sf), rot: -0.35, sz: Math.round(125 * sf), zIndex: 1 },
    { x: centerX + Math.round(105 * sf), y: collarY - Math.round(115 * sf), rot: 0.35, sz: Math.round(125 * sf), zIndex: 1 },
    { x: centerX - Math.round(115 * sf), y: collarY - Math.round(55 * sf), rot: -0.48, sz: Math.round(120 * sf), zIndex: 2 },
    { x: centerX + Math.round(115 * sf), y: collarY - Math.round(55 * sf), rot: 0.48, sz: Math.round(120 * sf), zIndex: 2 },
  ];
  greens.forEach((g, idx) => {
    const anc = greenAnchors[idx % greenAnchors.length];
    renderItems.push({
      flower: g,
      x: anc.x,
      y: anc.y,
      sz: anc.sz,
      rot: anc.rot,
      zIndex: g.zIndex ?? anc.zIndex,
    });
  });

  // Fillers Placement
  const fillerAnchors = [
    { x: centerX, y: collarY - Math.round(120 * sf), rot: 0, sz: Math.round(135 * sf), zIndex: 2 },
    { x: centerX - Math.round(55 * sf), y: collarY - Math.round(110 * sf), rot: -0.15, sz: Math.round(130 * sf), zIndex: 2 },
    { x: centerX + Math.round(55 * sf), y: collarY - Math.round(110 * sf), rot: 0.15, sz: Math.round(130 * sf), zIndex: 2 },
    { x: centerX - Math.round(35 * sf), y: collarY - Math.round(80 * sf), rot: -0.08, sz: Math.round(125 * sf), zIndex: 3 },
    { x: centerX + Math.round(35 * sf), y: collarY - Math.round(80 * sf), rot: 0.08, sz: Math.round(125 * sf), zIndex: 3 },
    { x: centerX - Math.round(95 * sf), y: collarY - Math.round(70 * sf), rot: -0.28, sz: Math.round(120 * sf), zIndex: 3 },
    { x: centerX + Math.round(95 * sf), y: collarY - Math.round(70 * sf), rot: 0.28, sz: Math.round(120 * sf), zIndex: 3 },
    { x: centerX - Math.round(80 * sf), y: collarY - Math.round(25 * sf), rot: -0.18, sz: Math.round(115 * sf), zIndex: 4 },
    { x: centerX + Math.round(80 * sf), y: collarY - Math.round(25 * sf), rot: 0.18, sz: Math.round(115 * sf), zIndex: 4 },
  ];
  fillers.forEach((fl, idx) => {
    const anc = fillerAnchors[idx % fillerAnchors.length];
    renderItems.push({
      flower: fl,
      x: anc.x,
      y: anc.y,
      sz: anc.sz,
      rot: anc.rot,
      zIndex: fl.zIndex ?? anc.zIndex,
    });
  });

  // Main Blooms Placement
  const primaryFlowers = mains.length > 0 ? mains : (fillers.length === 0 ? greens : []);
  const nMain = primaryFlowers.length;

  if (nMain > 0) {
    const mainSlots: { x: number; y: number; sz: number; rot: number; zIndex: number }[] = [];

    if (nMain === 1) {
      mainSlots.push({ x: centerX, y: collarY - Math.round(8 * sf), sz: Math.round(105 * sf), rot: 0, zIndex: 10 });
    } else if (nMain === 2) {
      mainSlots.push({ x: centerX - Math.round(36 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(100 * sf), rot: -0.07, zIndex: 10 });
      mainSlots.push({ x: centerX + Math.round(36 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(100 * sf), rot: 0.07, zIndex: 10 });
    } else if (nMain === 3) {
      mainSlots.push({ x: centerX, y: collarY - Math.round(65 * sf), sz: Math.round(96 * sf), rot: 0, zIndex: 6 });
      mainSlots.push({ x: centerX - Math.round(44 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(100 * sf), rot: -0.08, zIndex: 10 });
      mainSlots.push({ x: centerX + Math.round(44 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(100 * sf), rot: 0.08, zIndex: 10 });
    } else if (nMain === 4) {
      mainSlots.push({ x: centerX - Math.round(32 * sf), y: collarY - Math.round(65 * sf), sz: Math.round(94 * sf), rot: -0.08, zIndex: 6 });
      mainSlots.push({ x: centerX + Math.round(32 * sf), y: collarY - Math.round(65 * sf), sz: Math.round(94 * sf), rot: 0.08, zIndex: 6 });
      mainSlots.push({ x: centerX - Math.round(46 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(98 * sf), rot: -0.09, zIndex: 10 });
      mainSlots.push({ x: centerX + Math.round(46 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(98 * sf), rot: 0.09, zIndex: 10 });
    } else if (nMain === 5) {
      mainSlots.push({ x: centerX - Math.round(52 * sf), y: collarY - Math.round(75 * sf), sz: Math.round(92 * sf), rot: -0.10, zIndex: 6 });
      mainSlots.push({ x: centerX, y: collarY - Math.round(80 * sf), sz: Math.round(96 * sf), rot: 0, zIndex: 6 });
      mainSlots.push({ x: centerX + Math.round(52 * sf), y: collarY - Math.round(75 * sf), sz: Math.round(92 * sf), rot: 0.10, zIndex: 6 });
      mainSlots.push({ x: centerX - Math.round(36 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(98 * sf), rot: -0.07, zIndex: 10 });
      mainSlots.push({ x: centerX + Math.round(36 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(98 * sf), rot: 0.07, zIndex: 10 });
    } else if (nMain === 6) {
      mainSlots.push({ x: centerX, y: collarY - Math.round(125 * sf), sz: Math.round(88 * sf), rot: 0, zIndex: 5 });
      mainSlots.push({ x: centerX - Math.round(42 * sf), y: collarY - Math.round(70 * sf), sz: Math.round(88 * sf), rot: -0.09, zIndex: 7 });
      mainSlots.push({ x: centerX + Math.round(42 * sf), y: collarY - Math.round(70 * sf), sz: Math.round(88 * sf), rot: 0.09, zIndex: 7 });
      mainSlots.push({ x: centerX - Math.round(54 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(92 * sf), rot: -0.10, zIndex: 10 });
      mainSlots.push({ x: centerX, y: collarY - Math.round(8 * sf), sz: Math.round(94 * sf), rot: 0, zIndex: 10 });
      mainSlots.push({ x: centerX + Math.round(54 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(92 * sf), rot: 0.10, zIndex: 10 });
    } else if (nMain === 7) {
      mainSlots.push({ x: centerX, y: collarY - Math.round(135 * sf), sz: Math.round(86 * sf), rot: 0, zIndex: 5 });
      mainSlots.push({ x: centerX - Math.round(48 * sf), y: collarY - Math.round(75 * sf), sz: Math.round(86 * sf), rot: -0.10, zIndex: 7 });
      mainSlots.push({ x: centerX, y: collarY - Math.round(78 * sf), sz: Math.round(88 * sf), rot: 0, zIndex: 7 });
      mainSlots.push({ x: centerX + Math.round(48 * sf), y: collarY - Math.round(75 * sf), sz: Math.round(86 * sf), rot: 0.10, zIndex: 7 });
      mainSlots.push({ x: centerX - Math.round(55 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(90 * sf), rot: -0.10, zIndex: 10 });
      mainSlots.push({ x: centerX, y: collarY - Math.round(8 * sf), sz: Math.round(92 * sf), rot: 0, zIndex: 10 });
      mainSlots.push({ x: centerX + Math.round(55 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(90 * sf), rot: 0.10, zIndex: 10 });
    } else if (nMain === 8) {
      mainSlots.push({ x: centerX - Math.round(32 * sf), y: collarY - Math.round(135 * sf), sz: Math.round(84 * sf), rot: -0.09, zIndex: 5 });
      mainSlots.push({ x: centerX + Math.round(32 * sf), y: collarY - Math.round(135 * sf), sz: Math.round(84 * sf), rot: 0.09, zIndex: 5 });
      mainSlots.push({ x: centerX - Math.round(52 * sf), y: collarY - Math.round(75 * sf), sz: Math.round(85 * sf), rot: -0.10, zIndex: 7 });
      mainSlots.push({ x: centerX, y: collarY - Math.round(75 * sf), sz: Math.round(88 * sf), rot: 0, zIndex: 7 });
      mainSlots.push({ x: centerX + Math.round(52 * sf), y: collarY - Math.round(75 * sf), sz: Math.round(85 * sf), rot: 0.10, zIndex: 7 });
      mainSlots.push({ x: centerX - Math.round(54 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(88 * sf), rot: -0.10, zIndex: 10 });
      mainSlots.push({ x: centerX, y: collarY - Math.round(8 * sf), sz: Math.round(90 * sf), rot: 0, zIndex: 10 });
      mainSlots.push({ x: centerX + Math.round(54 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(88 * sf), rot: 0.10, zIndex: 10 });
    } else if (nMain === 9) {
      mainSlots.push({ x: centerX, y: collarY - Math.round(150 * sf), sz: Math.round(82 * sf), rot: 0, zIndex: 5 });
      mainSlots.push({ x: centerX - Math.round(36 * sf), y: collarY - Math.round(110 * sf), sz: Math.round(82 * sf), rot: -0.09, zIndex: 7 });
      mainSlots.push({ x: centerX + Math.round(36 * sf), y: collarY - Math.round(110 * sf), sz: Math.round(82 * sf), rot: 0.09, zIndex: 7 });
      mainSlots.push({ x: centerX - Math.round(54 * sf), y: collarY - Math.round(65 * sf), sz: Math.round(84 * sf), rot: -0.10, zIndex: 8 });
      mainSlots.push({ x: centerX, y: collarY - Math.round(65 * sf), sz: Math.round(86 * sf), rot: 0, zIndex: 8 });
      mainSlots.push({ x: centerX + Math.round(54 * sf), y: collarY - Math.round(65 * sf), sz: Math.round(84 * sf), rot: 0.10, zIndex: 8 });
      mainSlots.push({ x: centerX - Math.round(54 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(86 * sf), rot: -0.10, zIndex: 10 });
      mainSlots.push({ x: centerX, y: collarY - Math.round(8 * sf), sz: Math.round(88 * sf), rot: 0, zIndex: 10 });
      mainSlots.push({ x: centerX + Math.round(54 * sf), y: collarY - Math.round(8 * sf), sz: Math.round(86 * sf), rot: 0.10, zIndex: 10 });
    } else {
      const rows = nMain <= 13 ? 4 : (nMain <= 18 ? 5 : 6);
      const baseCounts = Array.from({ length: rows }, () => Math.max(1, Math.round(nMain / rows)));
      let rem = nMain - baseCounts.reduce((a, b) => a + b, 0);
      let rTarget = 1;
      while (rem > 0) {
        baseCounts[rTarget] += 1;
        rem -= 1;
        rTarget = (rTarget + 1) % (rows - 1);
      }
      while (rem < 0) {
        baseCounts[0] = Math.max(1, baseCounts[0] - 1);
        rem += 1;
      }

      const topY = collarY - Math.min(Math.round(155 * sf), Math.round((105 + nMain * 2.2) * sf));
      const botY = collarY - Math.round(8 * sf);
      const spanY = botY - topY;
      const rowHwMax = Math.round(frontW * 0.22);

      for (let rIdx = 0; rIdx < rows; rIdx++) {
        const cnt = baseCounts[rIdx];
        const rT = rows > 1 ? rIdx / (rows - 1) : 0.5;
        const yBase = topY + rT * spanY;
        const rowHw = rowHwMax * (0.60 + 0.40 * rT);

        for (let c = 0; c < cnt; c++) {
          const cT = cnt > 1 ? c / (cnt - 1) : 0.5;
          const xPos = centerX + (cT - 0.5) * 2.0 * rowHw;
          const domeLift = Math.sin(cT * Math.PI) * Math.round(8 * sf);
          const yPos = yBase - domeLift;
          const rot = (cT - 0.5) * 0.15;
          const sz = Math.round(Math.max(58, Math.min(84, 98 - nMain * 1.5)) * sf);
          mainSlots.push({
            x: Math.round(xPos),
            y: Math.round(yPos),
            sz,
            rot,
            zIndex: 5 + rIdx * 2,
          });
        }
      }
    }

    primaryFlowers.forEach((f, idx) => {
      const slot = mainSlots[idx % mainSlots.length];
      renderItems.push({
        flower: f,
        x: slot.x,
        y: slot.y,
        sz: slot.sz,
        rot: slot.rot,
        zIndex: f.zIndex ?? slot.zIndex,
      });
    });
  }

  // Sort by zIndex ascending
  renderItems.sort((a, b) => a.zIndex - b.zIndex);
  return renderItems;
}

export function drawFlowers(
  ctx: CanvasRenderingContext2D,
  flowers: PlacedFlower[],
  dims: BouquetDimensions,
): void {
  const total = flowers.length;
  if (total === 0) return;

  ctx.save();

  const renderItems = computeFlowerRenderItems(flowers, dims);

  // Draw flowers centered at (x, y) with realistic drop shadows
  renderItems.forEach((item, index) => {
    const img = imageCache[item.flower.imageUrl];

    if (!img || !img.complete || !img.naturalWidth) {
      drawFlowerEmoji(ctx, item.flower, item.x, item.y, index);
      return;
    }

    const sWidth = img.naturalWidth;
    const sHeight = img.naturalHeight;
    const aspect = sHeight / sWidth;
    const dWidth = item.sz;
    const dHeight = Math.round(item.sz * aspect);

    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot);

    // Soft drop shadow for realistic petal depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(
      img,
      0,
      0,
      sWidth,
      sHeight,
      -dWidth / 2,
      -dHeight / 2,
      dWidth,
      dHeight,
    );

    ctx.restore();
  });

  ctx.restore();
}

function drawFlowerEmoji(
  ctx: CanvasRenderingContext2D,
  flower: PlacedFlower,
  posX: number,
  posY: number,
  index: number,
) {
  const EMOJIS: Record<string, string> = {
    rose_red: '🌹', rose_pink: '🌸', rose_white: '🤍', rose_peach: '🌸',
    rose_yellow: '🌼', rose_orange: '🧡', rose_cream: '🌸',
    tulip_red: '🌷', tulip_yellow: '🌷', tulip_pink: '🌷', tulip_purple: '🌷',
    lily_white: '🌸', lily_pink: '🌸', lily_orange: '🌺',
    hydrangea_blue: '💠', hydrangea_pink: '🌸', hydrangea_purple: '💜',
    sunflower: '🌻',
    chrysanthemum_pink: '🌸', chrysanthemum_white: '🌼', chrysanthemum_yellow: '🌼',
    aster_purple: '💜', iris_purple: '💜', lavender: '💜', orchid_pink: '🌸',
    gerbera_red: '🌺', ranunculus_pink: '🌸', protea_pink: '🌸',
    babysbreath_white: '🤍', calla_white: '🌷', foxglove_purple: '💜',
    dahlia_orange: '🌺',
  };
  const emoji = EMOJIS[flower.flowerId] ?? '🌸';
  const size = 56 + (index % 3) * 6;

  ctx.save();
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, posX, posY);
  ctx.restore();
}

// ─── 3. FRONT WRAPPER & STRIPED RIBBON (Tucks Stems Seamlessly) ─────────────

export function drawBouquetFront(
  ctx: CanvasRenderingContext2D,
  dims: BouquetDimensions,
  bucketId: string,
  wrapperTypeId: string,
): void {
  const bucket = getBucketSize(bucketId);
  const frontSrc = bucket.frontImage || `/images/bucket/${bucketId}_front.png`;
  const frontImg = imageCache[frontSrc] || imageCache['/images/bucket/bucket-1_front.png'];

  ctx.save();

  // If real front piece is loaded from images/bucket:
  if (frontImg && frontImg.complete && frontImg.naturalWidth) {
    if (bucket.canvasFilter) {
      ctx.filter = bucket.canvasFilter;
    }
    // Relative positioning calibrated to 1866 x 1954 original dimensions:
    // front starts at x = 401, y = 1050, width = 1359, height = 904
    const frontW = Math.round(1359 * dims.scale);
    const frontH = Math.round(904 * dims.scale);
    const frontX = dims.bucketX + Math.round(401 * dims.scale);
    const frontY = dims.bucketY + Math.round(1050 * dims.scale);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.drawImage(frontImg, frontX, frontY, frontW, frontH);
    ctx.restore();
    return;
  }

  // Fallback procedural collar & black-and-white striped ribbon bow
  const wrapper = getWrapperData(wrapperTypeId);
  const { centerX, ribbonY, wrapperTopWidth, wrapperBottomWidth } = dims;
  const baseColor = wrapper.color;
  const halfBot = wrapperBottomWidth / 2;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // Pleated Front Collar
  const collarW = wrapperTopWidth * 0.74;
  const collarH = 80;
  const collarTopY = ribbonY - collarH * 0.65;

  const collarGrad = ctx.createLinearGradient(centerX, collarTopY, centerX, ribbonY + 35);
  collarGrad.addColorStop(0, adjustColor(baseColor, 20));
  collarGrad.addColorStop(0.5, baseColor);
  collarGrad.addColorStop(1, adjustColor(baseColor, -30));

  ctx.beginPath();
  ctx.moveTo(centerX - collarW / 2, collarTopY + 15);
  ctx.bezierCurveTo(
    centerX - collarW * 0.25, collarTopY,
    centerX + collarW * 0.25, collarTopY,
    centerX + collarW / 2, collarTopY + 15,
  );
  ctx.lineTo(centerX + halfBot * 1.5, ribbonY + 30);
  ctx.lineTo(centerX - halfBot * 1.5, ribbonY + 30);
  ctx.closePath();
  ctx.fillStyle = collarGrad;
  ctx.fill();

  // Striped ribbon bow & tag
  drawStripedRibbonBow(ctx, centerX, ribbonY);
  ctx.restore();
}

function drawStripedRibbonBow(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const bw = 180;
  const bh = 55;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  drawStripedLoop(ctx, cx, cy, -1, bw * 0.45, bh);
  drawStripedLoop(ctx, cx, cy, 1, bw * 0.45, bh);
  drawStripedTail(ctx, cx - 12, cy + 10, -35, 110, 32);
  drawStripedTail(ctx, cx + 12, cy + 10, 35, 110, 32);
  drawStripedTag(ctx, cx, cy + 12);
  drawStripedKnot(ctx, cx, cy);

  ctx.restore();
}

function drawStripedLoop(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: number, w: number, h: number) {
  ctx.save();
  ctx.translate(cx + dir * 8, cy);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(dir * w * 0.3, -h * 0.9, dir * w * 0.95, -h * 0.7, dir * w, -h * 0.1);
  ctx.bezierCurveTo(dir * w * 0.9, h * 0.7, dir * w * 0.3, h * 0.8, 0, 0);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.clip();

  const stripes = 6;
  ctx.fillStyle = '#1A1A1A';
  for (let i = 0; i < stripes; i += 2) {
    const sy = -h * 0.8 + (i * h * 1.6) / stripes;
    ctx.fillRect(dir > 0 ? 0 : -w * 1.2, sy, w * 1.2, (h * 1.6) / (stripes * 2.1));
  }
  ctx.restore();
}

function drawStripedTail(ctx: CanvasRenderingContext2D, x: number, y: number, angleDeg: number, len: number, width: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(-width / 2, 0);
  ctx.lineTo(width / 2, 0);
  ctx.lineTo(width / 2, len);
  ctx.lineTo(0, len - 14);
  ctx.lineTo(-width / 2, len);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.clip();

  const numStripes = 5;
  const stripeW = width / numStripes;
  ctx.fillStyle = '#1A1A1A';
  for (let i = 0; i < numStripes; i += 2) {
    ctx.fillRect(-width / 2 + i * stripeW, 0, stripeW, len + 10);
  }
  ctx.restore();
}

function drawStripedTag(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const tagW = 34;
  const tagH = 58;
  ctx.save();
  ctx.translate(cx - tagW / 2, cy);
  ctx.beginPath();
  ctx.roundRect(0, 0, tagW, tagH, [4, 4, 3, 3]);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.clip();

  ctx.fillStyle = '#1A1A1A';
  const stripeH = 9;
  for (let y = 0; y < tagH; y += stripeH * 2) {
    ctx.fillRect(0, y, tagW, stripeH);
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy + 5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#DCDCDC';
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

function drawStripedKnot(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const kw = 24;
  const kh = 28;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cx - kw / 2, cy - kh / 2, kw, kh, 4);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(cx - kw / 2, cy - kh / 2, 7, kh);
  ctx.fillRect(cx + 4, cy - kh / 2, 7, kh);
  ctx.restore();
}

// ─── 4. COMPLETE BOUQUET DRAW FUNCTION (Backward Compatible) ────────────────

export function drawBouquet(
  ctx: CanvasRenderingContext2D,
  bucketId: string,
  wrapperTypeId: string,
): BouquetDimensions {
  return drawBouquetBack(ctx, bucketId, wrapperTypeId);
}

export function drawBucketShape(
  ctx: CanvasRenderingContext2D,
  bucketId: string,
  wrapperTypeId: string,
): BouquetDimensions {
  return drawBouquet(ctx, bucketId, wrapperTypeId);
}

// ─── 5. GREETING CARD / BUSINESS-CARD STYLE OVERLAY ─────────────────────────

export interface CardBounds {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

export function getCardBounds(
  textConfig: TextConfig,
  canvasW = 600,
  canvasH = 600,
): CardBounds {
  const cardScale = Math.max(0.55, Math.min(2.4, textConfig.cardScale ?? 1.0));
  const w = Math.round(240 * cardScale);
  const h = Math.round(138 * cardScale);
  const cx = textConfig.cardX ?? (canvasW / 2);
  let cy = textConfig.cardY;
  if (cy === undefined) {
    if (textConfig.position === 'top') cy = Math.round(canvasH * 0.16);
    else if (textConfig.position === 'center') cy = Math.round(canvasH * 0.45);
    else cy = Math.round(canvasH - h / 2 - (canvasH > canvasW ? 30 : 18));
  }
  return {
    x: Math.round(cx - w / 2),
    y: Math.round(cy - h / 2),
    w,
    h,
    cx: Math.round(cx),
    cy: Math.round(cy),
  };
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  textConfig: TextConfig,
): void {
  if (!textConfig.content || !textConfig.content.trim()) return;

  const {
    content,
    font,
    size,
    color,
    weight,
    opacity,
    cardStyle = 'simple',
  } = textConfig;

  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;
  const bounds = getCardBounds(textConfig, canvasW, canvasH);
  const { x, y, w, h, cx } = bounds;
  const cardScale = Math.max(0.55, Math.min(2.4, textConfig.cardScale ?? 1.0));

  ctx.save();
  ctx.globalAlpha = opacity;

  // 1. Paper Drop Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = Math.round(14 * cardScale);
  ctx.shadowOffsetY = Math.round(6 * cardScale);

  // 2. Card Background & Style
  if (cardStyle === 'elegant') {
    // Elegant Luxury Gold Foil Card (Warm Cream)
    const cardGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    cardGrad.addColorStop(0, '#FFFDF8');
    cardGrad.addColorStop(0.5, '#FAF3E3');
    cardGrad.addColorStop(1, '#F6EBD4');
    ctx.fillStyle = cardGrad;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.round(8 * cardScale));
    ctx.fill();
    ctx.restore(); // end shadow

    // Outer Gold Foil Border
    ctx.save();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = Math.max(1, 1.8 * cardScale);
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, w - 2, h - 2, Math.round(7 * cardScale));
    ctx.stroke();

    // Inset Delicate Gold Hairline
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
    ctx.lineWidth = Math.max(0.6, 0.8 * cardScale);
    ctx.beginPath();
    ctx.roundRect(x + Math.round(5 * cardScale), y + Math.round(5 * cardScale), w - Math.round(10 * cardScale), h - Math.round(10 * cardScale), Math.round(5 * cardScale));
    ctx.stroke();

    // Top Header Ribbon Stamp
    const headerFontSz = Math.max(7, Math.round(8.5 * cardScale));
    ctx.font = `bold ${headerFontSz}px "Montserrat", sans-serif`;
    ctx.fillStyle = '#B8860B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('✦  A SPECIAL GIFT FOR YOU  ✦', cx, y + Math.round(10 * cardScale));

    // Decorative corner accents (dots)
    ctx.fillStyle = '#D4AF37';
    const inset = Math.round(9 * cardScale);
    const dotRadius = Math.max(1.2, 1.8 * cardScale);
    [
      [x + inset, y + inset],
      [x + w - inset, y + inset],
      [x + inset, y + h - inset],
      [x + w - inset, y + h - inset],
    ].forEach(([dotX, dotY]) => {
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Top Gold Florist Card Clip / Pin
    const clipW = Math.round(14 * cardScale);
    const clipH = Math.round(8 * cardScale);
    ctx.beginPath();
    ctx.roundRect(cx - clipW / 2, y - Math.round(4 * cardScale), clipW, clipH, Math.round(3 * cardScale));
    ctx.fillStyle = '#E5C058';
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = Math.max(0.8, 1 * cardScale);
    ctx.stroke();
    ctx.restore();

  } else {
    // Style: 'simple' — Modern Minimalist Card (Crisp White Stationery)
    const cardGrad = ctx.createLinearGradient(x, y, x, y + h);
    cardGrad.addColorStop(0, '#FFFFFF');
    cardGrad.addColorStop(1, '#FAFAF9');
    ctx.fillStyle = cardGrad;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.round(8 * cardScale));
    ctx.fill();
    ctx.restore(); // end shadow

    // Clean modern border
    ctx.save();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = Math.max(1, 1.4 * cardScale);
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, w - 2, h - 2, Math.round(7 * cardScale));
    ctx.stroke();

    // Inset subtle line
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = Math.max(0.6, 0.8 * cardScale);
    ctx.beginPath();
    ctx.roundRect(x + Math.round(5 * cardScale), y + Math.round(5 * cardScale), w - Math.round(10 * cardScale), h - Math.round(10 * cardScale), Math.round(5 * cardScale));
    ctx.stroke();

    // Subtle header badge
    const headerFontSz = Math.max(7, Math.round(8.5 * cardScale));
    ctx.font = `600 ${headerFontSz}px "Montserrat", sans-serif`;
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('FLOWER MESSAGE', cx, y + Math.round(10 * cardScale));

    // Top Metallic Silver Cardholder Clip
    const clipW = Math.round(14 * cardScale);
    const clipH = Math.round(8 * cardScale);
    ctx.beginPath();
    ctx.roundRect(cx - clipW / 2, y - Math.round(4 * cardScale), clipW, clipH, Math.round(3 * cardScale));
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = Math.max(0.8, 1 * cardScale);
    ctx.stroke();
    ctx.restore();
  }

  // 3. Multi-line Text Content Rendering (Inside the Card)
  const baseSize = size || 13;
  const actualFontSize = Math.max(9, Math.min(32, Math.round(baseSize * cardScale)));
  ctx.save();
  ctx.fillStyle = color || '#1E293B';
  ctx.font = `${weight || 'normal'} ${actualFontSize}px '${font || 'Montserrat'}', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxTextW = w - Math.round(28 * cardScale); // comfortable padding
  const lineH = Math.round(actualFontSize * 1.34);

  // Wrap text respecting explicit newlines (\n)
  const paragraphs = content.split('\n');
  const renderedLines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      renderedLines.push('');
      continue;
    }
    const words = para.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxTextW && current) {
        renderedLines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) renderedLines.push(current);
  }

  // Max lines that can comfortably fit
  const displayLines = renderedLines.slice(0, 5);
  const totalTextH = displayLines.length * lineH;

  // Center vertically in text area
  const textAreaTop = y + Math.round(22 * cardScale);
  const textAreaH = h - Math.round(30 * cardScale);
  let startY = textAreaTop + (textAreaH - totalTextH) / 2 + lineH / 2;

  displayLines.forEach((line) => {
    if (line) {
      ctx.fillText(line, cx, startY);
    }
    startY += lineH;
  });

  ctx.restore();
  ctx.restore();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function adjustColor(hex: string, amount: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  if (hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '').padStart(6, '0');
  const num = parseInt(h, 16);
  const r = clamp(((num >> 16) & 0xff) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}
