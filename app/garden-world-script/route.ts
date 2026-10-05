import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const sourcePath = path.join(process.cwd(), 'public', 'garden-world.html');
  const source = await readFile(sourcePath, 'utf8');
  const match = source.match(/<script type="module">([\s\S]*?)<\/script>/i);

  if (!match) return new Response('Garden world script is missing.', { status: 404 });

  const script = match[1]
    .replace("from 'three';", "from '/vendor/three.module.js';")
    .replace("from 'three/addons/controls/OrbitControls.js';", "from '/vendor/OrbitControls.js';");

  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
