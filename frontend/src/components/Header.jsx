// src/components/Header.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/xorpic.png";

// Same key we used elsewhere to store JWT
const TOKEN_KEY = "xoroj.jwt";

// Minimal JWT decoder (no crypto; just base64url decode to read payload)
function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Header() {
  const navigate = useNavigate();

  // theme
  const [theme, setTheme] = useState("light");

  // auth & user
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [profile, setProfile] = useState(null); // optional pretty-name from server
  const username = useMemo(() => {
    if (!token) return null;
    const payload = parseJwt(token);
    // your JWT subject is the username (see JWTService.subject(username)) :contentReference[oaicite:2]{index=2}
    return payload?.sub || null;
  }, [token]);

  // theme boot
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  // load profile (nice display name), only if logged in
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!username || !token) {
        setProfile(null);
        return;
      }
      try {
        // Protected endpoint → must include Authorization: Bearer <token>
        // Your JWTFilter only checks this header. :contentReference[oaicite:3]{index=3}
        const res = await fetch(`/api/profile/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setProfile(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [username, token]);

  const displayName =
    (profile?.firstName || profile?.lastName)
      ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
      : username || "Guest";

  // logout
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    navigate("/login");
  };

  return (
    <header className="navbar bg-base-200 px-6">
      <div className="flex items-center justify-between w-full">
        {/* Left: brand + nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-3xl font-bold flex items-center">
            <img src={logo} alt="XorOJ Logo" className="h-8 w-8 mr-2" />
            XorOJ
          </Link>
          <NavLink to="/problems" className="link link-hover">
            Problems
          </NavLink>
          <NavLink to="/contests" className="link link-hover">
            Contest
          </NavLink>
        </div>

        {/* Right: theme + auth */}
        <div className="flex items-center gap-4">
          <button className="btn btn-primary" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>

          {username ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn m-1">
                {displayName}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-sm border border-gray-100"
              >
                {/* Your router expects /profile/:username */} {/* :contentReference[oaicite:4]{index=4} */}
                <li>
                  <Link to={`/profile/${username}`}>Profile</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
