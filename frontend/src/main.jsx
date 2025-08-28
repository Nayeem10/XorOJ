import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import './index.css'

import HomePage from './pages/HomePage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CFProblemPage from './pages/CFProblemPage.jsx'
import CreateProblemPage from './pages/CreateProblemPage.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/profile/:username",
    element: <ProfilePage />
  },
  {
    path: "/problems",
    element: <div>Problems Page - To be implemented</div>
  }, 
  {
    path: "/problems/cf/:id",
    element: <CFProblemPage />
  },
  {
    path: "/create-problem",
    element: <CreateProblemPage />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
