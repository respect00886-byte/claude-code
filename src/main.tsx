import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { requestPersistentStorage } from './lib/storage'
import App from './App'
import './index.css'

// ブラウザに保存データを自動で消さないよう依頼する
void requestPersistentStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
