import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig, type Plugin } from 'vitest/config'
import { execSync } from 'node:child_process'
import exam from './src/content/exam.json' with { type: 'json' }
import { en } from './src/i18n/en.ts'
import { de } from './src/i18n/de.ts'

// Install name, description and page title come from src/content/exam.json, in its default language.
const copy = exam.defaultLang === 'de' ? de : en
const appTitle = copy.meta.title(exam.appName)
const appDescription = copy.meta.description(exam.code)

/** Short commit of this build: shown in feedback issues, so a report names the exact version it came from. */
function appVersion(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || 'dev'
  } catch {
    return 'dev'
  }
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Fills the __APP_…__ placeholders in index.html from exam.json. */
function examHtml(): Plugin {
  const values: Record<string, string> = {
    __APP_LANG__: exam.defaultLang,
    __APP_TITLE__: appTitle,
    __APP_SHORT_NAME__: exam.shortName,
    __APP_DESCRIPTION__: appDescription,
  }
  return {
    name: 'exam-html',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace(/__APP_[A-Z_]+__/g, (key) => escapeHtml(values[key] ?? key)),
    },
  }
}

// Relative base so the build works from any static host or sub-path (hash routing), e.g. GitHub Pages.
// The dev server keeps one fixed address so the locally stored progress (localStorage is per origin) stays put.
export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(appVersion()) },
  plugins: [
    examHtml(),
    react(),
    // Installable app with offline support. Production builds only; the site still works as a normal web page.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        id: './',
        name: exam.appName,
        short_name: exam.shortName,
        description: appDescription,
        lang: exam.defaultLang,
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f5f5f5',
        theme_color: '#ffffff',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // The plugin adds the manifest itself; the glob already covers the icons.
      includeManifestIcons: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // A full exam's lessons and questions ship in one bundle and the flashcards in another; both can outgrow
        // Workbox's 2 MiB default, so the limit leaves room for the content to grow.
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    // Lessons and questions ship in the main bundle on purpose (offline, no loading states); a full exam's content
    // runs to a few MB, so the warning threshold sits above that.
    chunkSizeWarningLimit: 4096,
    rolldownOptions: {
      output: {
        // The flashcards (four options with reasons each) get their own file, so the main bundle stays lean.
        advancedChunks: { groups: [{ name: 'zettel-cards', test: /src[\\/]content[\\/]cards[\\/]/ }] },
      },
    },
  },
  server: { port: 5173, strictPort: true },
  // The preview serves the production build with its offline service worker, so it gets its own address:
  // a service worker on 5173 would otherwise keep answering for the dev server.
  preview: { port: 4173, strictPort: true },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    // Node's experimental global localStorage warns in node-environment tests; jsdom tests bring their own.
    execArgv: ['--no-experimental-webstorage'],
  },
})
