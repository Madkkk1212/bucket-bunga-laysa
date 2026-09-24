export type BucketTheme =
  | 'korean'
  | 'onepiece'
  | 'naruto'
  | 'kuromi'
  | 'stitch'
  | 'koran'
  | 'doraemon'
  | 'cinnamoroll'
  | 'totoro'
  | 'sailormoon'
  | 'pikachu'
  | 'hellokitty'
  | 'heart'
  | 'rustic';
export type BucketSizeCategory = '10-flowers' | '25-flowers';
export type BucketGeometry = 'origami-wrap' | 'barrel-tub';

export interface BucketSize {
  id: string;
  label: string;
  diameter: number;
  height: number;
  unit: string;
  capacity: string;
  maxFlowers: number;
  canvasWidth: number;
  canvasHeight: number;
  image?: string;
  backImage?: string;
  frontImage?: string;
  description?: string;
  tag?: string;
  category?: BucketTheme;
  themeName?: string;
  sizeCategory?: BucketSizeCategory;
  geometryType?: BucketGeometry;
  canvasFilter?: string;
  cssFilter?: string;
  colorName?: string;
  colorHex?: string;
  isNew?: boolean;
  isPremium?: boolean;
}

export interface WrapperType {
  id: string;
  label: string;
  color: string;
  texture: string;
  priceModifier: number;
}

export type FlowerCategory = 'main' | 'filler' | 'greenery';

export interface FlowerDef {
  id: string;
  name: string;
  imageUrl: string;
  category: FlowerCategory;
  emoji: string;
  color: string;
  description?: string;
  colorName?: string;
  isPremium?: boolean;
}

export interface FlowerFamily {
  id: string;
  name: string;
  category: FlowerCategory;
  emoji: string;
  description?: string;
  defaultFlowerId: string;
  variants: FlowerDef[];
}

export interface PlacedFlower {
  uid: string;
  flowerId: string;
  imageUrl: string;
  category?: FlowerCategory;
  order: number;
  zIndex: number;
  angle: number;
  radius: number;
  rotation: number;
  stemVariation: number;
  x?: number;
  y?: number;
  size?: number;
  scale?: number;
  customRotation?: number;
  isManual?: boolean;
  layer?: 'inside' | 'front';
}

export type TextPosition = 'top' | 'center' | 'bottom';
export type FontWeight = 'normal' | 'bold';

export type CanvasRatio = '9:16' | '4:5' | '1:1' | '3:4';
export type BackgroundTheme = 'studio-warm' | 'rose-milk' | 'midnight-noir' | 'sage-botanical' | 'kraft-warm';

export interface TextConfig {
  content: string;
  font: string;
  size: number;
  color: string;
  position: TextPosition;
  weight: FontWeight;
  opacity: number;
  /** Card visual style: simple = white card, elegant = decorative card */
  cardStyle?: 'simple' | 'elegant';
  /** Card X position on canvas (default: center) */
  cardX?: number;
  /** Card Y position on canvas (default: bottom) */
  cardY?: number;
  /** Card scale multiplier for manual resizing (default: 1.0) */
  cardScale?: number;
}

export interface Final2DProduct {
  image: string | null;
  width: number;
  height: number;
  status: 'draft' | 'final';
  savedAt?: string;
}

export interface DesignState {
  id: string;
  name: string;
  bucketSize: BucketSize['id'];
  wrapperType: string;
  selectedFlowers: PlacedFlower[];
  text: TextConfig;
  currentStep: number;
  final2D: Final2DProduct;
  canvasRatio?: CanvasRatio;
  bgTheme?: BackgroundTheme;
  bouquetScale?: number;
  /** Rotation of the entire bouquet in degrees (default: 0) */
  bouquetRotation?: number;
  /** Layering mode: 'inside' (tucked in bucket collar) or 'front' (cascading on front of bucket) */
  flowerPlacementMode?: 'inside' | 'front';
  /** Manual offset (px in canvas coords) applied to the entire bouquet position */
  bucketOffset?: { x: number; y: number };
  /** Target jumlah bunga (5, 10, 15, 25, 50) yang dipilih sebelum merangkai */
  targetFlowerCount?: FlowerCountVariant;
}

export type FlowerCountVariant = 5 | 10 | 15 | 25 | 50;

export interface DesignContextType {
  design: DesignState;
  setBucketSize: (id: BucketSize['id']) => void;
  setWrapperType: (id: string) => void;
  setTargetFlowerCount: (count: FlowerCountVariant) => void;
  addFlower: (flower: FlowerDef) => void;
  addFlowerAtPosition: (flower: FlowerDef, x: number, y: number) => void;
  removeFlowerByType: (flowerId: string) => void;
  removeFlowerByUid: (uid: string) => void;
  updateFlower: (uid: string, updates: Partial<PlacedFlower>) => void;
  changeFlowerLayer: (uid: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  toggleFlowerLayer: (uid: string) => void;
  setFlowerLayer: (uid: string, layer: 'inside' | 'front') => void;
  setFlowerPlacementMode: (mode: 'inside' | 'front') => void;
  duplicateFlower: (uid: string) => void;
  resetToAutoLayout: () => void;
  setText: (text: Partial<TextConfig>) => void;
  setStep: (step: number) => void;
  resetDesign: () => void;
  getFlowerCount: (flowerId: string) => number;
  getTotalFlowers: () => number;
  getMaxFlowers: () => number;
  /** Move flower (by uid) to a specific index in the array */
  moveFlower: (uid: string, toIndex: number) => void;
  /** Selected flower UID — shared between canvas and summary panel */
  selectedFlowerUid: string | null;
  setSelectedFlowerUid: (uid: string | null) => void;
  /** Hovered flower UID for highlighting buried flowers on canvas */
  hoveredFlowerUid: string | null;
  setHoveredFlowerUid: (uid: string | null) => void;
  /** Aspect ratio, background theme, bouquet scale and rotation controls */
  setCanvasRatio: (ratio: CanvasRatio) => void;
  setBgTheme: (theme: BackgroundTheme) => void;
  setBouquetScale: (scale: number) => void;
  setBouquetRotation: (deg: number) => void;
  /** Offset seluruh posisi buket di canvas (drag bucket bebas) */
  setBucketOffset: (offset: { x: number; y: number }) => void;
  /** Save 2D Master Product as FINAL */
  saveFinal2D: (imageDataUrl: string, width?: number, height?: number) => void;
  /** Reopen 2D design for editing */
  resetToEdit2D: () => void;
  /** Status apakah akses VIP/Premium bunga & bucket sudah terbuka */
  isPremiumUnlocked: boolean;
  /** Nama pengguna yang mengaktifkan kode VIP */
  premiumUserName?: string;
  /** Buka akses premium dengan nama dan 1 kode voucher / kode akses */
  unlockPremium: (code: string, userName?: string) => Promise<{ success: boolean; message: string; userName?: string }>;
  /** Reset / Hapus status VIP dari perangkat ini (keluar VIP) */
  revokePremium: () => void;
}

