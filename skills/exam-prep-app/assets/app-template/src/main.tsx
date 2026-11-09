import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource-variable/cascadia-code'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/content.css'
import './styles/pages.css'
import './styles/zettel.css'
import { App } from './App.tsx'

// Installed as an app (home screen or desktop), ask the browser to keep the locally stored progress
// instead of clearing it when the device runs low on space.
const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone
if (standalone) void navigator.storage?.persist?.()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
