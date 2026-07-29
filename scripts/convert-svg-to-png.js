import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const svgPath = path.join(process.cwd(), 'public', 'icons', 'presence-icon.svg');
const svgRaw = fs.readFileSync(svgPath, 'utf-8');

// Convert SVG to data URI
const svgBase64 = Buffer.from(svgRaw).toString('base64');
const dataUri = `data:image/svg+xml;base64,${svgBase64}`;

// Generate HTML page with canvas renderer to produce PNG data URLs
const html = `<!DOCTYPE html>
<html>
<body>
<canvas id="c"></canvas>
<script>
async function renderPNG(size) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById('c');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = "${dataUri}";
  });
}
window.renderPNG = renderPNG;
</script>
</body>
</html>`;

const tempHtmlPath = path.join(process.cwd(), 'scripts', 'temp_render.html');
fs.writeFileSync(tempHtmlPath, html, 'utf-8');

console.log('✅ Temporary rendering HTML created:', tempHtmlPath);
