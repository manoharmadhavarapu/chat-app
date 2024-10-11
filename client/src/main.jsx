import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import UserContextProvider from './components/UserContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <UserContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  </UserContextProvider>
)
