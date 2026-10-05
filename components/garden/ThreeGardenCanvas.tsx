'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GardenTile } from './IsometricGardenView';
import { 
  RotateCw, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Sparkles 
} from 'lucide-react';

interface ThreeGardenCanvasProps {
  tiles: GardenTile[];
  targetTileId: number | null;
  activeHoverTileId: number | null;
  wateredTileAnimations: Set<number>;
  onTileClick: (tile: GardenTile) => void;
  onTileHover?: (tileId: number | null) => void;
  isWaterDragging?: boolean;
  decorations?: Array<{ id: string; ornamentKey: string; name: string; x: number; y: number; scale?: number; rotation?: number }>;
  onDecorationClick?: (decoration: { id: string; ornamentKey: string; name: string; x: number; y: number; scale?: number; rotation?: number }) => void;
  onDecorationMove?: (id: string, x: number, y: number) => void;
}

// Spacing between 5x5 tiles in Three.js world units
const GRID_SPACING = 1.92;
const TILE_Y = 0.28;

// Safe cross-browser rounded rectangle
function safeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function ThreeGardenCanvas({
  tiles,
  targetTileId,
  activeHoverTileId,
  wateredTileAnimations,
  onTileClick,
  onTileHover,
  isWaterDragging = false,
  decorations = [],
  onDecorationClick,
  onDecorationMove,
}: ThreeGardenCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Floating Controls UI state
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const isAutoRotateRef = useRef(false);
  isAutoRotateRef.current = isAutoRotate;

  const [currentViewMode, setCurrentViewMode] = useState<'diorama' | 'top'>('diorama');

  // Internal Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const islandGroupRef = useRef<THREE.Group | null>(null);
  const tilesGroupRef = useRef<THREE.Group | null>(null);
  const decorationsGroupRef = useRef<THREE.Group | null>(null);
  const decorationRootsRef = useRef<Map<string, THREE.Group>>(new Map());
  const activeDecorationDragRef = useRef<{ id: string; moved: boolean; startX: number; startZ: number } | null>(null);
  const cameraFitRadiusRef = useRef(18);
  const tileMeshesMapRef = useRef<Map<number, THREE.Mesh>>(new Map());
  const tileSpritesMapRef = useRef<Map<number, THREE.Sprite>>(new Map());
  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());
  const splashParticlesRef = useRef<Array<{
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
  }>>([]);

  // Camera Orbit State (Spherical coordinates)
  const orbitState = useRef({
    radius: 18.0,
    minRadius: 10.0,
    maxRadius: 28.0,
    yaw: Math.PI / 4, // 45 degrees initial
    pitch: 0.68, // ~39 degrees elevation (comfortable diorama angle)
    targetYaw: Math.PI / 4,
    targetPitch: 0.68,
    targetRadius: 18.0,
    isDragging: false,
    prevPointerX: 0,
    prevPointerY: 0,
    dragDistance: 0,
    pointerDownTime: 0,
  });

  // Cached textures generator for high performance
  const generateSpriteTexture = useCallback((tile: GardenTile): THREE.Texture => {
    const stage = tile.growthStage || 1;
    const cacheKey = `${tile.flowerKey || 'sprout'}-${stage}-${tile.flowerColor || '#f43f5e'}-${tile.wateredToday ? 'watered' : 'dry'}`;
    
    if (textureCacheRef.current.has(cacheKey)) {
      return textureCacheRef.current.get(cacheKey)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return new THREE.Texture();
    }

    ctx.clearRect(0, 0, 256, 256);

    const centerX = 128;
    const baseY = 246; // Ground contact point
    const mainColor = tile.flowerColor || '#f43f5e';

    if (stage === 1) {
      // ── STAGE 1: BIBIT TUNAS MUNGIL ──
      // 1. Overhead Badge
      ctx.save();
      const badgeText = '🌱 Bibit';
      ctx.font = 'bold 22px Fredoka, sans-serif';
      const textWidth = ctx.measureText(badgeText).width;
      const badgeW = textWidth + 24;
      const badgeH = 34;
      const badgeX = centerX - badgeW / 2;
      const badgeY = 62;

      ctx.fillStyle = '#15803d';
      safeRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 17);
      ctx.fill();

      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.5;
      safeRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 17);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, centerX, badgeY + badgeH / 2);
      ctx.restore();

      // 2. Moist Base Soil Ring
      ctx.fillStyle = '#3d220f';
      ctx.beginPath();
      ctx.ellipse(centerX, baseY - 4, 36, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Sprout Stem
      ctx.lineWidth = 9;
      ctx.strokeStyle = '#16a34a';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, baseY - 5);
      ctx.quadraticCurveTo(centerX - 4, 180, centerX, 138);
      ctx.stroke();

      // 4. Left Baby Leaf
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerX, 175);
      ctx.bezierCurveTo(centerX - 46, 170, centerX - 56, 132, centerX - 24, 126);
      ctx.bezierCurveTo(centerX, 142, centerX, 172, centerX, 175);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 5. Right Baby Leaf
      ctx.fillStyle = '#4ade80';
      ctx.strokeStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(centerX, 168);
      ctx.bezierCurveTo(centerX + 48, 162, centerX + 58, 124, centerX + 26, 118);
      ctx.bezierCurveTo(centerX, 134, centerX, 164, centerX, 168);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 6. Colored Seedling Bud
      ctx.fillStyle = mainColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(centerX, 128, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Highlight sheen
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(centerX - 4, 124, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (stage === 2) {
      // ── STAGE 2: KUNCUP MEKAR BERKEMBANG ──
      // 1. Overhead Badge
      ctx.save();
      const badgeText = '🌿 Kuncup';
      ctx.font = 'bold 22px Fredoka, sans-serif';
      const textWidth = ctx.measureText(badgeText).width;
      const badgeW = textWidth + 24;
      const badgeH = 34;
      const badgeX = centerX - badgeW / 2;
      const badgeY = 32;

      ctx.fillStyle = '#0284c7';
      safeRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 17);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      safeRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 17);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, centerX, badgeY + badgeH / 2);
      ctx.restore();

      // Base soil
      ctx.fillStyle = '#3d220f';
      ctx.beginPath();
      ctx.ellipse(centerX, baseY - 4, 40, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Taller Stem
      ctx.lineWidth = 11;
      ctx.strokeStyle = '#15803d';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, baseY - 5);
      ctx.quadraticCurveTo(centerX - 5, 170, centerX, 100);
      ctx.stroke();

      // 4 Developing leaves
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(centerX - 35, 175, 26, 12, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(centerX + 35, 155, 28, 13, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(centerX - 30, 130, 22, 10, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Swelling Bud
      ctx.fillStyle = mainColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(centerX, 92, 24, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Green Sepals
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(centerX - 18, 100);
      ctx.quadraticCurveTo(centerX, 120, centerX + 18, 100);
      ctx.lineTo(centerX, 115);
      ctx.closePath();
      ctx.fill();

    } else {
      // ── STAGE 3 & 4: MEKAR SEMPURNA / PUSPA CAHAYA ──
      // 1. Overhead Badge
      ctx.save();
      const badgeText = stage === 4 ? '✨ Puspa Cahaya' : '🌸 Mekar';
      ctx.font = 'bold 21px Fredoka, sans-serif';
      const textWidth = ctx.measureText(badgeText).width;
      const badgeW = textWidth + 24;
      const badgeH = 34;
      const badgeX = centerX - badgeW / 2;
      const badgeY = 16;

      ctx.fillStyle = stage === 4 ? '#b45309' : '#be185d';
      safeRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 17);
      ctx.fill();

      ctx.strokeStyle = stage === 4 ? '#fbbf24' : '#f472b6';
      ctx.lineWidth = 2.5;
      safeRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 17);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, centerX, badgeY + badgeH / 2);
      ctx.restore();

      // Base soil
      ctx.fillStyle = '#3d220f';
      ctx.beginPath();
      ctx.ellipse(centerX, baseY - 4, 44, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Strong Stem
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#15803d';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, baseY - 5);
      ctx.quadraticCurveTo(centerX - 4, 160, centerX, 110);
      ctx.stroke();

      // Big Lush Leaves
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(centerX - 40, 170, 36, 16, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(centerX + 40, 150, 38, 17, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Radiant Aura Ring for Stage 4
      if (stage === 4) {
        ctx.save();
        const grad = ctx.createRadialGradient(centerX, 90, 20, centerX, 90, 75);
        grad.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
        grad.addColorStop(0.7, 'rgba(251, 191, 36, 0.2)');
        grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, 90, 75, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Large Full Bloom Flower Head (Layered Petals)
      ctx.save();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const px = centerX + Math.cos(angle) * 32;
        const py = 92 + Math.sin(angle) * 28;
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(px, py, 26, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center corolla
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX, 92, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = stage === 4 ? '#fbbf24' : '#fef08a';
      ctx.beginPath();
      ctx.arc(centerX, 92, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Keep growth badges in the inspector only; the garden itself stays uncluttered.
    if (stage === 1) ctx.clearRect(44, 55, 168, 50);
    else if (stage === 2) ctx.clearRect(44, 25, 168, 50);
    else ctx.clearRect(20, 8, 216, 50);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    textureCacheRef.current.set(cacheKey, texture);
    return texture;
  }, []);

  // Initialize Three.js Scene, Camera, Renderer & Diorama Island
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth || 800, 1);
    const height = Math.max(container.clientHeight || 540, 1);

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f5f3ec');
    sceneRef.current = scene;

    // 2. Camera (Perspective)
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(36, aspect, 0.5, 100);
    cameraRef.current = camera;

    // 3. Renderer (High DPI, tone mapped)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear any previous canvas element
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Cinematic Pastel Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xe0f2fe, 0x53793a, 0.95);
    scene.add(hemisphereLight);

    // Warm Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xfff7e8, 2.0);
    sunLight.position.set(-8, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1536;
    sunLight.shadow.mapSize.height = 1536;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Subtle Fill Light from opposite side
    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.45);
    fillLight.position.set(10, 10, -12);
    scene.add(fillLight);

    // ── 5. FLOATING DIORAMA ISLAND ASSEMBLY ──
    const islandGroup = new THREE.Group();
    islandGroupRef.current = islandGroup;
    scene.add(islandGroup);

    const decorationsGroup = new THREE.Group();
    decorationsGroupRef.current = decorationsGroup;
    islandGroup.add(decorationsGroup);

    // A single square slab closes every side and keeps the soil connected through a full orbit.
    const dirtBody = new THREE.Mesh(
      new RoundedBoxGeometry(11, 1.2, 11, 5, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x62401f, roughness: 0.96 })
    );
    dirtBody.position.y = -0.52;
    dirtBody.castShadow = true;
    dirtBody.receiveShadow = true;
    islandGroup.add(dirtBody);

    const grassCap = new THREE.Mesh(
      new RoundedBoxGeometry(10.96, 0.24, 10.96, 5, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x75c83f, roughness: 0.9 })
    );
    grassCap.position.y = 0.13;
    grassCap.receiveShadow = true;
    islandGroup.add(grassCap);

    const grassRim = new THREE.Mesh(
      new RoundedBoxGeometry(10.99, 0.07, 10.99, 5, 0.16),
      new THREE.MeshStandardMaterial({ color: 0xa4e46b, roughness: 0.75 })
    );
    grassRim.position.y = 0.255;
    islandGroup.add(grassRim);

    const soilPebbles = new THREE.InstancedMesh(
      new THREE.DodecahedronGeometry(0.16, 0),
      new THREE.MeshStandardMaterial({ roughness: 0.98, vertexColors: true }),
      240
    );
    const pebbleDummy = new THREE.Object3D();
    let pebbleIndex = 0;
    for (let along = -5.05; along <= 5.05; along += 0.42) {
      for (const height of [-0.18, -0.63]) {
        for (const edge of [-1, 1]) {
          pebbleDummy.position.set(along, height, edge * 5.49);
          pebbleDummy.scale.set(0.78 + Math.random() * 0.55, 0.65 + Math.random() * 0.45, 0.55 + Math.random() * 0.35);
          pebbleDummy.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4);
          pebbleDummy.updateMatrix();
          soilPebbles.setMatrixAt(pebbleIndex, pebbleDummy.matrix);
          soilPebbles.setColorAt(pebbleIndex, new THREE.Color([0x80542d, 0x714622, 0x94663b, 0x5f3b20][pebbleIndex % 4]));
          pebbleIndex++;
          pebbleDummy.position.set(edge * 5.49, height, along);
          pebbleDummy.updateMatrix();
          soilPebbles.setMatrixAt(pebbleIndex, pebbleDummy.matrix);
          soilPebbles.setColorAt(pebbleIndex, new THREE.Color([0x80542d, 0x714622, 0x94663b, 0x5f3b20][pebbleIndex % 4]));
          pebbleIndex++;
        }
      }
    }
    soilPebbles.count = Math.min(pebbleIndex, 240);
    soilPebbles.instanceMatrix.needsUpdate = true;
    if (soilPebbles.instanceColor) soilPebbles.instanceColor.needsUpdate = true;
    islandGroup.add(soilPebbles);

    // A tightly overlapping carpet of low foliage covers the entire top surface.
    const random = (() => {
      let seed = 48271;
      return () => {
        seed = (seed * 48271) % 2147483647;
        return (seed - 1) / 2147483646;
      };
    })();
    const inRoundedTop = (x: number, z: number) => !(Math.abs(x) > 5.05 && Math.abs(z) > 5.05);
    const coverGeometry = new THREE.DodecahedronGeometry(0.24, 0);
    const groundCover = new THREE.InstancedMesh(
      coverGeometry,
      new THREE.MeshStandardMaterial({ roughness: 0.86, vertexColors: true }),
      1700
    );
    const coverDummy = new THREE.Object3D();
    let coverIndex = 0;
    for (let x = -5.08; x <= 5.08 && coverIndex < 1700; x += 0.26) {
      for (let z = -5.08; z <= 5.08 && coverIndex < 1700; z += 0.26) {
        const px = x + (random() - 0.5) * 0.07;
        const pz = z + (random() - 0.5) * 0.07;
        if (!inRoundedTop(px, pz)) continue;
        coverDummy.position.set(px, TILE_Y - 0.055, pz);
        coverDummy.rotation.set((random() - 0.5) * 0.16, random() * Math.PI, (random() - 0.5) * 0.16);
        coverDummy.scale.set(0.9 + random() * 0.4, 0.48 + random() * 0.22, 0.9 + random() * 0.4);
        coverDummy.updateMatrix();
        groundCover.setMatrixAt(coverIndex, coverDummy.matrix);
        groundCover.setColorAt(coverIndex, new THREE.Color([0x4f9a35, 0x5eaa38, 0x6bbd3c, 0x3f8734, 0x79c943][Math.floor(random() * 5)]));
        coverIndex++;
      }
    }
    groundCover.count = coverIndex;
    groundCover.instanceMatrix.needsUpdate = true;
    if (groundCover.instanceColor) groundCover.instanceColor.needsUpdate = true;
    groundCover.castShadow = true;
    groundCover.receiveShadow = true;
    islandGroup.add(groundCover);

    // Short wildflowers fill the spaces between the user's plantable positions.
    const fillerFlowerLocations: Array<{ x: number; z: number; color: number }> = [];
    for (let x = -4.8; x <= 4.8; x += 0.42) {
      for (let z = -4.8; z <= 4.8; z += 0.42) {
        const px = x + (random() - 0.5) * 0.18;
        const pz = z + (random() - 0.5) * 0.18;
        if (!inRoundedTop(px, pz) || random() > 0.38) continue;
        let nearPlant = false;
        for (let row = -2; row <= 2; row++) {
          for (let col = -2; col <= 2; col++) {
            if (Math.hypot(px - col * GRID_SPACING, pz - row * GRID_SPACING) < 0.58) nearPlant = true;
          }
        }
        if (!nearPlant) fillerFlowerLocations.push({ x: px, z: pz, color: [0xb789e8, 0xe79bc5, 0xf1d67d, 0xf3e4fa][Math.floor(random() * 4)] });
      }
    }
    const stemGeometry = new THREE.CylinderGeometry(0.014, 0.025, 0.45, 5);
    const stems = new THREE.InstancedMesh(stemGeometry, new THREE.MeshStandardMaterial({ color: 0x377d3b, roughness: 0.8 }), fillerFlowerLocations.length);
    const petalGeometry = new THREE.SphereGeometry(0.09, 7, 5);
    const petals = new THREE.InstancedMesh(petalGeometry, new THREE.MeshStandardMaterial({ roughness: 0.72, vertexColors: true }), fillerFlowerLocations.length * 5);
    const flowerCenters = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 7, 5), new THREE.MeshStandardMaterial({ color: 0xffe891, roughness: 0.65 }), fillerFlowerLocations.length);
    const flowerDummy = new THREE.Object3D();
    fillerFlowerLocations.forEach((flower, index) => {
      const bloomY = TILE_Y + 0.36 + random() * 0.08;
      flowerDummy.position.set(flower.x, TILE_Y + 0.16, flower.z);
      flowerDummy.rotation.set((random() - 0.5) * 0.18, 0, (random() - 0.5) * 0.18);
      flowerDummy.scale.setScalar(1);
      flowerDummy.updateMatrix();
      stems.setMatrixAt(index, flowerDummy.matrix);
      const petalColor = new THREE.Color(flower.color);
      for (let petal = 0; petal < 5; petal++) {
        const angle = (petal / 5) * Math.PI * 2;
        flowerDummy.position.set(flower.x + Math.cos(angle) * 0.075, bloomY, flower.z + Math.sin(angle) * 0.075);
        flowerDummy.scale.set(0.76, 0.6, 0.78);
        flowerDummy.rotation.set(0, -angle, 0.12);
        flowerDummy.updateMatrix();
        petals.setMatrixAt(index * 5 + petal, flowerDummy.matrix);
        petals.setColorAt(index * 5 + petal, petalColor);
      }
      flowerDummy.position.set(flower.x, bloomY + 0.012, flower.z);
      flowerDummy.scale.setScalar(0.7);
      flowerDummy.rotation.set(0, 0, 0);
      flowerDummy.updateMatrix();
      flowerCenters.setMatrixAt(index, flowerDummy.matrix);
    });
    stems.instanceMatrix.needsUpdate = true;
    petals.instanceMatrix.needsUpdate = true;
    flowerCenters.instanceMatrix.needsUpdate = true;
    if (petals.instanceColor) petals.instanceColor.needsUpdate = true;
    islandGroup.add(stems, petals, flowerCenters);

    // Compact, branching crowns form a full perimeter so the box remains lush from every side.
    const treePoints: Array<[number, number]> = [
      [-4.05, -4.0], [-1.55, -4.1], [1.55, -4.1], [4.05, -4.0],
      [-4.12, -1.55], [4.12, -1.55], [-4.12, 1.55], [4.12, 1.55],
      [-4.05, 4.0], [-1.55, 4.1], [1.55, 4.1], [4.05, 4.0],
    ];
    const trunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.075, 0.14, 1, 7),
      new THREE.MeshStandardMaterial({ color: 0x705033, roughness: 0.92 }),
      treePoints.length
    );
    const canopies = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.46, 1),
      new THREE.MeshStandardMaterial({ roughness: 0.9, vertexColors: true }),
      treePoints.length * 6
    );
    const blossoms = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.075, 6, 5),
      new THREE.MeshStandardMaterial({ roughness: 0.7, vertexColors: true }),
      treePoints.length * 24
    );
    const treeDummy = new THREE.Object3D();
    let canopyIndex = 0;
    let blossomIndex = 0;
    treePoints.forEach(([x, z], treeIndex) => {
      const height = 0.9 + random() * 0.42;
      treeDummy.position.set(x, TILE_Y + height / 2, z);
      treeDummy.scale.set(0.9 + random() * 0.25, height, 0.9 + random() * 0.25);
      treeDummy.rotation.set(0, random() * Math.PI, 0);
      treeDummy.updateMatrix();
      trunks.setMatrixAt(treeIndex, treeDummy.matrix);
      const crownColor = treeIndex % 3 === 0 ? 0x8063a6 : treeIndex % 3 === 1 ? 0x6b9140 : 0x9d83ba;
      for (let cluster = 0; cluster < 6; cluster++) {
        const angle = (cluster / 6) * Math.PI * 2;
        const crownY = TILE_Y + height + (cluster % 2) * 0.18;
        const crownX = x + Math.cos(angle) * (cluster % 2 ? 0.34 : 0.18);
        const crownZ = z + Math.sin(angle) * (cluster % 2 ? 0.34 : 0.18);
        treeDummy.position.set(crownX, crownY, crownZ);
        treeDummy.scale.set(0.78 + random() * 0.34, 0.82 + random() * 0.4, 0.76 + random() * 0.4);
        treeDummy.rotation.set(random() * 0.3, random() * Math.PI, random() * 0.3);
        treeDummy.updateMatrix();
        canopies.setMatrixAt(canopyIndex, treeDummy.matrix);
        canopies.setColorAt(canopyIndex, new THREE.Color(crownColor).offsetHSL((random() - 0.5) * 0.03, 0, (random() - 0.5) * 0.1));
        for (let dot = 0; dot < 4; dot++) {
          const dotAngle = random() * Math.PI * 2;
          treeDummy.position.set(crownX + Math.cos(dotAngle) * (0.18 + random() * 0.12), crownY + (random() - 0.5) * 0.28, crownZ + Math.sin(dotAngle) * (0.18 + random() * 0.12));
          treeDummy.scale.setScalar(0.65 + random() * 0.4);
          treeDummy.rotation.set(0, 0, 0);
          treeDummy.updateMatrix();
          blossoms.setMatrixAt(blossomIndex, treeDummy.matrix);
          blossoms.setColorAt(blossomIndex, new THREE.Color([0xd8c3f3, 0xe9d3fc, 0xf0c8e6, 0xa8c9e8][Math.floor(random() * 4)]));
          blossomIndex++;
        }
        canopyIndex++;
      }
    });
    trunks.instanceMatrix.needsUpdate = true;
    canopies.instanceMatrix.needsUpdate = true;
    blossoms.instanceMatrix.needsUpdate = true;
    if (canopies.instanceColor) canopies.instanceColor.needsUpdate = true;
    if (blossoms.instanceColor) blossoms.instanceColor.needsUpdate = true;
    trunks.castShadow = true;
    canopies.castShadow = true;
    blossoms.castShadow = true;
    islandGroup.add(trunks, canopies, blossoms);

    // ── 6. 5x5 TILES GROUP ──
    const tilesGroup = new THREE.Group();
    tilesGroupRef.current = tilesGroup;
    islandGroup.add(tilesGroup);

    // Camera Positioning Function
    const updateCameraPos = () => {
      const { radius, yaw, pitch } = orbitState.current;
      const horizontalFit = 7.9 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
      cameraFitRadiusRef.current = Math.max(15.5, horizontalFit);
      const fittedRadius = Math.max(radius, cameraFitRadiusRef.current * 0.92);
      const x = fittedRadius * Math.sin(pitch) * Math.sin(yaw);
      const y = fittedRadius * Math.cos(pitch);
      const z = fittedRadius * Math.sin(pitch) * Math.cos(yaw);
      camera.position.set(x, y, z);
      camera.lookAt(0, -0.4, 0);
    };
    updateCameraPos();

    // ── 7. ANIMATION LOOP (Smooth 60 FPS) ──
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const state = orbitState.current;

      // Auto-Orbit if toggled
      if (isAutoRotateRef.current && !state.isDragging) {
        state.targetYaw += 0.005;
      }

      // Smooth Orbital Damping / Inertia
      state.yaw += (state.targetYaw - state.yaw) * 0.12;
      state.pitch += (state.targetPitch - state.pitch) * 0.12;
      state.radius += (state.targetRadius - state.radius) * 0.12;

      // Update Camera Position
      updateCameraPos();

      // Gentle Island Ambient Float
      const time = clock.getElapsedTime();
      islandGroup.position.y = Math.sin(time * 1.4) * 0.08;

      // Update Water Splash Particles
      const particles = splashParticlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += delta;
        p.mesh.position.addScaledVector(p.velocity, delta);
        p.velocity.y -= 9.8 * delta; // Gravity

        const scale = Math.max(0, 1 - p.life / p.maxLife);
        p.mesh.scale.setScalar(scale);

        if (p.life >= p.maxLife || p.mesh.position.y < TILE_Y) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          particles.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize Handler ──
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = Math.max(container.clientWidth || 800, 1);
      const h = Math.max(container.clientHeight || 540, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // Run ONCE on mount!

  // Update 5x5 Tiles & Plant Sprites when `tiles`, `targetTileId`, or `activeHoverTileId` change
  useEffect(() => {
    const tilesGroup = tilesGroupRef.current;
    if (!tilesGroup) return;

    // Clear old tile objects
    while (tilesGroup.children.length > 0) {
      const child = tilesGroup.children[0];
      tilesGroup.remove(child);
      if ('geometry' in child && (child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }
    tileMeshesMapRef.current.clear();
    tileSpritesMapRef.current.clear();

    const hitAreaGeo = new THREE.PlaneGeometry(GRID_SPACING * 0.98, GRID_SPACING * 0.98);
    const ringGeo = new THREE.RingGeometry(0.82, 0.87, 48);

    tiles.forEach((tile) => {
      const colX = (tile.col - 2) * GRID_SPACING;
      const rowZ = (tile.row - 2) * GRID_SPACING;

      const isSelected = targetTileId === tile.id;
      const isHovered = activeHoverTileId === tile.id;
      // Invisible plot hit-area keeps planting and watering available beneath the dense plants.
      const hitArea = new THREE.Mesh(hitAreaGeo, new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        colorWrite: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      }));
      hitArea.rotation.x = -Math.PI / 2;
      hitArea.position.set(colX, TILE_Y + 0.012, rowZ);
      hitArea.userData = { tileId: tile.id, tile };
      tilesGroup.add(hitArea);
      tileMeshesMapRef.current.set(tile.id, hitArea);

      // Only show a fine locator when a plot is selected or targeted by the watering can.
      let ringColor = 0x38bdf8;
      let ringOpacity = 0;
      if (isSelected) {
        ringColor = 0xffdf87;
        ringOpacity = 0.82;
      } else if (isHovered) {
        ringColor = 0x7dd3fc;
        ringOpacity = 0.75;
      }

      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: ringOpacity
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(colX, TILE_Y + 0.018, rowZ);
      if (ringOpacity > 0) tilesGroup.add(ringMesh);

      // If PLANTED: Render 3D Camera-Facing Plant Billboard Sprite
      if (tile.planted) {
        const texture = generateSpriteTexture(tile);
        const spriteMat = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMat);
        
        // PIVOT ANCHORED AT ROOT BASE (x: 0.5, y: 0.0)
        sprite.center.set(0.5, 0.0);

        const stage = tile.growthStage || 1;
        const scaleW = stage === 1 ? 1.25 : stage === 2 ? 1.55 : stage === 4 ? 2.05 : 1.8;
        const scaleH = scaleW;
        sprite.scale.set(scaleW, scaleH, 1);

        // Position bottom base directly at the center of the tile soil
        sprite.position.set(colX, TILE_Y + 0.02, rowZ);
        sprite.userData = { tileId: tile.id, tile };
        tilesGroup.add(sprite);
        tileSpritesMapRef.current.set(tile.id, sprite);

      }
    });
  }, [tiles, targetTileId, activeHoverTileId, generateSpriteTexture]);

  // Render user decorations as real meshes too, so the old decoration controls still affect the scene.
  useEffect(() => {
    const parent = decorationsGroupRef.current;
    if (!parent) return;
    parent.clear();
    decorationRootsRef.current.clear();

    const addPart = (root: THREE.Group, geometry: THREE.BufferGeometry, color: number, position: [number, number, number], scale: [number, number, number] = [1, 1, 1], roughness = 0.82) => {
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 }));
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);
      return mesh;
    };

    decorations.forEach((decoration) => {
      const root = new THREE.Group();
      root.position.set((decoration.x / 410 - 0.5) * 10.96, TILE_Y - 0.04, (decoration.y / 410 - 0.5) * 10.96);
      root.scale.setScalar(decoration.scale ?? 0.82);
      root.rotation.y = THREE.MathUtils.degToRad(decoration.rotation ?? 0);

      if (decoration.ornamentKey === 'ornament_fountain') {
        addPart(root, new THREE.CylinderGeometry(0.38, 0.5, 0.24, 12), 0xf3f2eb, [0, 0.24, 0]);
        addPart(root, new THREE.CylinderGeometry(0.08, 0.13, 0.42, 10), 0xe7e4d8, [0, 0.55, 0]);
        addPart(root, new THREE.CylinderGeometry(0.29, 0.29, 0.035, 20), 0x62c5e9, [0, 0.38, 0]);
        addPart(root, new THREE.SphereGeometry(0.08, 10, 8), 0x74d4fa, [0, 0.83, 0.02], [0.72, 1.5, 0.72]);
      } else if (decoration.ornamentKey === 'ornament_bench') {
        for (let plank = 0; plank < 3; plank++) {
          addPart(root, new THREE.BoxGeometry(0.82, 0.09, 0.12), 0x8a512b, [0, 0.47, -0.12 + plank * 0.12]);
        }
        addPart(root, new THREE.BoxGeometry(0.82, 0.4, 0.09), 0x9a5c32, [0, 0.73, -0.2]);
        for (const x of [-0.31, 0.31]) {
          addPart(root, new THREE.BoxGeometry(0.07, 0.46, 0.07), 0x55351f, [x, 0.24, 0.01]);
          addPart(root, new THREE.BoxGeometry(0.07, 0.4, 0.07), 0x55351f, [x, 0.75, -0.2]);
        }
      } else if (decoration.ornamentKey === 'ornament_lantern') {
        addPart(root, new THREE.CylinderGeometry(0.035, 0.07, 1.05, 8), 0x493522, [0, 0.52, 0]);
        addPart(root, new THREE.BoxGeometry(0.26, 0.3, 0.26), 0xffd982, [0, 1.13, 0], [1, 1, 1], 0.3);
        addPart(root, new THREE.ConeGeometry(0.22, 0.17, 8), 0x583821, [0, 1.37, 0]);
        addPart(root, new THREE.SphereGeometry(0.31, 8, 8), 0xffd36c, [0, 1.12, 0], [1, 1, 1], 0.25);
      } else if (decoration.ornamentKey === 'ornament_cat') {
        addPart(root, new THREE.SphereGeometry(0.31, 10, 8), 0xf8f8f5, [0, 0.27, 0], [1.35, 0.72, 0.86]);
        addPart(root, new THREE.SphereGeometry(0.21, 10, 8), 0xffffff, [0.2, 0.5, 0.02]);
        addPart(root, new THREE.ConeGeometry(0.085, 0.2, 6), 0xf8f8f5, [0.08, 0.69, -0.12], [1, 1, 0.7]);
        addPart(root, new THREE.ConeGeometry(0.085, 0.2, 6), 0xf8f8f5, [0.32, 0.69, -0.12], [1, 1, 0.7]);
        addPart(root, new THREE.SphereGeometry(0.035, 8, 6), 0x4c3b35, [0.13, 0.53, 0.2]);
        addPart(root, new THREE.SphereGeometry(0.035, 8, 6), 0x4c3b35, [0.28, 0.53, 0.2]);
      } else if (decoration.ornamentKey === 'ornament_arch') {
        for (const x of [-0.68, 0.68]) {
          addPart(root, new THREE.CylinderGeometry(0.07, 0.1, 1.48, 8), 0x744524, [x, 0.74, 0]);
        }
        addPart(root, new THREE.TorusGeometry(0.68, 0.09, 8, 24, Math.PI), 0x80502f, [0, 1.43, 0]);
        for (let bloom = 0; bloom < 9; bloom++) {
          const angle = (bloom / 8) * Math.PI;
          addPart(root, new THREE.SphereGeometry(0.095, 7, 6), bloom % 2 ? 0xdb75ac : 0xf1a6d2, [Math.cos(angle) * 0.68, 1.43 + Math.sin(angle) * 0.68, 0.04]);
        }
      }

      root.traverse((child) => {
        if (child instanceof THREE.Mesh) child.userData.decorationId = decoration.id;
      });
      parent.add(root);
      decorationRootsRef.current.set(decoration.id, root);
    });

    return () => {
      parent.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(material => material.dispose());
      });
    };
  }, [decorations]);

  // Handle Trigger Water Splash Animation on Active Watered Tiles
  useEffect(() => {
    if (wateredTileAnimations.size === 0 || !sceneRef.current) return;

    const scene = sceneRef.current;
    const dropGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const dropMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    wateredTileAnimations.forEach((tileId) => {
      const tile = tiles.find(t => t.id === tileId);
      if (!tile) return;

      const colX = (tile.col - 2) * GRID_SPACING;
      const rowZ = (tile.row - 2) * GRID_SPACING;

      // Spawn 16 splashing water drops
      for (let i = 0; i < 16; i++) {
        const mesh = new THREE.Mesh(dropGeo, dropMat);
        mesh.position.set(
          colX + (Math.random() - 0.5) * 0.4,
          TILE_Y + 0.5 + Math.random() * 0.3,
          rowZ + (Math.random() - 0.5) * 0.4
        );
        scene.add(mesh);

        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 2.2;
        const vy = 3.0 + Math.random() * 2.5;

        splashParticlesRef.current.push({
          mesh,
          velocity: new THREE.Vector3(
            Math.cos(angle) * speed,
            vy,
            Math.sin(angle) * speed
          ),
          life: 0,
          maxLife: 0.65 + Math.random() * 0.2
        });
      }
    });
  }, [wateredTileAnimations, tiles]);

  // ── TOUCH & MOUSE INTERACTION CONTROLLERS (ORBIT 360 + RAYCAST TAP) ──
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (isWaterDragging) return;

    const container = mountRef.current;
    const camera = cameraRef.current;
    if (container && camera && decorationsGroupRef.current) {
      const rect = container.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);
      const decorationHits = raycaster.intersectObject(decorationsGroupRef.current, true);
      const decorationId = decorationHits[0]?.object.userData.decorationId as string | undefined;
      const root = decorationId ? decorationRootsRef.current.get(decorationId) : null;
      if (decorationId && root) {
        activeDecorationDragRef.current = {
          id: decorationId,
          moved: false,
          startX: root.position.x,
          startZ: root.position.z,
        };
        orbitState.current.isDragging = false;
        orbitState.current.prevPointerX = e.clientX;
        orbitState.current.prevPointerY = e.clientY;
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
      }
    }

    orbitState.current.isDragging = true;
    orbitState.current.prevPointerX = e.clientX;
    orbitState.current.prevPointerY = e.clientY;
    orbitState.current.dragDistance = 0;
    orbitState.current.pointerDownTime = performance.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    const state = orbitState.current;
    const container = mountRef.current;
    if (!container) return;

    const decorationDrag = activeDecorationDragRef.current;
    if (decorationDrag && cameraRef.current && decorationsGroupRef.current && islandGroupRef.current) {
      const rect = container.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, cameraRef.current);
      const worldPlane = new THREE.Plane(
        new THREE.Vector3(0, 1, 0),
        -(islandGroupRef.current.position.y + TILE_Y - 0.04)
      );
      const worldPoint = raycaster.ray.intersectPlane(worldPlane, new THREE.Vector3());
      const root = decorationRootsRef.current.get(decorationDrag.id);
      if (worldPoint && root) {
        const localPoint = decorationsGroupRef.current.worldToLocal(worldPoint);
        root.position.x = THREE.MathUtils.clamp(localPoint.x, -5.15, 5.15);
        root.position.z = THREE.MathUtils.clamp(localPoint.z, -5.15, 5.15);
        if (Math.hypot(root.position.x - decorationDrag.startX, root.position.z - decorationDrag.startZ) > 0.12) {
          decorationDrag.moved = true;
        }
      }
      return;
    }

    if (state.isDragging) {
      const dx = e.clientX - state.prevPointerX;
      const dy = e.clientY - state.prevPointerY;
      state.dragDistance += Math.abs(dx) + Math.abs(dy);

      // Rotate Yaw horizontally (360 degrees full orbit)
      state.targetYaw += dx * 0.007;

      // Adjust Pitch vertically (clamped between top-down 78 deg and low diorama 22 deg)
      state.targetPitch = Math.max(0.28, Math.min(1.25, state.targetPitch + dy * 0.005));

      state.prevPointerX = e.clientX;
      state.prevPointerY = e.clientY;
    } else if (onTileHover && cameraRef.current) {
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const meshes = Array.from(tileMeshesMapRef.current.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0 && intersects[0].object.userData.tileId !== undefined) {
        onTileHover(intersects[0].object.userData.tileId);
      } else {
        onTileHover(null);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const state = orbitState.current;
    const container = mountRef.current;
    state.isDragging = false;

    const decorationDrag = activeDecorationDragRef.current;
    if (decorationDrag) {
      const root = decorationRootsRef.current.get(decorationDrag.id);
      const decoration = decorations.find(item => item.id === decorationDrag.id);
      activeDecorationDragRef.current = null;
      if (root && decorationDrag.moved) {
        onDecorationMove?.(
          decorationDrag.id,
          Math.round((root.position.x / 10.96 + 0.5) * 410),
          Math.round((root.position.z / 10.96 + 0.5) * 410)
        );
      } else if (decoration) {
        onDecorationClick?.(decoration);
      }
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      return;
    }

    // Check if this was a TAP/CLICK (dragDistance < 8px)
    if (state.dragDistance < 8 && container && cameraRef.current) {
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((state.prevPointerX - rect.left) / rect.width) * 2 - 1,
        -((state.prevPointerY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const interactiveObjects = [
        ...Array.from(tileMeshesMapRef.current.values()),
        ...Array.from(tileSpritesMapRef.current.values())
      ];
      const intersects = raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        const clickedTile = intersects[0].object.userData.tile as GardenTile;
        if (clickedTile) {
          onTileClick(clickedTile);
        }
      }
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // The watering tool starts pointer capture outside the canvas, so keep resolving its target globally.
  useEffect(() => {
    if (!isWaterDragging || !onTileHover) return;
    const updateWaterTarget = (event: PointerEvent) => {
      const container = mountRef.current;
      const camera = cameraRef.current;
      if (!container || !camera) return;
      const rect = container.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        onTileHover(null);
        return;
      }
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(Array.from(tileMeshesMapRef.current.values()), false)[0];
      onTileHover(hit?.object.userData.tileId ?? null);
    };
    window.addEventListener('pointermove', updateWaterTarget, { passive: true });
    return () => window.removeEventListener('pointermove', updateWaterTarget);
  }, [isWaterDragging, onTileHover]);

  // Zoom with Mouse Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const state = orbitState.current;
    const delta = e.deltaY * 0.015;
    state.targetRadius = Math.max(cameraFitRadiusRef.current * 0.88, Math.min(state.maxRadius, state.targetRadius + delta));
  };

  // Preset Views & Reset Camera
  const handleResetCamera = () => {
    const state = orbitState.current;
    state.targetYaw = Math.PI / 4;
    state.targetPitch = 0.68;
    state.targetRadius = 18.0;
    setCurrentViewMode('diorama');
  };

  const handleToggleTopView = () => {
    const state = orbitState.current;
    if (currentViewMode === 'diorama') {
      state.targetPitch = 0.32; // Top-Down view from high above
      state.targetRadius = 19.5;
      setCurrentViewMode('top');
    } else {
      state.targetPitch = 0.68; // Classic 45 deg diorama view
      state.targetRadius = 18.0;
      setCurrentViewMode('diorama');
    }
  };

  const handleZoomIn = () => {
    const state = orbitState.current;
    state.targetRadius = Math.max(cameraFitRadiusRef.current * 0.88, state.targetRadius - 2.5);
  };

  const handleZoomOut = () => {
    const state = orbitState.current;
    state.targetRadius = Math.min(state.maxRadius, state.targetRadius + 2.5);
  };

  return (
    <div className="three-garden-viewport-wrapper select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="three-canvas-root"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { orbitState.current.isDragging = false; activeDecorationDragRef.current = null; }}
        onPointerLeave={() => { if (!isWaterDragging) onTileHover?.(null); }}
        onWheel={handleWheel}
        aria-label="3D Orbital Garden Island Canvas"
      />

      {/* ── 3D CAMERA FLOATING CONTROLLER HUD ── */}
      <div className="three-orbit-controls-hud">
        {/* 360 Auto-Rotate Toggle */}
        <button
          type="button"
          className={`three-hud-btn ${isAutoRotate ? 'active' : ''}`}
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          title={isAutoRotate ? 'Jeda Putar Otomatis' : 'Putar 360° Otomatis'}
        >
          <RotateCw size={14} className={isAutoRotate ? 'animate-spin' : ''} />
          <span>Auto-360°</span>
        </button>

        {/* Top-Down vs Diorama Angle Toggle */}
        <button
          type="button"
          className={`three-hud-btn ${currentViewMode === 'top' ? 'active' : ''}`}
          onClick={handleToggleTopView}
          title="Ganti Sudut Pandang Atas / Diorama"
        >
          <Eye size={14} />
          <span>{currentViewMode === 'top' ? 'Sudut Atas' : 'Diorama'}</span>
        </button>

        {/* Zoom In & Out */}
        <button
          type="button"
          className="three-hud-btn"
          onClick={handleZoomIn}
          title="Zoom Dekat"
        >
          <ZoomIn size={14} />
        </button>
        <button
          type="button"
          className="three-hud-btn"
          onClick={handleZoomOut}
          title="Zoom Jauh"
        >
          <ZoomOut size={14} />
        </button>

        {/* Reset Camera to Default Front Angle */}
        <button
          type="button"
          className="three-hud-btn"
          onClick={handleResetCamera}
          title="Reset Posisi Kamera"
        >
          <Compass size={14} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Floating Orbital Hint */}
      <div className="three-orbit-hint">
        <Sparkles size={13} className="text-amber-300 animate-pulse" />
        <span>Geser / Drag layar untuk memutar pulau 360°</span>
      </div>
    </div>
  );
}
