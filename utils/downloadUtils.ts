import { RefObject } from 'react';
import { ExportResolution, DesignState } from '@/types/design';
import { preloadFlowers, preloadImage } from '@/utils/canvasUtils';

export async function downloadDesign(
  canvasRef?: RefObject<HTMLCanvasElement | null> | null,
  format: 'png' | 'jpg' = 'png',
  resolution: ExportResolution = '4k',
  design?: DesignState,
): Promise<boolean> {
  // If design state is provided, ensure all flower assets are fully preloaded in cache before capture
  if (design) {
    try {
      const tasks: Promise<any>[] = [preloadFlowers(design.selectedFlowers, design.bucketSize)];
      if (design.bgTheme === 'custom' && design.customBgImage) {
        tasks.push(preloadImage(design.customBgImage));
      }
      await Promise.all(tasks);
    } catch {
      // Proceed with capture
    }
  }

  const canvas =
    canvasRef?.current ||
    (typeof document !== 'undefined'
      ? (document.querySelector('canvas.preview-canvas') as HTMLCanvasElement) ||
        (document.querySelector('canvas') as HTMLCanvasElement)
      : null);

  if (!canvas) return false;

  // Skala resolusi: 4K Ultra = 3.5x, 2K Super = 2x, Native HD = 1x
  const scale = resolution === '4k' ? 3.5 : resolution === '2k' ? 2 : 1;
  const targetW = Math.round(canvas.width * scale);
  const targetH = Math.round(canvas.height * scale);

  const offscreen = document.createElement('canvas');
  offscreen.width = targetW;
  offscreen.height = targetH;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return false;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Perbaikan BUG JPEG: Jika format JPG, isi latar belakang putih bersih agar tidak hitam pekat
  if (format === 'jpg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  // Render kanvas ke resolusi ultra jernih tanpa cacat
  ctx.drawImage(canvas, 0, 0, targetW, targetH);

  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const dataUrl = offscreen.toDataURL(mimeType, format === 'jpg' ? 0.98 : undefined);

  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
  const filename = `laysa_bouquet_${resolution.toUpperCase()}_${timestamp}.${format}`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  if (link.parentNode === document.body) {
    document.body.removeChild(link);
  }
  return true;
}
