import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logo.svg";

/**
 * Header component for XorOJ
 *
 * Props:
 *  - user: { name: string, avatarUrl?: string }
 *  - onLogout: () => void
 *  - onProfile: () => void
 */

const Header = ({ user, onLogout, onProfile }) => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Get theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <>
      <header className="navbar bg-base-200 px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <a href="/" className="text-3xl font-bold flex items-center">
              <img src={logo} alt="XorOJ Logo" className="h-8 w-8 mr-2" />
              XorOJ
            </a>
            <a href="/problems" className="link link-hover">Problems</a>
            <a href="/contest" className="link link-hover">Contest</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="btn btn-primary" onClick={toggleTheme}>
              {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn m-1">{user?.name}</div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm border border-gray-100"
              >
                <li><a href="/profile">Profile</a></li>
                <li><a onClick={onLogout}>Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </header>
    </>
  )

}

export default Header;