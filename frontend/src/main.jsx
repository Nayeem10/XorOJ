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

// Author Pages
import AuthorPage from './pages/AuthorPage.jsx'
import AuthorMyProblems from './pages/AuthorMyProblems.jsx'
import AuthorMyContests from './pages/AuthorMyContests.jsx'

// Contest Pages
import ContestListPage from './pages/ContestListPage.jsx'
import ContestViewPage from './pages/ContestViewPage.jsx'
import ContestMySubmissionsPage from './pages/ContestMySubmissionsPage.jsx'
import ContestAllSubmissionsPage from './pages/ContestAllSubmissionsPage.jsx'
import ContestStandingsPage from "./pages/ContestStandingsPage.jsx";

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
      { path: 'author/problems', element: <AuthorMyProblems /> },
      { path: 'author/contests', element: <AuthorMyContests /> }, 

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
      { path: 'contests/:id/standings', element: <ContestStandingsPage /> } 
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
