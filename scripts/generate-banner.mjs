import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Run: node scripts/generate-banner.mjs
// A minimal typographic banner: name, tagline, and one cyan accent rule.
const width = 1200;
const height = 320;
const margin = 96;
const colors = { background: '#0d1117', name: '#f5f1ea', tagline: '#8b949e', accent: '#28dcf2' };
const fonts = 'Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif';
const output = fileURLToPath(new URL('../assets/banner-minimal.svg', import.meta.url));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">
<title id="title">Adel Terki — Creative coding. Practical tools.</title>
<rect width="${width}" height="${height}" fill="${colors.background}"/>
<path d="M${margin} 92H${margin + 48}" stroke="${colors.accent}" stroke-width="3"/>
<g font-family="${fonts}">
  <text x="${margin - 4}" y="196" fill="${colors.name}" font-size="100" font-weight="700" letter-spacing="-2">Adel Terki</text>
  <text x="${margin}" y="252" fill="${colors.tagline}" font-size="29" letter-spacing=".3">Creative coding. Practical tools.</text>
</g>
</svg>\n`;

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, svg, 'utf8');
console.log(`Generated ${output} (${Buffer.byteLength(svg)} bytes)`);
