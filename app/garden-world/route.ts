import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const sourcePath = path.join(process.cwd(), 'public', 'garden-world.html');
  const source = await readFile(sourcePath, 'utf8');
  const html = source
    .replace(/<script type="importmap">[\s\S]*?<\/script>\s*/i, '')
    .replace(/<script>\s*const sendSceneFailure[\s\S]*?<\/script>\s*/i, '')
    .replace(/<script type="module">[\s\S]*?<\/script>/i, '');

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
