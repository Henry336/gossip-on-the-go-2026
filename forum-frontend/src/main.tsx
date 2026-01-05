import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx' // NTS: <--- It imports App
//import Practice from './Practice.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App/> {/* <--- NTS: It renders App */}
  </StrictMode>,
)
