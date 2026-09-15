const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e40af" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background with smooth rounded corners -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Stethoscope / Medical Pulse Icon Graphics -->
  <g filter="url(#glow)">
    <!-- White Circle Accent -->
    <circle cx="256" cy="256" r="176" stroke="#ffffff" stroke-width="8" stroke-opacity="0.2" fill="none" />

    <!-- Pulse ECG Line Background -->
    <path d="M120 256 H190 L215 190 L245 320 L275 220 L295 280 L315 256 H392"
      stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.3" fill="none" />

    <!-- Stethoscope Tube & Head -->
    <!-- Earpieces -->
    <path d="M190 140 C190 200, 220 230, 256 230 C292 230, 322 200, 322 140"
      stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none" />
    
    <!-- Eartips -->
    <circle cx="190" cy="135" r="14" fill="#ffffff" />
    <circle cx="322" cy="135" r="14" fill="#ffffff" />

    <!-- Central Tube down to Chestpiece -->
    <path d="M256 230 V310 C256 360, 310 390, 350 360 C370 345, 370 310, 350 290 C330 270, 290 280, 290 320"
      stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none" />

    <!-- Chestpiece / Bell -->
    <circle cx="290" cy="330" r="28" fill="#ffffff" />
    <circle cx="290" cy="330" r="16" fill="#2563eb" />
  </g>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  const svgBuffer = Buffer.from(svgIcon);

  // 1. Save SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgBuffer);
  console.log('Saved public/icon.svg');

  // 2. Generate 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Saved public/icon-192.png');

  // 3. Generate 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Saved public/icon-512.png');

  // 4. Generate 512x512 Maskable PNG with padding
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 37, g: 99, b: 235, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));
  console.log('Saved public/icon-maskable-512.png');

  // 5. Generate Apple Touch Icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Saved public/apple-touch-icon.png');

  // 6. Generate Favicon PNG (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('Saved public/favicon-32x32.png');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
