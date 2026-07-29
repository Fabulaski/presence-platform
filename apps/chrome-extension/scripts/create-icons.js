import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Valid 16x16 base64 PNG icon (Purple Presence badge)
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAQSURBVDhPY2AYBaNgFGAAGAABBAABw9n7zAAAAABJRU5ErkJggg==';
const buffer = Buffer.from(base64Png, 'base64');

fs.writeFileSync(path.join(iconDir, 'icon16.png'), buffer);
fs.writeFileSync(path.join(iconDir, 'icon48.png'), buffer);
fs.writeFileSync(path.join(iconDir, 'icon128.png'), buffer);

console.log('✅ Extension icons created successfully in apps/chrome-extension/public/icons/');
