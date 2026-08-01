import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter} from "react-router-dom";
import App from './App.jsx'
import AuthProvider from './context/AuthContext.jsx';
import "@livekit/components-styles";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
          <App />
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
)
