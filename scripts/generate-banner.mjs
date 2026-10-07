import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Run: node scripts/generate-banner.mjs
// The SVG is entirely deterministic: an isometric block field sampled from a
// shader-style interference pattern, a hovering block piece, and live text.
const width = 1800;
const height = 600;
const background = '#060b16';
const spectrum = ['#28dcf2', '#448cff', '#a479ff', '#ff9aab'];
const output = fileURLToPath(new URL('../assets/banner.svg', import.meta.url));

// Board geometry: N×N columns, isometric half-tile W×H, UNIT px per level.
// Integer constants keep every coordinate an integer.
const N = 16;
const W = 26;
const H = 13;
const UNIT = 12;
const LEVELS = 9;
const origin = { x: 1330, y: 150 };

const hex = color => [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((c, i) => Math.round(c + (hex(b)[i] - c) * t).toString(16).padStart(2, '0')).join('');

function spectrumAt(t) {
  const scaled = t * (spectrum.length - 1);
  const index = Math.min(Math.floor(scaled), spectrum.length - 2);
  return mix(spectrum[index], spectrum[index + 1], scaled - index);
}

// Two ripples interfering, like a fragment shader evaluated once per cell,
// then quantised into stacked block levels 1..LEVELS.
function level(i, j) {
  if (i >= N || j >= N) return 0;
  const u = (i + 0.5) / N * 2 - 1;
  const v = (j + 0.5) / N * 2 - 1;
  const a = Math.cos(7 * Math.hypot(u + 0.25, v - 0.35));
  const b = Math.cos(9 * Math.hypot(u - 0.45, v + 0.3) - 1);
  return 1 + Math.round((0.5 + 0.5 * (0.6 * a + 0.4 * b)) * (LEVELS - 1));
}

const point = (i, j, z) => `${origin.x + (i - j) * W},${origin.y + (i + j) * H - z * UNIT}`;
const face = (fill, corners) => `<path fill="${fill}" d="M${corners.join('L')}Z"/>`;

// One prism from height z down to the given floors: left face, right face, top.
// Board columns pass the front neighbours' heights as floors, since anything
// lower is hidden by those neighbours anyway.
function prism(i, j, z, top, leftFloor, rightFloor) {
  const faces = [];
  if (z > leftFloor) {
    faces.push(face(mix(top, background, 0.38), [point(i, j + 1, z), point(i + 1, j + 1, z), point(i + 1, j + 1, leftFloor), point(i, j + 1, leftFloor)]));
  }
  if (z > rightFloor) {
    faces.push(face(mix(top, background, 0.6), [point(i + 1, j, z), point(i + 1, j + 1, z), point(i + 1, j + 1, rightFloor), point(i + 1, j, rightFloor)]));
  }
  faces.push(face(top, [point(i, j, z), point(i + 1, j, z), point(i + 1, j + 1, z), point(i, j + 1, z)]));
  return faces.join('');
}

// Painter's order: back diagonals (small i + j) first.
const byDepth = (p, q) => p[0] + p[1] - (q[0] + q[1]) || p[0] - q[0];
const cells = Array.from({ length: N * N }, (_, k) => [Math.floor(k / N), k % N]).sort(byDepth);

const board = cells.map(([i, j]) => {
  const z = level(i, j);
  return prism(i, j, z, spectrumAt((z - 1) / (LEVELS - 1)), level(i, j + 1), level(i + 1, j));
}).join('\n');

// A T-piece hovering above the back of the board, about to drop.
const hover = LEVELS + 6;
const piece = [[2, 5], [3, 5], [4, 5], [3, 6]].sort(byDepth)
  .map(([i, j]) => prism(i, j, hover, '#eef3ff', hover - 1, hover - 1)).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">Adel Terki — Creative coding. Practical tools.</title>
<desc id="description">A code-built banner: an isometric landscape of blocks whose heights follow a rippling shader pattern in cyan, violet, and coral, with a white T-shaped block piece hovering above it.</desc>
<defs>
  <linearGradient id="background" x2="1" y2="1"><stop stop-color="#050a15"/><stop offset="1" stop-color="#0c1024"/></linearGradient>
  <radialGradient id="halo" cx="1330" cy="330" r="560" gradientUnits="userSpaceOnUse"><stop stop-color="#2a3f7a" stop-opacity=".45"/><stop offset="1" stop-color="#2a3f7a" stop-opacity="0"/></radialGradient>
  <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1" fill="#5a7396" opacity=".22"/></pattern>
</defs>
<rect width="${width}" height="${height}" fill="url(#background)"/>
<rect width="${width}" height="${height}" fill="url(#dots)"/>
<rect width="${width}" height="${height}" fill="url(#halo)"/>
<ellipse cx="${origin.x}" cy="${origin.y + 2 * N * H - 30}" rx="${N * W}" ry="40" fill="#000" opacity=".35"/>
<g stroke="${background}" stroke-width="1" stroke-linejoin="round">
${board}
${piece}
</g>
<g font-family="Segoe UI, Helvetica Neue, Arial, sans-serif">
  <path fill="${spectrum[0]}" d="M110 183L121 188.5L110 194L99 188.5Z"/>
  <path fill="${mix(spectrum[0], background, 0.38)}" d="M99 188.5L110 194V206L99 200.5Z"/>
  <path fill="${mix(spectrum[0], background, 0.6)}" d="M110 194L121 188.5V200.5L110 206Z"/>
  <text x="136" y="203" fill="${spectrum[0]}" font-family="Consolas, Menlo, monospace" font-size="24" letter-spacing="6">ANTELM-DEV</text>
  <text x="94" y="312" fill="#f3f6fc" font-size="104" font-weight="700" letter-spacing="-3">Adel Terki</text>
  <text x="100" y="374" fill="#b8c6dc" font-size="34" letter-spacing=".4">Creative coding. Practical tools.</text>
  <path d="M100 433H144" stroke="${spectrum[3]}" stroke-width="3"/>
  <text x="160" y="440" fill="#7f93b0" font-family="Consolas, Menlo, monospace" font-size="18" letter-spacing="1.6">SHADERS / DEV TOOLS / 3D GAMES</text>
</g>
</svg>\n`;

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, svg, 'utf8');
console.log(`Generated ${output} (${Buffer.byteLength(svg)} bytes)`);
