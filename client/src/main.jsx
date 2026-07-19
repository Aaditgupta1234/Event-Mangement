import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'

const basename = import.meta.env.VITE_APP_BASENAME || ''

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={basename}>
    <AuthProvider>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </AuthProvider>
  </BrowserRouter>
)
