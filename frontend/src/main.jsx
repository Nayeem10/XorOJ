import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import './index.css'

// Layout
import AppLayout from './layouts/AppLayout.jsx'

// Pages
import HomePage from './pages/HomePage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CreateProblemPage from './pages/CreateProblemPage.jsx'
import ProblemSet from './pages/ProblemSet.jsx'
import ProblemPage from './pages/ProblemPage.jsx'
import AuthorPage from './pages/AuthorPage.jsx'

// Contest Pages
import ContestListPage from './pages/ContestListPage.jsx'
import ContestViewPage from './pages/ContestViewPage.jsx'
import ContestMySubmissionsPage from './pages/ContestMySubmissionsPage.jsx'
import ContestAllSubmissionsPage from './pages/ContestAllSubmissionsPage.jsx'

// Auth Pages
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

// Protected layout wrapper
function ProtectedLayout() {
  const token = localStorage.getItem('xoroj.jwt')
  return token ? <AppLayout /> : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // Everything below shares Header/Footer and is protected
  {
    path: '/',
    element: <ProtectedLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },

      // Author
      { path: 'author', element: <AuthorPage /> },

      // Profile
      { path: 'profile/:username', element: <ProfilePage /> },

      // Problems
      { path: 'problems', element: <ProblemSet /> },
      { path: 'problems/:pid', element: <ProblemPage /> },
      { path: 'create-problem', element: <CreateProblemPage /> },
      
      // Contests
      { path: 'contests', element: <ContestListPage /> },
      { path: 'contests/:id/view', element: <ContestViewPage /> },
      { path: 'contests/:id/problems/:pid', element: <ProblemPage /> },
      { path: 'contests/:id/my', element: <ContestMySubmissionsPage /> },
      { path: 'contests/:id/submissions/:pageNumber', element: <ContestAllSubmissionsPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)
