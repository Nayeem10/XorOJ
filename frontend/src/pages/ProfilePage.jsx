import { useEffect, useMemo, useState } from "react";
import { useParams, NavLink, Outlet, Link, useLocation, data } from "react-router-dom";
import { apiFetch } from "../api/client";

export default function ProfilePage() {
  const { username } = useParams();
  const location = useLocation();

  const initialData = location.state?.profileData || null;

  const [profile, setProfile] = useState(initialData);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiFetch(`/api/profile/${username}`)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

       console.log (data);

    return () => {
      cancelled = true;
    };
  }, [username, initialData]);


  const fullName = useMemo(() => {
    if (!profile) return "";
    const first = profile.firstName || "";
    const last = profile.lastName || "";
    const combined = `${first} ${last}`.trim();
    return combined || profile.username || "User";
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) return "";
    const f = (profile.firstName || "").trim();
    const l = (profile.lastName || "").trim();
    const pick = (s) => (s ? s[0].toUpperCase() : "");
    const res = (pick(f) + pick(l)) || pick(profile.username || "U");
    return res || "U";
  }, [profile]);

  const navLinkClass =
    "px-3 py-2 -mb-px border-b-2 text-sm font-medium transition";
  const navLinkActive = ({ isActive }) =>
    `${navLinkClass} ${
      isActive
        ? "border-indigo-600 text-indigo-600"
        : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
    }`;

  if (loading || !profile) {
    return <p className="p-6">Loading profile…</p>;
  }
  if (error) {
    return <p className="p-6 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <section className="bg-base-200 rounded-2xl p-5 sm:p-6 border border-base-300">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-base-300 grid place-items-center text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{fullName}</h1>
            <p className="text-gray-500">@{profile.username}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <span className="text-sm text-gray-500 block">Email</span>
            <span className="font-medium">{profile.email || "—"}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">Institute</span>
            <span className="font-medium">{profile.instituteName || "—"}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">Contact</span>
            <span className="font-medium">{profile.contact || "—"}</span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="flex gap-4 border-b border-gray-200 mt-6 overflow-x-auto">
        <NavLink className={navLinkActive} to="edit">
          Edit
        </NavLink>
        <NavLink className={navLinkActive} to="submissions">
          Submissions
        </NavLink>
        <NavLink className={navLinkActive} to="contest-history">
          Contest History
        </NavLink>
      </nav>

      {/* Outlet renders child tab component */}
      <Outlet key={profile.id} context={{ profile, setProfile }} />

      {/* External Links */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/author/problems" className="btn">
          Problems Created
        </Link>
        <Link to="/author/contests" className="btn">
          Contests Hosted
        </Link>
      </div>
    </div>
  );
}
