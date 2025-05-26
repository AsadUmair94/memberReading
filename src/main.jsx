import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider, googleLogout, useGoogleLogin } from '@react-oauth/google';
const clientId = '842578802809-p2fjcemkeeqksc8nn6lope2tgr2sfps7.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <GoogleOAuthProvider clientId={clientId}>
    <App />
  </GoogleOAuthProvider>
  // </StrictMode>,
)
