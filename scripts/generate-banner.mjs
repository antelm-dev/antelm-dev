import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Run: node scripts/generate-banner.mjs
// Typographic banner with a slowly rotating warp-tunnel lattice on the right,
// a nod to Shadergrove. Emits a dark and a light variant.
const width = 1200;
const height = 320;
const margin = 96;
const fonts = 'Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif';

const themes = {
  dark: {
    file: 'banner-minimal.svg',
    background: '#0d1117',
    name: '#f5f1ea',
    tagline: '#8b949e',
    accent: '#28dcf2',
    ring: '#28dcf2',
    spoke: '#ff5fd2',
    glow: '#8b7cff',
    latticeOpacity: 0.7,
  },
  light: {
    file: 'banner-minimal-light.svg',
    background: '#ffffff',
    name: '#1f2328',
    tagline: '#59636e',
    accent: '#0969da',
    ring: '#0969da',
    spoke: '#bf3989',
    glow: '#8250df',
    latticeOpacity: 0.45,
  },
};

// Warp-tunnel lattice: concentric rings plus twisted spokes (log spirals),
// centred off the right edge so it bleeds past the banner bounds.
const cx = 980;
const cy = 160;
const outer = 360;
const inner = 14;
const rings = 10;
const spokes = 12;
const twist = 0.9; // radians of rotation across the full radius

function lattice(theme) {
  const ringPaths = [];
  for (let i = 0; i < rings; i++) {
    const r = outer * Math.pow(0.78, i);
    ringPaths.push(`<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}"/>`);
  }

  const spokePaths = [];
  for (let s = 0; s < spokes; s++) {
    const a0 = (s / spokes) * Math.PI * 2;
    const pts = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24;
      const r = inner + (outer - inner) * t * t;
      const a = a0 + twist * (1 - t);
      pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
    spokePaths.push(`<polyline points="${pts.join(' ')}"/>`);
  }

  return `<defs>
  <radialGradient id="fade" cx="${cx}" cy="${cy}" r="${outer}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#fff" stop-opacity="1"/>
    <stop offset="0.55" stop-color="#fff" stop-opacity="0.6"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glow" cx="${cx}" cy="${cy}" r="${outer * 0.5}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${theme.glow}" stop-opacity="0.35"/>
    <stop offset="1" stop-color="${theme.glow}" stop-opacity="0"/>
  </radialGradient>
  <mask id="fadeMask"><rect width="${width}" height="${height}" fill="url(#fade)"/></mask>
</defs>
<circle cx="${cx}" cy="${cy}" r="${outer * 0.5}" fill="url(#glow)"/>
<g mask="url(#fadeMask)" opacity="${theme.latticeOpacity}" fill="none" stroke-linecap="round">
  <g stroke="${theme.ring}" stroke-width="2">
    ${ringPaths.join('\n    ')}
  </g>
  <g stroke="${theme.spoke}" stroke-width="2">
    <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="60s" repeatCount="indefinite"/>
    ${spokePaths.join('\n    ')}
  </g>
</g>`;
}

for (const theme of Object.values(themes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">
<title id="title">Adel Terki — Creative coding. Practical tools.</title>
<rect width="${width}" height="${height}" fill="${theme.background}"/>
${lattice(theme)}
<path d="M${margin} 92H${margin + 48}" stroke="${theme.accent}" stroke-width="3"/>
<g font-family="${fonts}">
  <text x="${margin - 4}" y="196" fill="${theme.name}" font-size="100" font-weight="700" letter-spacing="-2">Adel Terki</text>
  <text x="${margin}" y="252" fill="${theme.tagline}" font-size="29" letter-spacing=".3">Creative coding. Practical tools.</text>
</g>
</svg>
`;
  const output = fileURLToPath(new URL(`../assets/${theme.file}`, import.meta.url));
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, svg, 'utf8');
  console.log(`Generated ${output} (${Buffer.byteLength(svg)} bytes)`);
}
