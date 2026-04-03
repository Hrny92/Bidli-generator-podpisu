// Generuje PNG ikony pro email podpis
// Spusť: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../public/images/icons')
mkdirSync(OUT_DIR, { recursive: true })

const RENDER_SIZE = 28  // nativní 28×28 — přesná shoda s HTML width/height
const COLORS = { blue: '#142F4C', black: '#000000' }

function getIcon(key, c, s) {
  const icons = {
    linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="11" fill="#fff" stroke="${c}" stroke-width="1.5"/>
      <rect x="8" y="12" width="2.5" height="8" fill="${c}"/>
      <circle cx="9.25" cy="9.75" r="1.5" fill="${c}"/>
      <path fill="${c}" d="M13.5 12h2.3v1.1c.4-.7 1.2-1.3 2.4-1.3 2.3 0 2.8 1.5 2.8 3.5V20h-2.5v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V20h-2.5V12z"/>
    </svg>`,
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="11" fill="#fff" stroke="${c}" stroke-width="1.5"/>
      <path fill="${c}" d="M15.5 9H17V7h-2c-2 0-3 1.3-3 3v1.5H10V14h2v8h2.5v-8h2l.5-2.5h-2.5V10c0-.3.2-.5.5-.5h.5z"/>
    </svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="11" fill="#fff" stroke="${c}" stroke-width="1.5"/>
      <rect x="8" y="8" width="12" height="12" rx="3.5" fill="none" stroke="${c}" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="3" fill="none" stroke="${c}" stroke-width="1.5"/>
      <circle cx="18.2" cy="9.8" r="1" fill="${c}"/>
    </svg>`,
    youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="11" fill="#fff" stroke="${c}" stroke-width="1.5"/>
      <path fill="${c}" d="M22 14s0-2.8-.4-4.2a2 2 0 00-1.4-1.4C18.9 8 14 8 14 8s-4.9 0-6.2.4a2 2 0 00-1.4 1.4C6 11.2 6 14 6 14s0 2.8.4 4.2a2 2 0 001.4 1.4C9.1 20 14 20 14 20s4.9 0 6.2-.4a2 2 0 001.4-1.4C22 16.8 22 14 22 14zm-9.5 3v-6l4.5 3-4.5 3z"/>
    </svg>`,
    tiktok: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="11" fill="#fff" stroke="${c}" stroke-width="1.5"/>
      <path fill="${c}" d="M19.5 10.2a3.8 3.8 0 01-3.8-3.8h-2.3v9c0 1.2-1 2.2-2.2 2.2a2.2 2.2 0 01-2.2-2.2c0-1.2 1-2.2 2.2-2.2.2 0 .4 0 .6.1V10.9a4.7 4.7 0 00-.6 0 4.6 4.6 0 00-4.6 4.6 4.6 4.6 0 004.6 4.6 4.6 4.6 0 004.6-4.6v-5a6.1 6.1 0 003.6 1.2v-2.3a3.8 3.8 0 01-1.9-.2z"/>
    </svg>`,
    website: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="11" fill="#fff" stroke="${c}" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="6.5" fill="none" stroke="${c}" stroke-width="1.3"/>
      <ellipse cx="14" cy="14" rx="2.8" ry="6.5" fill="none" stroke="${c}" stroke-width="1.3"/>
      <line x1="7.5" y1="14" x2="20.5" y2="14" stroke="${c}" stroke-width="1.3"/>
      <line x1="8.5" y1="10.5" x2="19.5" y2="10.5" stroke="${c}" stroke-width="1.3"/>
      <line x1="8.5" y1="17.5" x2="19.5" y2="17.5" stroke="${c}" stroke-width="1.3"/>
    </svg>`,
  }
  return icons[key]
}

const ICONS = ['linkedin', 'facebook', 'instagram', 'youtube', 'tiktok', 'website']

for (const [colorName, color] of Object.entries(COLORS)) {
  for (const key of ICONS) {
    const svg = getIcon(key, color, RENDER_SIZE)
    const outPath = join(OUT_DIR, `${key}-${colorName}.png`)
    await sharp(Buffer.from(svg))
      .resize(RENDER_SIZE, RENDER_SIZE)
      .png()
      .toFile(outPath)
    console.log(`✓ ${key}-${colorName}.png`)
  }
}
console.log('Hotovo!')
