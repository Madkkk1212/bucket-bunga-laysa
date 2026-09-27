import { RefObject } from 'react';

export async function downloadDesign(
  canvasRef?: RefObject<HTMLCanvasElement | null> | null,
  format: 'png' | 'jpg' = 'png',
): Promise<boolean> {
  const canvas =
    canvasRef?.current ||
    (typeof document !== 'undefined'
      ? (document.querySelector('canvas.preview-canvas') as HTMLCanvasElement) ||
        (document.querySelector('canvas') as HTMLCanvasElement)
      : null);

  if (!canvas) return false;

  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const dataUrl = canvas.toDataURL(mimeType, 0.95);

  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
  const filename = `bucketbunga_design_${timestamp}.${format}`;

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
