import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import './base.css'
import { PlatformHome } from './PlatformHome'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformHome />
  </StrictMode>,
)
