import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import './index.css'

// Pages
import HomePage from './pages/HomePage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CreateProblemPage from './pages/CreateProblemPage.jsx'
import ProblemSet from './pages/ProblemSet.jsx'
import ProblemPage from './pages/ProblemPage.jsx'

// Contest Pages
import ContestListPage from './pages/ContestListPage.jsx'
import ContestViewPage from './pages/ContestViewPage.jsx'
import ContestMySubmissionsPage from './pages/ContestMySubmissionsPage.jsx'
import ContestAllSubmissionsPage from './pages/ContestAllSubmissionsPage.jsx'

// Auth Pages
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

// ProtectedRoute component
function Protected({ element }) {
  const token = localStorage.getItem('xoroj.jwt')
  return token ? element : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // Protected routes
  { path: '/', element: <Protected element={<HomePage />} />, errorElement: <ErrorPage /> },
  { path: '/profile/:username', element: <Protected element={<ProfilePage />} /> },

  // Problem routes
  { path: '/problems', element: <Protected element={<ProblemSet />} /> },
  { path: '/problems/:id', element: <Protected element={<ProblemPage />} /> },
  { path: '/create-problem', element: <Protected element={<CreateProblemPage />} /> },

  // Contest routes
  { path: '/contests', element: <Protected element={<ContestListPage />} /> },
  { path: '/contests/:id/view', element: <Protected element={<ContestViewPage />} /> },
  { path: '/contests/:id/my-submissions', element: <Protected element={<ContestMySubmissionsPage />} /> },
  { path: '/contests/:id/submissions', element: <Protected element={<ContestAllSubmissionsPage />} /> },

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)
