import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import './index.css'

import HomePage from './pages/HomePage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CreateProblemPage from './pages/CreateProblemPage.jsx'

// NEW
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

// ProtectedRoute
function Protected({ element }) {
  const token = localStorage.getItem('xoroj.jwt')
  return token ? element : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  { path: '/', element: <Protected element={<HomePage />} />, errorElement: <ErrorPage /> },
  { path: '/profile/:username', element: <Protected element={<ProfilePage />} /> },

  { path: '/problems', element: <Protected element={<div>Problems Page - To be implemented</div>} /> },
  { path: '/create-problem', element: <Protected element={<CreateProblemPage />} /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
