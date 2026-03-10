import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { appStore } from './app/store'
import { Toaster } from './components/ui/sonner'

// store.js already calls initializeApp() which hydrates auth state via
// authApi.endpoints.loadUser. We do NOT also call useLoadUserQuery() here
// because that would hit the /profile endpoint twice on every page load.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={appStore}>
      <App />
      <Toaster />
    </Provider>
  </StrictMode>,
)