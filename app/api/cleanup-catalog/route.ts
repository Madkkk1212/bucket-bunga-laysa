import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const genDir = path.join(process.cwd(), 'app', 'api', 'generate-100-catalog');
    if (fs.existsSync(genDir)) {
      fs.rmSync(genDir, { recursive: true, force: true });
    }
    const selfDir = path.join(process.cwd(), 'app', 'api', 'cleanup-catalog');
    setTimeout(() => {
      if (fs.existsSync(selfDir)) {
        fs.rmSync(selfDir, { recursive: true, force: true });
      }
    }, 100);
    return NextResponse.json({ success: true, message: 'cleaned up' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
