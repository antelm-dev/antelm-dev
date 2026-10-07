import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Run: node scripts/generate-banner.mjs
// The SVG is entirely deterministic: vector paths, gradients, and live text.
const width = 1800;
const height = 600;
const palette = { cyan: '#28dcf2', blue: '#448cff', violet: '#a479ff', coral: '#ff9aab' };
const output = fileURLToPath(new URL('../assets/banner.svg', import.meta.url));
const number = value => value.toFixed(2);

// Project a sinusoidal surface into the banner plane. Each constant-v slice
// becomes one contour; changing the coefficients changes the whole sculpture.
function surface(u, v) {
  return {
    x: 1295 + 455 * u + 85 * Math.sin(2.8 * v + 1.2 * u),
    y: 310 + 180 * v + 110 * Math.sin(2.8 * u + 1.6 * v) + 45 * Math.cos(4 * v + u),
  };
}

function contour(v) {
  const points = Array.from({ length: 201 }, (_, i) => surface(-1.28 + i * 2.56 / 200, v));
  return points.map((p, i) => `${i ? 'L' : 'M'}${number(p.x)},${number(p.y)}`).join(' ');
}

const curves = Array.from({ length: 65 }, (_, i) => {
  const v = -1.35 + i * 2.7 / 64;
  const emphasis = i % 8 === 0;
  return `<path d="${contour(v)}" stroke-width="${emphasis ? 1.8 : 1.05}" opacity="${emphasis ? 0.94 : 0.58}"/>`;
}).join('\n');

// A second family of quiet curves ties the sculpture to the left-hand grid.
const lowerCurves = Array.from({ length: 13 }, (_, line) => {
  const points = Array.from({ length: 121 }, (_, i) => {
    const x = i * width / 120;
    const y = 536 + line * 5 + 19 * Math.sin(x / 190 + line * 0.11) - 30 * Math.exp(-(((x - 1130) / 260) ** 2));
    return `${i ? 'L' : 'M'}${number(x)},${number(y)}`;
  }).join(' ');
  return `<path d="${points}" opacity="${number(0.10 + line * 0.012)}"/>`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">Adel Terki — Creative coding. Practical tools.</title>
<desc id="description">A code-built banner with a midnight-blue grid and a folded surface of cyan, violet, and coral mathematical contours.</desc>
<defs>
  <linearGradient id="background" x2="1" y2="1"><stop stop-color="#040c17"/><stop offset="1" stop-color="#0d1023"/></linearGradient>
  <linearGradient id="spectrum" gradientUnits="userSpaceOnUse" x1="860" y1="80" x2="1730" y2="550"><stop stop-color="${palette.cyan}"/><stop offset=".38" stop-color="${palette.blue}"/><stop offset=".72" stop-color="${palette.violet}"/><stop offset="1" stop-color="${palette.coral}"/></linearGradient>
  <linearGradient id="fade"><stop offset=".40" stop-color="#000"/><stop offset=".57" stop-color="#fff"/></linearGradient>
  <radialGradient id="halo"><stop stop-color="#26436d" stop-opacity=".35"/><stop offset="1" stop-color="#142344" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="90" height="90" patternUnits="userSpaceOnUse"><path d="M90 0H0V90" fill="none" stroke="#2a5267" stroke-width=".8" opacity=".30"/><circle cx="0" cy="0" r="1.5" fill="#35d1ee" opacity=".35"/></pattern>
  <mask id="artwork-fade"><rect width="1800" height="600" fill="url(#fade)"/></mask>
</defs>
<rect width="1800" height="600" fill="url(#background)"/>
<rect width="1800" height="600" fill="url(#grid)"/>
<ellipse cx="1320" cy="280" rx="550" ry="410" fill="url(#halo)"/>
<g fill="none" stroke="url(#spectrum)" stroke-linecap="round" mask="url(#artwork-fade)">
${curves}
</g>
<g fill="none" stroke="url(#spectrum)" stroke-width="1">${lowerCurves}</g>
<g font-family="Segoe UI, Arial, Helvetica, sans-serif">
  <text x="100" y="190" fill="${palette.cyan}" font-family="Consolas, Menlo, monospace" font-size="24" letter-spacing="6">ANTELM-DEV</text>
  <text x="94" y="297" fill="#f3f6fc" font-size="96" font-weight="700" letter-spacing="-3">Adel Terki</text>
  <text x="100" y="354" fill="#b2c2d8" font-size="29" letter-spacing=".6">Creative coding. Practical tools.</text>
  <path d="M100 415H144" stroke="${palette.cyan}" stroke-width="3"/>
  <text x="159" y="421" fill="#7c91ab" font-family="Consolas, Menlo, monospace" font-size="15" letter-spacing="1.4">TYPESCRIPT / ELECTRON / REAL-TIME GRAPHICS</text>
</g>
</svg>\n`;

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, svg, 'utf8');
console.log(`Generated ${output} (${Buffer.byteLength(svg)} bytes)`);
