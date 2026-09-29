import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'public', 'images', 'garden');

function makeSvg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140" fill="none">
  <defs>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.25"/>
    </filter>
    <radialGradient id="soilGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#45270e" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#2c1808" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Soil Mound Base -->
  <ellipse cx="60" cy="132" rx="22" ry="6" fill="url(#soilGlow)" />
  ${content}
</svg>`;
}

// 1. Rose generator
function generateRose(key, cDark, cMid, cLight, leafColor = '#15803d') {
  return makeSvg(`
    <!-- Stem & Leaves -->
    <path d="M60 130 Q58 105 60 76" stroke="#166534" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M60 112 Q44 110 38 98 Q48 94 60 106" fill="${leafColor}" stroke="#14532d" stroke-width="1.2"/>
    <path d="M60 96 Q76 94 82 82 Q72 80 60 92" fill="${leafColor}" stroke="#14532d" stroke-width="1.2"/>
    <path d="M60 120 Q74 122 78 114 Q70 110 60 116" fill="${leafColor}" stroke="#14532d" stroke-width="1"/>
    <!-- Thorns -->
    <path d="M58 118 L54 116 L58 114 Z" fill="#14532d"/>
    <path d="M62 102 L66 100 L62 98 Z" fill="#14532d"/>
    <!-- Calyx -->
    <path d="M52 74 Q60 82 68 74 L60 66 Z" fill="#15803d"/>
    <!-- Rose Bloom (Layered Petals) -->
    <g filter="url(#softShadow)">
      <!-- Outer Petals -->
      <circle cx="60" cy="56" r="28" fill="${cDark}"/>
      <path d="M38 52 C34 38 52 32 60 40 C68 32 86 38 82 52 C84 66 68 74 60 72 C52 74 36 66 38 52 Z" fill="${cMid}"/>
      <path d="M44 58 C40 46 54 40 60 44 C66 40 80 46 76 58 C74 68 64 70 60 68 C56 70 46 68 44 58 Z" fill="${cDark}"/>
      <!-- Mid swirl -->
      <path d="M48 52 C46 44 56 40 60 44 C64 40 74 44 72 52 C72 60 64 62 60 62 C56 62 48 60 48 52 Z" fill="${cLight}"/>
      <!-- Inner rosette -->
      <ellipse cx="60" cy="52" rx="9" ry="7" fill="${cMid}"/>
      <path d="M54 50 Q60 44 66 50 Q60 56 54 50" fill="${cLight}"/>
      <circle cx="60" cy="51" r="3.5" fill="#fef08a" opacity="0.8"/>
    </g>
  `);
}

// 2. Tulip generator
function generateTulip(key, cDark, cMid, cLight) {
  return makeSvg(`
    <!-- Upright Broad Leaves -->
    <path d="M58 130 Q36 100 42 65 Q50 90 58 115" fill="#15803d" stroke="#166534" stroke-width="1.5"/>
    <path d="M62 130 Q84 95 78 60 Q70 88 62 115" fill="#16a34a" stroke="#166534" stroke-width="1.5"/>
    <!-- Stem -->
    <path d="M60 130 Q60 100 60 68" stroke="#16a34a" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Tulip Cup -->
    <g filter="url(#softShadow)">
      <!-- Back Petals -->
      <ellipse cx="60" cy="48" rx="18" ry="24" fill="${cDark}"/>
      <!-- Left Petal -->
      <path d="M60 68 C42 66 40 40 50 32 C58 42 60 55 60 68 Z" fill="${cMid}"/>
      <!-- Right Petal -->
      <path d="M60 68 C78 66 80 40 70 32 C62 42 60 55 60 68 Z" fill="${cMid}"/>
      <!-- Center Front Petal -->
      <path d="M60 70 C48 68 46 44 60 30 C74 44 72 68 60 70 Z" fill="${cLight}"/>
      <!-- Highlight rim -->
      <path d="M54 36 Q60 30 66 36" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    </g>
  `);
}

// 3. Sunflower generator
function generateSunflower() {
  const petals = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i * 360) / 16;
    petals.push(`<ellipse cx="60" cy="28" rx="5.5" ry="17" fill="#fbbf24" stroke="#d97706" stroke-width="1" transform="rotate(${angle} 60 56)"/>`);
  }
  return makeSvg(`
    <!-- Stem & Leaves -->
    <path d="M60 130 Q58 100 60 62" stroke="#15803d" stroke-width="6" stroke-linecap="round"/>
    <path d="M58 114 Q32 116 26 98 Q46 94 58 106" fill="#16a34a" stroke="#14532d" stroke-width="1.5"/>
    <path d="M62 98 Q88 100 94 82 Q74 78 62 92" fill="#15803d" stroke="#14532d" stroke-width="1.5"/>
    <!-- Flower Rays -->
    <g filter="url(#softShadow)">
      ${petals.join('\n')}
      <!-- Center Seed Disk -->
      <circle cx="60" cy="56" r="16" fill="#78350f" stroke="#451a03" stroke-width="2"/>
      <circle cx="60" cy="56" r="13" fill="#92400e"/>
      <circle cx="60" cy="56" r="10" fill="#b45309" stroke="#78350f" stroke-dasharray="2 2"/>
      <circle cx="60" cy="56" r="6" fill="#78350f"/>
    </g>
  `);
}

// 4. Orchid generator
function generateOrchid(key, cDark, cMid, cLight) {
  return makeSvg(`
    <!-- Thick Basal Leaves -->
    <path d="M60 130 Q30 132 25 120 Q42 114 60 126" fill="#166534" stroke="#14532d" stroke-width="1.5"/>
    <path d="M60 130 Q90 132 95 120 Q78 114 60 126" fill="#15803d" stroke="#14532d" stroke-width="1.5"/>
    <!-- Graceful Arching Stem -->
    <path d="M60 128 Q62 95 56 68 Q52 48 64 36" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
    <!-- Little buds on tip -->
    <circle cx="64" cy="36" r="3.5" fill="#86efac"/>
    <circle cx="58" cy="44" r="4" fill="#a7f3d0"/>
    <!-- Main Blossom -->
    <g filter="url(#softShadow)">
      <!-- Back Sepals -->
      <ellipse cx="58" cy="62" rx="18" ry="8" fill="${cMid}" transform="rotate(30 58 62)"/>
      <ellipse cx="58" cy="62" rx="18" ry="8" fill="${cMid}" transform="rotate(-30 58 62)"/>
      <ellipse cx="58" cy="50" rx="8" ry="16" fill="${cLight}"/>
      <!-- Front Wings -->
      <ellipse cx="44" cy="64" rx="14" ry="12" fill="${cLight}"/>
      <ellipse cx="72" cy="64" rx="14" ry="12" fill="${cLight}"/>
      <!-- Exotic Center Lip -->
      <path d="M52 68 Q58 80 64 68 Q58 62 52 68 Z" fill="${cDark}"/>
      <circle cx="58" cy="66" r="3.5" fill="#facc15"/>
    </g>
  `);
}

// 5. Lily generator
function generateLily(key, cDark, cMid, cLight, spotColor = null) {
  const spots = spotColor ? `
    <circle cx="56" cy="56" r="1" fill="${spotColor}"/>
    <circle cx="64" cy="56" r="1" fill="${spotColor}"/>
    <circle cx="58" cy="50" r="1" fill="${spotColor}"/>
    <circle cx="62" cy="62" r="1" fill="${spotColor}"/>
    <circle cx="52" cy="60" r="1" fill="${spotColor}"/>
    <circle cx="68" cy="60" r="1" fill="${spotColor}"/>
  ` : '';

  return makeSvg(`
    <!-- Stem and Linear Leaves -->
    <path d="M60 130 Q60 95 60 65" stroke="#15803d" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M60 115 Q38 116 32 108 Q48 106 60 112" fill="#16a34a" stroke="#14532d" stroke-width="1.2"/>
    <path d="M60 100 Q82 101 88 93 Q72 91 60 97" fill="#16a34a" stroke="#14532d" stroke-width="1.2"/>
    <!-- Lily 6 Flared Petals -->
    <g filter="url(#softShadow)">
      <!-- Back Petals -->
      <path d="M60 58 Q34 42 30 26 Q46 38 60 58" fill="${cDark}"/>
      <path d="M60 58 Q86 42 90 26 Q74 38 60 58" fill="${cDark}"/>
      <path d="M60 58 Q60 25 60 18 Q60 35 60 58" fill="${cMid}"/>
      <!-- Front Petals -->
      <path d="M60 58 Q32 68 24 78 Q44 72 60 58" fill="${cMid}"/>
      <path d="M60 58 Q88 68 96 78 Q76 72 60 58" fill="${cMid}"/>
      <path d="M60 58 Q60 88 60 92 Q60 76 60 58" fill="${cLight}"/>
      <!-- Petal midrib glow -->
      <path d="M60 20 L60 58" stroke="#86efac" stroke-width="1.5" opacity="0.7"/>
      <!-- Spots -->
      ${spots}
      <!-- Pistil & Stamens -->
      <circle cx="60" cy="58" r="4" fill="#facc15"/>
      <path d="M60 58 L54 48 M60 58 L66 48 M60 58 L60 46" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="54" cy="48" r="1.5" fill="#78350f"/>
      <circle cx="66" cy="48" r="1.5" fill="#78350f"/>
      <circle cx="60" cy="46" r="1.5" fill="#78350f"/>
    </g>
  `);
}

// 6. Hydrangea generator
function generateHydrangea(key, cDark, cMid, cLight) {
  const florets = [
    { x: 44, y: 44 }, { x: 60, y: 38 }, { x: 76, y: 44 },
    { x: 34, y: 56 }, { x: 50, y: 52 }, { x: 66, y: 52 }, { x: 86, y: 56 },
    { x: 40, y: 68 }, { x: 56, y: 66 }, { x: 74, y: 68 },
    { x: 60, y: 80 }
  ];

  const floretSvgs = florets.map(f => `
    <g transform="translate(${f.x}, ${f.y})">
      <ellipse cx="0" cy="-6" rx="4" ry="5" fill="${cLight}"/>
      <ellipse cx="-6" cy="0" rx="5" ry="4" fill="${cMid}"/>
      <ellipse cx="6" cy="0" rx="5" ry="4" fill="${cMid}"/>
      <ellipse cx="0" cy="6" rx="4" ry="5" fill="${cDark}"/>
      <circle cx="0" cy="0" r="1.5" fill="#fef08a"/>
    </g>
  `).join('\n');

  return makeSvg(`
    <!-- Bushy Large Leaves -->
    <path d="M60 130 Q30 120 22 100 Q40 94 60 115" fill="#15803d" stroke="#166534" stroke-width="1.5"/>
    <path d="M60 130 Q90 120 98 100 Q80 94 60 115" fill="#16a34a" stroke="#166534" stroke-width="1.5"/>
    <!-- Stem -->
    <path d="M60 130 L60 82" stroke="#15803d" stroke-width="5" stroke-linecap="round"/>
    <!-- Pom-pom cluster of florets -->
    <g filter="url(#softShadow)">
      <!-- Background mass -->
      <circle cx="60" cy="58" r="32" fill="${cDark}"/>
      ${floretSvgs}
    </g>
  `);
}

// 7. Lavender generator
function generateLavender() {
  return makeSvg(`
    <!-- Fine Needle Foliage Base -->
    <path d="M60 130 Q40 126 30 115" stroke="#4ade80" stroke-width="2"/>
    <path d="M60 130 Q46 118 36 105" stroke="#22c55e" stroke-width="2"/>
    <path d="M60 130 Q74 118 84 105" stroke="#22c55e" stroke-width="2"/>
    <path d="M60 130 Q80 126 90 115" stroke="#4ade80" stroke-width="2"/>
    <!-- 3 Stems -->
    <path d="M52 130 Q50 85 46 45" stroke="#15803d" stroke-width="2.5"/>
    <path d="M60 130 Q60 75 60 30" stroke="#15803d" stroke-width="3"/>
    <path d="M68 130 Q70 85 74 45" stroke="#15803d" stroke-width="2.5"/>
    <!-- Flower Whorls -->
    <g filter="url(#softShadow)">
      <!-- Center Spire -->
      <ellipse cx="60" cy="32" rx="4" ry="5" fill="#c084fc"/>
      <ellipse cx="57" cy="38" rx="4.5" ry="4" fill="#a855f7"/>
      <ellipse cx="63" cy="38" rx="4.5" ry="4" fill="#a855f7"/>
      <ellipse cx="56" cy="46" rx="5" ry="4.5" fill="#7e22ce"/>
      <ellipse cx="64" cy="46" rx="5" ry="4.5" fill="#7e22ce"/>
      <ellipse cx="55" cy="54" rx="5" ry="4.5" fill="#6b21a8"/>
      <ellipse cx="65" cy="54" rx="5" ry="4.5" fill="#6b21a8"/>
      <!-- Left Spire -->
      <ellipse cx="46" cy="46" rx="3.5" ry="4" fill="#c084fc"/>
      <ellipse cx="43" cy="52" rx="4" ry="3.5" fill="#a855f7"/>
      <ellipse cx="49" cy="52" rx="4" ry="3.5" fill="#a855f7"/>
      <ellipse cx="42" cy="60" rx="4.5" ry="4" fill="#7e22ce"/>
      <ellipse cx="50" cy="60" rx="4.5" ry="4" fill="#7e22ce"/>
      <!-- Right Spire -->
      <ellipse cx="74" cy="46" rx="3.5" ry="4" fill="#c084fc"/>
      <ellipse cx="71" cy="52" rx="4" ry="3.5" fill="#a855f7"/>
      <ellipse cx="77" cy="52" rx="4" ry="3.5" fill="#a855f7"/>
      <ellipse cx="70" cy="60" rx="4.5" ry="4" fill="#7e22ce"/>
      <ellipse cx="78" cy="60" rx="4.5" ry="4" fill="#7e22ce"/>
    </g>
  `);
}

// 8. Chrysanthemum / Aster / Gerbera (Daisy disc type)
function generateDiscFlower(key, petalDark, petalMid, petalLight, centerColor = '#eab308', petalCount = 20) {
  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 360) / petalCount;
    petals.push(`<ellipse cx="60" cy="34" rx="4" ry="16" fill="${petalMid}" stroke="${petalDark}" stroke-width="0.8" transform="rotate(${angle} 60 56)"/>`);
  }
  return makeSvg(`
    <!-- Stem and Serrated Foliage -->
    <path d="M60 130 Q59 95 60 68" stroke="#15803d" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M60 115 Q36 112 30 102 Q48 98 60 108" fill="#16a34a" stroke="#14532d" stroke-width="1.2"/>
    <path d="M60 100 Q84 98 90 88 Q72 84 60 94" fill="#15803d" stroke="#14532d" stroke-width="1.2"/>
    <!-- Flower Rays -->
    <g filter="url(#softShadow)">
      ${petals.join('\n')}
      <circle cx="60" cy="56" r="14" fill="${petalLight}" opacity="0.6"/>
      <!-- Center Eye -->
      <circle cx="60" cy="56" r="10" fill="${centerColor}" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="60" cy="56" r="6" fill="#a16207"/>
    </g>
  `);
}

// 9. Calla Lily generator
function generateCalla() {
  return makeSvg(`
    <!-- Arrowhead lush leaves -->
    <path d="M60 130 Q30 120 25 95 Q42 90 60 115" fill="#14532d" stroke="#052e16" stroke-width="1.5"/>
    <path d="M60 130 Q90 120 95 95 Q78 90 60 115" fill="#166534" stroke="#052e16" stroke-width="1.5"/>
    <!-- Smooth Stem -->
    <path d="M60 130 Q58 85 60 55" stroke="#15803d" stroke-width="5" stroke-linecap="round"/>
    <!-- Sculpted White Funnel Spathe -->
    <g filter="url(#softShadow)">
      <!-- Back fold -->
      <path d="M46 62 C40 35 70 20 78 35 C82 45 74 65 60 68 C52 68 48 65 46 62 Z" fill="#e2e8f0"/>
      <!-- Golden Spadix Spike -->
      <path d="M60 56 Q61 38 62 30" stroke="#facc15" stroke-width="5" stroke-linecap="round"/>
      <!-- Front Spathe Wrap -->
      <path d="M44 65 C40 45 52 35 60 38 C68 42 76 55 68 70 C60 76 48 72 44 65 Z" fill="#ffffff"/>
      <path d="M60 72 Q64 45 76 34" stroke="#f1f5f9" stroke-width="1.5"/>
    </g>
  `);
}

// 10. Dahlia / Peony / Ranunculus (Dense layered pompon)
function generatePompon(key, cDark, cMid, cLight) {
  return makeSvg(`
    <!-- Foliage -->
    <path d="M60 130 Q59 95 60 72" stroke="#15803d" stroke-width="5" stroke-linecap="round"/>
    <path d="M60 114 Q32 112 26 98 Q46 95 60 106" fill="#166534" stroke="#14532d" stroke-width="1.5"/>
    <path d="M60 98 Q88 96 94 82 Q74 80 60 92" fill="#15803d" stroke="#14532d" stroke-width="1.5"/>
    <!-- Dense concentric petals -->
    <g filter="url(#softShadow)">
      <circle cx="60" cy="54" r="30" fill="${cDark}"/>
      <circle cx="60" cy="54" r="24" fill="${cMid}"/>
      <circle cx="60" cy="54" r="18" fill="${cLight}"/>
      <circle cx="60" cy="54" r="12" fill="${cMid}"/>
      <circle cx="60" cy="54" r="6" fill="${cDark}"/>
      <!-- Petal edge notches -->
      <path d="M34 54 C34 40 44 32 60 32 C76 32 86 40 86 54 C86 68 76 76 60 76 C44 76 34 68 34 54 Z" fill="none" stroke="${cLight}" stroke-width="2" stroke-dasharray="6 3"/>
      <circle cx="60" cy="54" r="3" fill="#fef08a"/>
    </g>
  `);
}

// 11. Baby's Breath / Gypsophila cloud
function generateGypsophila(key, starColor = '#ffffff') {
  const stars = [
    { x: 38, y: 36 }, { x: 50, y: 28 }, { x: 66, y: 24 }, { x: 80, y: 32 },
    { x: 30, y: 48 }, { x: 44, y: 44 }, { x: 60, y: 40 }, { x: 74, y: 44 }, { x: 88, y: 48 },
    { x: 36, y: 60 }, { x: 52, y: 56 }, { x: 68, y: 56 }, { x: 84, y: 62 },
    { x: 48, y: 70 }, { x: 64, y: 68 }, { x: 76, y: 72 }
  ];

  const starsSvg = stars.map(s => `
    <g transform="translate(${s.x}, ${s.y})">
      <circle cx="0" cy="0" r="3.5" fill="${starColor}" filter="url(#softShadow)"/>
      <circle cx="0" cy="0" r="1.2" fill="#fef08a"/>
    </g>
  `).join('\n');

  return makeSvg(`
    <!-- Delicate branching stems -->
    <path d="M60 130 L60 85" stroke="#16a34a" stroke-width="3.5"/>
    <path d="M60 85 Q45 70 38 42" stroke="#22c55e" stroke-width="1.8"/>
    <path d="M60 85 Q75 70 82 42" stroke="#22c55e" stroke-width="1.8"/>
    <path d="M60 85 L60 35" stroke="#22c55e" stroke-width="2"/>
    <path d="M48 65 L32 52" stroke="#4ade80" stroke-width="1.5"/>
    <path d="M72 65 L88 52" stroke="#4ade80" stroke-width="1.5"/>
    <!-- Cloud of tiny white star blossoms -->
    ${starsSvg}
  `);
}

// 12. Eucalyptus
function generateEucalyptus() {
  const coins = [
    { x: 46, y: 40, rx: 9, ry: 7, r: -20 },
    { x: 74, y: 46, rx: 10, ry: 8, r: 15 },
    { x: 44, y: 62, rx: 11, ry: 9, r: -15 },
    { x: 76, y: 68, rx: 12, ry: 9, r: 20 },
    { x: 42, y: 86, rx: 13, ry: 10, r: -10 },
    { x: 78, y: 92, rx: 13, ry: 10, r: 15 },
    { x: 48, y: 110, rx: 14, ry: 10, r: -5 },
  ];

  const coinsSvg = coins.map(c => `
    <ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx}" ry="${c.ry}" fill="#6ee7b7" stroke="#047857" stroke-width="1.5" transform="rotate(${c.r} ${c.x} ${c.y})" filter="url(#softShadow)"/>
    <ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx * 0.7}" ry="${c.ry * 0.7}" fill="#a7f3d0" opacity="0.6"/>
  `).join('\n');

  return makeSvg(`
    <!-- Upright Zigzag Stem -->
    <path d="M60 130 Q58 80 60 25" stroke="#065f46" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="60" cy="24" r="4" fill="#34d399"/>
    <!-- Silver Dollar Rounded Leaves -->
    ${coinsSvg}
  `);
}

// 13. Ruscus
function generateRuscus() {
  return makeSvg(`
    <!-- Zigzag emerald stem -->
    <path d="M60 130 Q58 80 60 25" stroke="#065f46" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Pointed Cladodes (Leaves) -->
    <g filter="url(#softShadow)">
      <path d="M60 35 Q40 32 36 24 Q50 22 60 30" fill="#10b981" stroke="#065f46" stroke-width="1.2"/>
      <path d="M60 48 Q80 44 84 36 Q70 34 60 42" fill="#059669" stroke="#065f46" stroke-width="1.2"/>
      <path d="M60 62 Q38 58 34 50 Q48 48 60 56" fill="#10b981" stroke="#065f46" stroke-width="1.2"/>
      <path d="M60 76 Q82 72 86 64 Q72 62 60 70" fill="#059669" stroke="#065f46" stroke-width="1.2"/>
      <path d="M60 92 Q36 88 30 78 Q46 76 60 84" fill="#10b981" stroke="#065f46" stroke-width="1.2"/>
      <path d="M60 106 Q84 102 88 92 Q74 90 60 100" fill="#059669" stroke="#065f46" stroke-width="1.2"/>
    </g>
  `);
}

// 14. Foxglove
function generateFoxglove() {
  return makeSvg(`
    <!-- Tall Flower Spike -->
    <path d="M60 130 L60 30" stroke="#15803d" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Basal Leaves -->
    <path d="M60 125 Q32 120 26 105 Q46 102 60 116" fill="#166534" stroke="#14532d" stroke-width="1.5"/>
    <path d="M60 125 Q88 120 94 105 Q74 102 60 116" fill="#166534" stroke="#14532d" stroke-width="1.5"/>
    <!-- Cascading Thimble Bells -->
    <g filter="url(#softShadow)">
      <circle cx="60" cy="30" r="3.5" fill="#e9d5ff"/>
      <!-- Tier 1 -->
      <path d="M52 42 C48 38 72 38 68 42 L64 50 L56 50 Z" fill="#c084fc"/>
      <!-- Tier 2 -->
      <path d="M46 54 C42 48 78 48 74 54 L68 64 L52 64 Z" fill="#a855f7"/>
      <circle cx="60" cy="56" r="1.5" fill="#581c87"/>
      <!-- Tier 3 -->
      <path d="M42 68 C38 60 82 60 78 68 L72 80 L48 80 Z" fill="#9333ea"/>
      <circle cx="56" cy="72" r="1.5" fill="#581c87"/>
      <circle cx="64" cy="72" r="1.5" fill="#581c87"/>
      <!-- Tier 4 -->
      <path d="M40 84 C36 76 84 76 80 84 L74 96 L46 96 Z" fill="#7e22ce"/>
      <circle cx="54" cy="88" r="1.5" fill="#fdf4ff"/>
      <circle cx="60" cy="90" r="1.5" fill="#fdf4ff"/>
      <circle cx="66" cy="88" r="1.5" fill="#fdf4ff"/>
    </g>
  `);
}

// 15. Protea
function generateProtea() {
  return makeSvg(`
    <!-- Leathery Leaves -->
    <path d="M60 130 L60 80" stroke="#14532d" stroke-width="6" stroke-linecap="round"/>
    <path d="M60 120 Q32 112 28 92 Q48 88 60 106" fill="#15803d" stroke="#14532d" stroke-width="1.8"/>
    <path d="M60 105 Q88 98 92 78 Q72 74 60 92" fill="#15803d" stroke="#14532d" stroke-width="1.8"/>
    <!-- King Protea Crown Bracts -->
    <g filter="url(#softShadow)">
      <!-- Central white dome -->
      <ellipse cx="60" cy="54" rx="16" ry="20" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- Pointed Pink Bracts surrounding -->
      <path d="M42 66 L34 38 L48 54 Z" fill="#fb7185"/>
      <path d="M78 66 L86 38 L72 54 Z" fill="#fb7185"/>
      <path d="M50 72 L44 28 L56 56 Z" fill="#f43f5e"/>
      <path d="M70 72 L76 28 L64 56 Z" fill="#f43f5e"/>
      <path d="M60 74 L60 22 L60 58 Z" fill="#e11d48"/>
      <!-- Base cup -->
      <ellipse cx="60" cy="72" rx="18" ry="8" fill="#be123c"/>
    </g>
  `);
}

// 16. Sakura Spring
function generateSakura() {
  return makeSvg(`
    <!-- Gnarled Bonsai Wood Branch -->
    <path d="M60 130 Q58 100 52 82 Q46 65 60 48" stroke="#78350f" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M52 82 Q38 72 32 64" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
    <path d="M56 62 Q72 56 82 50" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Little green baby leaves -->
    <ellipse cx="30" cy="62" rx="4" ry="2" fill="#86efac"/>
    <ellipse cx="84" cy="48" rx="4" ry="2" fill="#86efac"/>
    <!-- 3 Sakura Blossom Clusters -->
    <g filter="url(#softShadow)">
      <!-- Top Blossom -->
      <g transform="translate(60, 44)">
        <circle cx="0" cy="-7" r="5" fill="#fbcfe8"/>
        <circle cx="-7" cy="-2" r="5" fill="#fbcfe8"/>
        <circle cx="-4" cy="6" r="5" fill="#f472b6"/>
        <circle cx="4" cy="6" r="5" fill="#f472b6"/>
        <circle cx="7" cy="-2" r="5" fill="#fbcfe8"/>
        <circle cx="0" cy="0" r="3" fill="#f43f5e"/>
        <circle cx="0" cy="0" r="1.5" fill="#fef08a"/>
      </g>
      <!-- Left Blossom -->
      <g transform="translate(36, 60)">
        <circle cx="0" cy="-6" r="4.5" fill="#fbcfe8"/>
        <circle cx="-6" cy="-2" r="4.5" fill="#fbcfe8"/>
        <circle cx="-3" cy="5" r="4.5" fill="#f472b6"/>
        <circle cx="3" cy="5" r="4.5" fill="#f472b6"/>
        <circle cx="6" cy="-2" r="4.5" fill="#fbcfe8"/>
        <circle cx="0" cy="0" r="2.5" fill="#f43f5e"/>
      </g>
      <!-- Right Blossom -->
      <g transform="translate(80, 48)">
        <circle cx="0" cy="-6" r="4.5" fill="#fbcfe8"/>
        <circle cx="-6" cy="-2" r="4.5" fill="#fbcfe8"/>
        <circle cx="-3" cy="5" r="4.5" fill="#f472b6"/>
        <circle cx="3" cy="5" r="4.5" fill="#f472b6"/>
        <circle cx="6" cy="-2" r="4.5" fill="#fbcfe8"/>
        <circle cx="0" cy="0" r="2.5" fill="#f43f5e"/>
      </g>
    </g>
  `);
}

// 17. Iris
function generateIris() {
  return makeSvg(`
    <!-- Sword-like Upright Foliage -->
    <path d="M58 130 Q46 90 42 45 Q52 85 58 115" fill="#15803d" stroke="#166534" stroke-width="1.5"/>
    <path d="M62 130 Q74 90 78 45 Q68 85 62 115" fill="#16a34a" stroke="#166534" stroke-width="1.5"/>
    <!-- Stem -->
    <path d="M60 130 L60 65" stroke="#15803d" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Iris Blossom (Standards + Falls) -->
    <g filter="url(#softShadow)">
      <!-- 3 Upright Standards -->
      <ellipse cx="60" cy="40" rx="7" ry="18" fill="#a855f7"/>
      <ellipse cx="52" cy="44" rx="6" ry="16" fill="#c084fc" transform="rotate(-20 52 44)"/>
      <ellipse cx="68" cy="44" rx="6" ry="16" fill="#c084fc" transform="rotate(20 68 44)"/>
      <!-- 3 Drooping Falls -->
      <path d="M60 55 C46 58 40 76 48 84 C56 76 58 65 60 55 Z" fill="#6b21a8"/>
      <path d="M60 55 C74 58 80 76 72 84 C64 76 62 65 60 55 Z" fill="#6b21a8"/>
      <path d="M60 55 C54 62 54 82 60 88 C66 82 66 62 60 55 Z" fill="#581c87"/>
      <!-- Yellow Beard Crest -->
      <path d="M60 58 L60 72" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="60" cy="62" r="3" fill="#fef08a"/>
    </g>
  `);
}

// Map each of the 40 flowers to its bespoke graphic
const FLOWER_GENERATORS = {
  // 1. Roses (7)
  rose_red: () => generateRose('rose_red', '#991b1b', '#dc2626', '#f87171'),
  rose_white: () => generateRose('rose_white', '#cbd5e1', '#f1f5f9', '#ffffff'),
  rose_pink: () => generateRose('rose_pink', '#be185d', '#ec4899', '#fbcfe8'),
  rose_peach: () => generateRose('rose_peach', '#c2410c', '#fb923c', '#ffedd5'),
  rose_cream: () => generateRose('rose_cream', '#d97706', '#fef3c7', '#fffbeb'),
  rose_orange: () => generateRose('rose_orange', '#b45309', '#f97316', '#fdba74'),
  rose_yellow: () => generateRose('rose_yellow', '#a16207', '#eab308', '#fef08a'),

  // 2. Tulips (4)
  tulip_pink: () => generateTulip('tulip_pink', '#be123c', '#fb7185', '#fecdd3'),
  tulip_red: () => generateTulip('tulip_red', '#991b1b', '#ef4444', '#fca5a5'),
  tulip_purple: () => generateTulip('tulip_purple', '#6b21a8', '#a855f7', '#e9d5ff'),
  tulip_yellow: () => generateTulip('tulip_yellow', '#a16207', '#facc15', '#fef9c3'),

  // 3. Lili & Anggrek (5)
  orchid_pink: () => generateOrchid('orchid_pink', '#9d174d', '#db2777', '#f472b6'),
  lily_white: () => generateLily('lily_white', '#94a3b8', '#e2e8f0', '#ffffff'),
  lily_pink: () => generateLily('lily_pink', '#be123c', '#f43f5e', '#fecdd3', '#881337'),
  lily_orange: () => generateLily('lily_orange', '#c2410c', '#ea580c', '#fdba74', '#431407'),
  calla_white: () => generateCalla(),

  // 4. Padang & Herba (15)
  sunflower: () => generateSunflower(),
  hydrangea_blue: () => generateHydrangea('hydrangea_blue', '#0369a1', '#0284c7', '#7dd3fc'),
  hydrangea_pink: () => generateHydrangea('hydrangea_pink', '#be185d', '#ec4899', '#fbcfe8'),
  hydrangea_purple: () => generateHydrangea('hydrangea_purple', '#581c87', '#7e22ce', '#c084fc'),
  hydrangea_azure: () => generateHydrangea('hydrangea_azure', '#0f172a', '#0369a1', '#38bdf8'),
  chrysanthemum_white: () => generateDiscFlower('chrysanthemum_white', '#94a3b8', '#e2e8f0', '#ffffff', '#eab308', 24),
  chrysanthemum_pink: () => generateDiscFlower('chrysanthemum_pink', '#be185d', '#ec4899', '#fbcfe8', '#facc15', 24),
  chrysanthemum_yellow: () => generateDiscFlower('chrysanthemum_yellow', '#a16207', '#eab308', '#fef08a', '#ca8a04', 24),
  gerbera_red: () => generateDiscFlower('gerbera_red', '#7f1d1d', '#dc2626', '#fca5a5', '#451a03', 18),
  lavender: () => generateLavender(),
  iris_purple: () => generateIris(),
  aster_purple: () => generateDiscFlower('aster_purple', '#581c87', '#9333ea', '#e9d5ff', '#facc15', 20),
  babysbreath_white: () => generateGypsophila('babysbreath_white', '#ffffff'),
  carnation_grace: () => generatePompon('carnation_grace', '#9f1239', '#f43f5e', '#fecdd3'),
  daisy_meadow: () => generateDiscFlower('daisy_meadow', '#cbd5e1', '#f8fafc', '#ffffff', '#eab308', 16),

  // 5. Tropis & Eksotis (9)
  dahlia_orange: () => generatePompon('dahlia_orange', '#9a3412', '#ea580c', '#fdba74'),
  foxglove_purple: () => generateFoxglove(),
  protea_pink: () => generateProtea(),
  ranunculus_pink: () => generatePompon('ranunculus_pink', '#be185d', '#f472b6', '#fce7f3'),
  eucalyptus: () => generateEucalyptus(),
  ruscus: () => generateRuscus(),
  peony_royal: () => generatePompon('peony_royal', '#881337', '#e11d48', '#fda4af'),
  gypsophila_crystal: () => generateGypsophila('gypsophila_crystal', '#bae6fd'),
  sakura_spring: () => generateSakura()
};

let count = 0;
for (const [key, genFn] of Object.entries(FLOWER_GENERATORS)) {
  const svg = genFn();
  const filePath = path.join(outDir, `${key}.svg`);
  fs.writeFileSync(filePath, svg, 'utf-8');
  count++;
}

console.log(`Successfully generated ${count} distinct garden flower SVGs into ${outDir}`);
