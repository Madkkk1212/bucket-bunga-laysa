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
  canvasFilter?: string;
  cssFilter?: string;
  colorName?: string;
  colorHex?: string;
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
  customRotation?: number;
  isManual?: boolean;
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
}

export interface DesignContextType {
  design: DesignState;
  setBucketSize: (id: BucketSize['id']) => void;
  setWrapperType: (id: string) => void;
  addFlower: (flower: FlowerDef) => void;
  addFlowerAtPosition: (flower: FlowerDef, x: number, y: number) => void;
  removeFlowerByType: (flowerId: string) => void;
  removeFlowerByUid: (uid: string) => void;
  updateFlower: (uid: string, updates: Partial<PlacedFlower>) => void;
  changeFlowerLayer: (uid: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
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
  /** Save 2D Master Product as FINAL */
  saveFinal2D: (imageDataUrl: string, width?: number, height?: number) => void;
  /** Reopen 2D design for editing */
  resetToEdit2D: () => void;
}

