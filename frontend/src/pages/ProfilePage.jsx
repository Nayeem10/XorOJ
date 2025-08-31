import { useEffect, useMemo, useState } from "react";
import { useParams, Link, NavLink } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiFetch } from "../api/client";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    apiFetch(`/api/profile/${username}`)
      .then((data) => { if (!cancelled) setProfile(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [username]);

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

  const infoRow = (label, value) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
      <span className="text-sm text-gray-500 w-40">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );

  const navLinkClass = "px-3 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition";
  const navLinkActive = ({ isActive }) => `${navLinkClass} ${isActive ? "bg-base-200" : ""}`;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-4">
        {loading && <div className="max-w-5xl mx-auto">Loading…</div>}
        {error && <div className="max-w-5xl mx-auto text-red-500">Error: {error}</div>}
        {!loading && !error && profile && (
          <div className="max-w-5xl mx-auto">
            <section className="bg-base-200 rounded-2xl p-5 sm:p-6 border border-base-300">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-base-300 grid place-items-center text-2xl font-bold">{initials}</div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{fullName}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {infoRow("Email", profile.email)}
                {infoRow("Institute", profile.instituteName || "")}
                {infoRow("Contact", profile.contact || "")}
              </div>
            </section>
            <nav className="mt-6 border-b border-base-300">
              <ul className="flex flex-wrap gap-2">
                <li><NavLink className={navLinkActive} to={`/profile/${profile.username}/edit`}>Edit</NavLink></li>
                <li><NavLink className={navLinkActive} to={`/profile/${profile.username}/submissions`}>Submissions</NavLink></li>
                <li><NavLink className={navLinkActive} to={`/profile/${profile.username}/contest-history`}>Contest History</NavLink></li>
                <li><NavLink className={navLinkActive} to={`/profile/${profile.username}/problems`}>Problems Created</NavLink></li>
                <li><NavLink className={navLinkActive} to={`/profile/${profile.username}/hosted`}>Contest Hosted</NavLink></li>
              </ul>
            </nav>
            <section className="mt-6">
              <div className="rounded-xl border border-base-300 p-4">
                <p className="text-gray-500">Select a tab above to view details.</p>
              </div>
            </section>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/profile/${profile.username}/edit`} className="btn btn-primary">Edit Profile</Link>
              <Link to="/contests" className="btn">Browse Contests</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}