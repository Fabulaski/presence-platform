import fs from 'fs';
import path from 'path';

// Generate 560x280 SVG Banner/Thumbnail for Hackathon Card
const svgThumbnail = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 280" width="560" height="280">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="40%" stop-color="#1E1B4B" />
      <stop offset="100%" stop-color="#312E81" />
    </linearGradient>

    <!-- Squircle Blue Gradient -->
    <linearGradient id="blueSquircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>

    <!-- Gold Text Gradient -->
    <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>

    <!-- Dove Body White -->
    <linearGradient id="doveBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>

    <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ADE80" />
      <stop offset="100%" stop-color="#16A34A" />
    </linearGradient>
  </defs>

  <!-- Canvas Background -->
  <rect width="560" height="280" rx="16" ry="16" fill="url(#bgGrad)" />

  <!-- Ambient Light Orbs -->
  <circle cx="90" cy="140" r="110" fill="#3B82F6" opacity="0.18" filter="blur(20px)" />
  <circle cx="480" cy="80" r="90" fill="#8B5CF6" opacity="0.2" filter="blur(25px)" />

  <!-- 1. LEFT: Iconic Dove Squircle Badge (Scaled & Positioned) -->
  <g transform="translate(36, 60)">
    <!-- Squircle Badge -->
    <rect width="160" height="160" rx="40" ry="40" fill="url(#blueSquircleGrad)" />
    
    <!-- Dove inside Badge -->
    <g transform="translate(-15, -15) scale(0.37)">
      <!-- Olive Branch -->
      <path d="M 215,245 C 195,265 185,295 190,320" stroke="url(#leafGrad)" stroke-width="8" stroke-linecap="round" fill="none" />
      <path d="M 205,255 C 185,245 180,265 200,270 Z" fill="url(#leafGrad)" />
      <path d="M 195,275 C 175,275 180,295 198,290 Z" fill="url(#leafGrad)" />
      <path d="M 190,295 C 170,305 185,320 200,308 Z" fill="url(#leafGrad)" />
      <path d="M 210,265 C 225,250 230,270 212,275 Z" fill="url(#leafGrad)" />
      
      <!-- Wings & Body -->
      <path d="M 255,215 C 240,165 250,135 285,125 C 300,150 290,195 255,215 Z" fill="url(#doveBodyGrad)" opacity="0.9" />
      <path d="M 265,210 C 275,140 320,110 365,120 C 355,165 315,220 265,210 Z" fill="url(#doveBodyGrad)" />
      <circle cx="230" cy="210" r="32" fill="url(#doveBodyGrad)" />
      <path d="M 215,215 L 195,222 L 215,228 Z" fill="url(#goldTextGrad)" />
      <circle cx="225" cy="206" r="4" fill="#334155" />
      <path d="M 235,225 C 205,245 220,290 265,305 C 310,320 360,290 375,250 C 355,235 315,225 265,210 Z" fill="url(#doveBodyGrad)" />
      <path d="M 355,270 C 385,285 405,290 415,280 C 400,305 375,310 345,295 Z" fill="url(#doveBodyGrad)" opacity="0.9" />
    </g>
  </g>

  <!-- 2. RIGHT: Typography & Info -->
  <!-- Top Category Pill -->
  <rect x="220" y="52" width="160" height="24" rx="12" fill="rgba(99, 102, 241, 0.25)" stroke="rgba(165, 180, 252, 0.4)" stroke-width="1" />
  <text x="232" y="68" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="700" fill="#A5B4FC" letter-spacing="1">CONTEXTUAL AI PLATFORM</text>

  <!-- Main Title -->
  <text x="220" y="112" font-family="Inter, system-ui, sans-serif" font-size="30" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Presence Platform</text>

  <!-- Tagline -->
  <text x="220" y="136" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" fill="url(#goldTextGrad)">Scripture in New Frontiers</text>

  <!-- Subtitle -->
  <text x="220" y="162" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="400" fill="#94A3B8">Contextual Scripture Infrastructure for Workspaces &amp; Apps</text>

  <!-- Integration Badges -->
  <!-- VS Code Badge -->
  <rect x="220" y="186" width="76" height="24" rx="6" fill="rgba(30, 41, 59, 0.8)" stroke="rgba(148, 163, 184, 0.2)" stroke-width="1" />
  <text x="230" y="202" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600" fill="#38BDF8">💻 VS Code</text>

  <!-- Canva Badge -->
  <rect x="304" y="186" width="68" height="24" rx="6" fill="rgba(30, 41, 59, 0.8)" stroke="rgba(148, 163, 184, 0.2)" stroke-width="1" />
  <text x="314" y="202" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600" fill="#C084FC">🎨 Canva</text>

  <!-- Chrome Badge -->
  <rect x="380" y="186" width="78" height="24" rx="6" fill="rgba(30, 41, 59, 0.8)" stroke="rgba(148, 163, 184, 0.2)" stroke-width="1" />
  <text x="390" y="202" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600" fill="#4ADE80">🌐 Chrome</text>

  <!-- Gloo AI + YouVersion Badge -->
  <rect x="220" y="218" width="238" height="22" rx="6" fill="rgba(139, 92, 246, 0.15)" stroke="rgba(167, 139, 250, 0.3)" stroke-width="1" />
  <text x="230" y="233" font-family="Inter, system-ui, sans-serif" font-size="10" font-weight="600" fill="#DDD6FE">Powered by Gloo AI Engine &amp; YouVersion API</text>
</svg>`;

const svgPath = path.join(process.cwd(), 'public', 'presence-thumbnail-560x280.svg');
fs.writeFileSync(svgPath, svgThumbnail, 'utf-8');
console.log('✅ 560x280 Thumbnail SVG generated at:', svgPath);
