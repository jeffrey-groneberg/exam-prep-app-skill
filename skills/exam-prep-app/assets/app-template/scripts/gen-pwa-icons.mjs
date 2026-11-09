// Renders the app icons (home screen, install dialog) and public/favicon.svg from the badge in src/content/exam.json.
// Usage: npm run icons:pwa (needs Playwright's Chromium: npx playwright install chromium). Writes public/; commit the files.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import exam from '../src/content/exam.json' with { type: 'json' }

const out = fileURLToPath(new URL('../public/icons/', import.meta.url))
mkdirSync(out, { recursive: true })

const FONT = 'Segoe UI, system-ui, -apple-system, Helvetica, Arial, sans-serif'
const BADGE = exam.badge
const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** Longer badges get a smaller font so they keep inside the square. */
const fit = (scale) => scale * Math.min(1, 3 / Math.max(3, [...BADGE].length))

/** Brand square with the badge; the text is optically centred (cap height ≈ 0.71 em). */
function mark({ size, radius, fontScale }) {
  const fontSize = size * fit(fontScale)
  const baseline = size / 2 + fontSize * 0.355
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#0f6cbd"/>
  <text x="${size / 2}" y="${baseline}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" font-weight="700" fill="#fff">${escapeXml(BADGE)}</text>
</svg>`
}

// The favicon is the 32px mark of the header.
writeFileSync(
  fileURLToPath(new URL('../public/favicon.svg', import.meta.url)),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0f6cbd"/><text x="16" y="21" text-anchor="middle" font-family="${FONT}" font-size="${+(12.5 * Math.min(1, 3 / Math.max(3, [...BADGE].length))).toFixed(2)}" font-weight="700" fill="#fff">${escapeXml(BADGE)}</text></svg>\n`,
)
console.log('wrote public/favicon.svg')

const icons = [
  // Regular icons keep the favicon's rounded square on a transparent background.
  { file: 'icon-192.png', size: 192, radius: (192 * 7) / 32, fontScale: 0.39 },
  { file: 'icon-512.png', size: 512, radius: (512 * 7) / 32, fontScale: 0.39 },
  // Maskable: full bleed, text inside the 80 % safe zone so any launcher mask keeps it whole.
  { file: 'icon-maskable-512.png', size: 512, radius: 0, fontScale: 0.3 },
  // iOS rounds the corners itself and needs an opaque square.
  { file: 'apple-touch-icon.png', size: 180, radius: 0, fontScale: 0.35 },
]

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 1 })
for (const icon of icons) {
  await page.setViewportSize({ width: icon.size, height: icon.size })
  await page.setContent(`<html><body style="margin:0;background:transparent">${mark(icon)}</body></html>`)
  await page.locator('svg').screenshot({ path: out + icon.file, omitBackground: true })
  console.log(`wrote public/icons/${icon.file}`)
}
await browser.close()
