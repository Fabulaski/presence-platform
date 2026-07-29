import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="50%" stop-color="#1E1B4B" />
      <stop offset="100%" stop-color="#312E81" />
    </linearGradient>
    <linearGradient id="doveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>
    <linearGradient id="branchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>

  <!-- Background Card -->
  <rect width="512" height="512" rx="120" ry="120" fill="url(#bgGrad)" />

  <!-- Gold Inner Halo -->
  <circle cx="256" cy="240" r="150" fill="url(#goldGlow)" opacity="0.18" />

  <!-- Olive Branch in Beak -->
  <path d="M 280,240 C 315,225 355,230 380,215" stroke="url(#branchGrad)" stroke-width="7" stroke-linecap="round" fill="none" />
  <!-- Leaves -->
  <path d="M 315,232 C 308,215 328,210 332,225 Z" fill="url(#branchGrad)" />
  <path d="M 338,228 C 345,210 362,212 352,226 Z" fill="url(#branchGrad)" />
  <path d="M 358,222 C 362,205 378,206 372,220 Z" fill="url(#branchGrad)" />
  <path d="M 376,218 C 385,206 395,215 382,224 Z" fill="url(#branchGrad)" />

  <!-- Left Wing (Spread) -->
  <path d="M 215,235 C 165,150 95,130 65,155 C 100,200 160,245 215,255 Z" fill="url(#doveGrad)" opacity="0.9" />

  <!-- Right Wing (Soaring) -->
  <path d="M 230,215 C 250,120 325,75 368,80 C 320,130 265,190 230,215 Z" fill="url(#doveGrad)" />

  <!-- Body & Head -->
  <path d="M 175,255 C 135,265 100,285 75,320 C 120,305 160,295 195,275 C 225,290 265,285 290,265 C 300,255 302,238 292,230 C 280,218 262,215 245,222 C 215,230 190,245 175,255 Z" fill="url(#doveGrad)" />

  <!-- Tail Feathers -->
  <path d="M 125,300 C 90,328 55,340 38,358 C 65,345 92,322 135,300 Z" fill="url(#doveGrad)" opacity="0.8" />

  <!-- Eye -->
  <circle cx="278" cy="232" r="4" fill="#0F172A" />

  <!-- Beak -->
  <path d="M 288,236 L 302,242 L 288,245 Z" fill="url(#goldGlow)" />
</svg>`;

const iconPaths = [
  path.join(process.cwd(), 'apps', 'chrome-extension', 'public', 'icons', 'presence-icon.svg'),
  path.join(process.cwd(), 'apps', 'canva-app', 'src', 'presence-icon.svg'),
  path.join(process.cwd(), 'apps', 'web', 'public', 'presence-icon.svg'),
  path.join(process.cwd(), 'apps', 'vscode-extension', 'presence-icon.svg'),
  path.join(process.cwd(), 'public', 'icons', 'presence-icon.svg')
];

iconPaths.forEach(p => {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, svgContent, 'utf-8');
  console.log(`✅ Saved SVG icon to: ${p}`);
});
