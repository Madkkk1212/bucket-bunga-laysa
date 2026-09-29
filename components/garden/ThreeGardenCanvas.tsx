'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
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
}

// Spacing between 5x5 tiles in Three.js world units
const GRID_SPACING = 2.15;
const TILE_Y = 0.24;

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
  isWaterDragging = false
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

    // Guaranteed minimum viewport dimensions
    const width = Math.max(container.clientWidth || 800, 400);
    const height = Math.max(container.clientHeight || 540, 460);

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera (Perspective)
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.5, 100);
    cameraRef.current = camera;

    // 3. Renderer (High DPI, tone mapped)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear any previous canvas element
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Cinematic Pastel Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xbae6fd, 0xdcfce7, 0.65);
    scene.add(hemisphereLight);

    // Warm Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    sunLight.position.set(14, 22, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Subtle Fill Light from opposite side
    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.45);
    fillLight.position.set(-14, 12, -14);
    scene.add(fillLight);

    // ── 5. FLOATING DIORAMA ISLAND ASSEMBLY ──
    const islandGroup = new THREE.Group();
    islandGroupRef.current = islandGroup;
    scene.add(islandGroup);

    // A. Top Lush Green Grass Surface (Cylinder)
    const grassGeo = new THREE.CylinderGeometry(7.0, 7.0, 0.48, 54);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x68bf2b,
      roughness: 0.65,
      metalness: 0.05
    });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.position.y = 0;
    grassMesh.receiveShadow = true;
    islandGroup.add(grassMesh);

    // B. Grass Rim Accent Ring
    const rimGeo = new THREE.TorusGeometry(7.02, 0.08, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x8be045,
      roughness: 0.5
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.24;
    islandGroup.add(rimMesh);

    // C. Underground Tiered Brown Dirt Cliff (3D Depth)
    const cliffGeo = new THREE.CylinderGeometry(6.8, 5.0, 2.5, 54);
    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0x543116,
      roughness: 0.9,
      metalness: 0.02
    });
    const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
    cliffMesh.position.y = -1.45;
    cliffMesh.castShadow = true;
    cliffMesh.receiveShadow = true;
    islandGroup.add(cliffMesh);

    // D. Rocky Bottom Tip
    const rockGeo = new THREE.CylinderGeometry(5.0, 3.8, 1.1, 48);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x3d210b,
      roughness: 0.95
    });
    const rockMesh = new THREE.Mesh(rockGeo, rockMat);
    rockMesh.position.y = -3.05;
    islandGroup.add(rockMesh);

    // E. Floating Clean White Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(4.8, 4.4, 0.35, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.y = -3.75;
    pedestalMesh.castShadow = true;
    islandGroup.add(pedestalMesh);

    // ── 6. 5x5 TILES GROUP ──
    const tilesGroup = new THREE.Group();
    tilesGroupRef.current = tilesGroup;
    islandGroup.add(tilesGroup);

    // Camera Positioning Function
    const updateCameraPos = () => {
      const { radius, yaw, pitch } = orbitState.current;
      const x = radius * Math.sin(pitch) * Math.sin(yaw);
      const y = radius * Math.cos(pitch);
      const z = radius * Math.sin(pitch) * Math.cos(yaw);
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
      const w = Math.max(container.clientWidth || 800, 400);
      const h = Math.max(container.clientHeight || 540, 460);
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

    const soilGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.04, 32);
    const ringGeo = new THREE.TorusGeometry(0.92, 0.04, 16, 32);

    tiles.forEach((tile) => {
      const colX = (tile.col - 2) * GRID_SPACING;
      const rowZ = (tile.row - 2) * GRID_SPACING;

      const isSelected = targetTileId === tile.id;
      const isHovered = activeHoverTileId === tile.id;
      const isWatered = Boolean(tile.wateredToday);

      // Soil disk mesh
      const soilMat = new THREE.MeshStandardMaterial({
        color: isWatered ? 0x221207 : 0x3d220f,
        roughness: isWatered ? 0.35 : 0.85,
        metalness: isWatered ? 0.15 : 0.02
      });
      const soilMesh = new THREE.Mesh(soilGeo, soilMat);
      soilMesh.position.set(colX, TILE_Y, rowZ);
      soilMesh.receiveShadow = true;
      soilMesh.userData = { tileId: tile.id, tile };
      tilesGroup.add(soilMesh);
      tileMeshesMapRef.current.set(tile.id, soilMesh);

      // Glowing / Dashed Border Ring
      let ringColor = 0xa3e635;
      let ringOpacity = 0.45;
      if (isSelected) {
        ringColor = 0xfbbf24;
        ringOpacity = 1.0;
      } else if (isHovered) {
        ringColor = 0x38bdf8;
        ringOpacity = 0.95;
      }

      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: ringOpacity
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(colX, TILE_Y + 0.025, rowZ);
      tilesGroup.add(ringMesh);

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
        const scaleW = stage === 1 ? 1.6 : stage === 2 ? 1.85 : stage === 4 ? 2.4 : 2.15;
        const scaleH = scaleW;
        sprite.scale.set(scaleW, scaleH, 1);

        // Position bottom base directly at the center of the tile soil
        sprite.position.set(colX, TILE_Y + 0.02, rowZ);
        sprite.userData = { tileId: tile.id, tile };
        tilesGroup.add(sprite);
        tileSpritesMapRef.current.set(tile.id, sprite);

      } else {
        // EMPTY TILE: Floating subtle "+" marker
        const emptyCanvas = document.createElement('canvas');
        emptyCanvas.width = 128;
        emptyCanvas.height = 128;
        const eCtx = emptyCanvas.getContext('2d');
        if (eCtx) {
          eCtx.clearRect(0, 0, 128, 128);
          eCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          eCtx.beginPath();
          eCtx.arc(64, 64, 46, 0, Math.PI * 2);
          eCtx.fill();

          eCtx.fillStyle = '#ffffff';
          eCtx.font = 'bold 54px Fredoka, sans-serif';
          eCtx.textAlign = 'center';
          eCtx.textBaseline = 'middle';
          eCtx.fillText('+', 64, 66);
        }
        const emptyTex = new THREE.CanvasTexture(emptyCanvas);
        const emptyMat = new THREE.SpriteMaterial({
          map: emptyTex,
          transparent: true,
          opacity: isHovered ? 0.95 : 0.55
        });
        const emptySprite = new THREE.Sprite(emptyMat);
        emptySprite.center.set(0.5, 0.5);
        emptySprite.scale.set(0.9, 0.9, 1);
        emptySprite.position.set(colX, TILE_Y + 0.45, rowZ);
        tilesGroup.add(emptySprite);
      }
    });
  }, [tiles, targetTileId, activeHoverTileId, generateSpriteTexture]);

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
    if (isWaterDragging) return;

    orbitState.current.isDragging = true;
    orbitState.current.prevPointerX = e.clientX;
    orbitState.current.prevPointerY = e.clientY;
    orbitState.current.dragDistance = 0;
    orbitState.current.pointerDownTime = performance.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = orbitState.current;
    const container = mountRef.current;
    if (!container) return;

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

  const handlePointerUp = () => {
    const state = orbitState.current;
    const container = mountRef.current;
    state.isDragging = false;

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
  };

  // Zoom with Mouse Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const state = orbitState.current;
    const delta = e.deltaY * 0.015;
    state.targetRadius = Math.max(state.minRadius, Math.min(state.maxRadius, state.targetRadius + delta));
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
    state.targetRadius = Math.max(state.minRadius, state.targetRadius - 2.5);
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
        onPointerCancel={() => { orbitState.current.isDragging = false; }}
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
