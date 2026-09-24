import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './localization/index.ts'
import './index.css'

import { setupApiClient } from './api-client/index.ts'
import App from './App.tsx'
import { TanstackQueryProvider } from './providers/TanstackQueryProvider.tsx'

setupApiClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TanstackQueryProvider>
      <App />
    </TanstackQueryProvider>
  </StrictMode>,
)
