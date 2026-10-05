'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Flower2, Plus } from 'lucide-react';
import type { GardenTile } from './IsometricGardenView';
import type { GardenWorldLayout } from './worldLayoutTypes';

interface GardenWorldFrameProps {
  tiles: GardenTile[];
  gardenSize: number;
  fieldSize: number;
  worldLayout: GardenWorldLayout;
  worldLayoutRevision: number;
  worldSaveStatus: 'loading' | 'saving' | 'saved' | 'device' | 'error';
  worldSaveError: string;
  wateredTileAnimations: Set<number>;
  isWaterDragging: boolean;
  onTileClick: (tile: GardenTile) => void;
  onTileHover: (tileId: number | null) => void;
  onWorldLayoutChange: (layout: GardenWorldLayout) => void;
}

export default function GardenWorldFrame({
  tiles,
  gardenSize,
  fieldSize,
  worldLayout,
  worldLayoutRevision,
  worldSaveStatus,
  worldSaveError,
  wateredTileAnimations,
  isWaterDragging,
  onTileClick,
  onTileHover,
  onWorldLayoutChange,
}: GardenWorldFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const mountedDocumentRef = useRef<Document | null>(null);
  const runtimePromiseRef = useRef<Promise<typeof import('./GardenWorldRuntime')> | null>(null);
  const latestGardenStateRef = useRef({ tiles, wateredTileAnimations, gardenSize, fieldSize, worldLayout });
  const [frameReady, setFrameReady] = useState(false);
  const [frameError, setFrameError] = useState<string | null>(null);
  const firstEmptyTile = tiles.find((tile) => !tile.planted);

  useEffect(() => {
    latestGardenStateRef.current = { tiles, wateredTileAnimations, gardenSize, fieldSize, worldLayout };
  }, [tiles, wateredTileAnimations, gardenSize, fieldSize, worldLayout]);

  // Start downloading/parsing the 3D runtime while the lightweight iframe HTML
  // is still loading, instead of making those two requests a waterfall.
  useEffect(() => {
    const pendingRuntime = import('./GardenWorldRuntime');
    runtimePromiseRef.current = pendingRuntime;
    void pendingRuntime.catch(() => {
      if (runtimePromiseRef.current === pendingRuntime) runtimePromiseRef.current = null;
    });
  }, []);

  const initializeGardenWorld = useCallback(async () => {
    const targetWindow = frameRef.current?.contentWindow;
    const targetDocument = targetWindow?.document;
    if (!targetWindow || !targetDocument?.getElementById('panel') || mountedDocumentRef.current === targetDocument) return;
    mountedDocumentRef.current = targetDocument;
    setFrameError(null);
    setFrameReady(false);

    try {
      const runtime = await (runtimePromiseRef.current ??= import('./GardenWorldRuntime'));
      runtime.mountGardenWorld(targetWindow);
      const latest = latestGardenStateRef.current;
      targetWindow.postMessage({
        source: 'bucket-garden-app',
        type: 'garden-state',
        gardenSize: latest.gardenSize,
        fieldSize: latest.fieldSize,
        tiles: latest.tiles,
        wateredTileAnimations: Array.from(latest.wateredTileAnimations),
      }, window.location.origin);
      targetWindow.postMessage({
        source: 'bucket-garden-app',
        type: 'world-layout',
        layout: latest.worldLayout,
      }, window.location.origin);
      // Reveal the world after it has received both garden data and saved city
      // layout, then rendered a real scene frame (not just the blue sky).
    } catch (error) {
      mountedDocumentRef.current = null;
      setFrameError(error instanceof Error ? error.message : 'Scene 3D tidak berhasil dimuat.');
    }
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const handleLoad = () => { void initializeGardenWorld(); };
    frame.addEventListener('load', handleLoad);
    if (frame.contentDocument?.readyState === 'complete' && frame.contentDocument.getElementById('panel')) {
      handleLoad();
    }
    return () => frame.removeEventListener('load', handleLoad);
  }, [initializeGardenWorld]);

  const sendGardenState = useCallback(() => {
    if (!frameReady || !frameRef.current?.contentWindow) return;
    frameRef.current.contentWindow.postMessage({
      source: 'bucket-garden-app',
      type: 'garden-state',
      gardenSize,
      fieldSize,
      tiles,
      wateredTileAnimations: Array.from(wateredTileAnimations),
    }, window.location.origin);
  }, [frameReady, gardenSize, fieldSize, tiles, wateredTileAnimations]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // The iframe can be remounted by the world route while Next refreshes
      // the client tree. In that case event.source may be an older WindowProxy
      // even though the event is still same-origin and carries our namespace.
      // Verify both the origin and app-specific source tag below instead.
      if (event.origin !== window.location.origin) return;
      const message = event.data as { source?: string; type?: string; message?: string; tileId?: number | null; layout?: GardenWorldLayout };
      if (message?.source !== 'bucket-garden-world') return;

      if (message.type === 'scene-error') {
        setFrameError(message.message || 'Scene 3D tidak berhasil dimuat.');
      } else if (message.type === 'scene-first-frame') {
        setFrameReady(true);
        setFrameError(null);
      } else if (message.type === 'plot-click' && typeof message.tileId === 'number') {
        const tile = tiles.find(candidate => candidate.id === message.tileId);
        if (tile) onTileClick(tile);
        else setFrameError(`Petak ${message.tileId + 1} belum tersambung ke data bunga. Muat ulang halaman kebun.`);
      } else if (message.type === 'plot-hover') {
        onTileHover(typeof message.tileId === 'number' ? message.tileId : null);
      } else if (message.type === 'world-layout-change' && message.layout) {
        onWorldLayoutChange(message.layout);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onTileClick, onTileHover, onWorldLayoutChange, tiles]);

  useEffect(() => {
    sendGardenState();
  }, [sendGardenState]);

  useEffect(() => {
    if (!frameReady || worldLayoutRevision < 1 || !frameRef.current?.contentWindow) return;
    frameRef.current.contentWindow.postMessage({
      source: 'bucket-garden-app',
      type: 'world-layout',
      layout: latestGardenStateRef.current.worldLayout,
    }, window.location.origin);
  }, [frameReady, worldLayoutRevision]);

  useEffect(() => {
    if (!frameReady || !frameRef.current?.contentWindow) return;
    if (!isWaterDragging) {
      onTileHover(null);
      return;
    }

    const relayWaterPointer = (event: PointerEvent) => {
      const frame = frameRef.current;
      if (!frame?.contentWindow) return;
      const rect = frame.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      frame.contentWindow.postMessage({
        source: 'bucket-garden-app',
        type: 'water-pointer',
        inside,
        x: inside ? ((event.clientX - rect.left) / rect.width) * 2 - 1 : 0,
        y: inside ? -((event.clientY - rect.top) / rect.height) * 2 + 1 : 0,
      }, window.location.origin);
    };

    window.addEventListener('pointermove', relayWaterPointer, { passive: true });
    return () => window.removeEventListener('pointermove', relayWaterPointer);
  }, [frameReady, isWaterDragging, onTileHover]);

  return (
    <div className="garden-world-frame-shell" aria-busy={!frameReady}>
      <iframe
        ref={frameRef}
        className={`garden-world-frame ${frameReady ? 'is-ready' : ''}`}
        src="/garden-world?embed=app&v=15"
        title="Kebun bunga 3D interaktif"
        allow="fullscreen"
      />
      {!frameReady && !frameError && (
        <div className="garden-world-loading-overlay" role="status" aria-live="polite">
          <div className="garden-world-loading-card">
            <span className="garden-world-loading-spinner" aria-hidden="true" />
            <strong>Merakit kebun 3D…</strong>
            <span>Menata petak, bunga, dan dekorasi tersimpan.</span>
          </div>
        </div>
      )}
      <div className="garden-plot-status" aria-live="polite">
        <span className="garden-plot-status-title"><Flower2 size={15} aria-hidden="true" /><strong>Taman Bunga</strong></span>
        <button
          type="button"
          className="garden-plot-add-button"
          disabled={!frameReady || !firstEmptyTile}
          onClick={() => firstEmptyTile && onTileClick(firstEmptyTile)}
          aria-label={firstEmptyTile ? 'Tambah bunga ke petak kosong' : 'Semua petak taman bunga sudah terisi'}
          title={firstEmptyTile ? 'Pilih bunga untuk ditanam' : 'Taman bunga sudah penuh'}
        >
          <Plus size={16} aria-hidden="true" />
          <span>{firstEmptyTile ? 'Tambah bunga' : 'Taman penuh'}</span>
        </button>
        <span>Bidang {fieldSize} × {fieldSize}</span>
        <span>{gardenSize} × {gardenSize} petak</span>
        <span>{tiles.filter((tile) => tile.planted && !tile.isOrnament).length}/{tiles.length} bunga</span>
        <span className={`garden-world-save-status save-${worldSaveStatus}`} role="status">
          {worldSaveStatus === 'saving' ? 'Menyimpan…' : worldSaveStatus === 'saved' ? 'Tersinkron' : worldSaveStatus === 'device' ? 'Tersimpan di perangkat' : worldSaveStatus === 'error' ? 'Gagal sinkron' : 'Memuat…'}
        </span>
      </div>
      {worldSaveStatus === 'error' && worldSaveError && (
        <div className="garden-world-save-warning" role="alert">
          {worldSaveError}
        </div>
      )}
      {frameError && (
        <div className="garden-world-frame-error" role="alert">
          Scene taman 3D tidak berhasil dimuat: {frameError}
        </div>
      )}
    </div>
  );
}
