import { RefObject } from 'react';

export async function downloadDesign(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  format: 'png' | 'jpg',
): Promise<void> {
  const canvas = canvasRef.current;
  if (!canvas) return;

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
}
