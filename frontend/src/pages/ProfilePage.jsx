import { useEffect, useMemo, useState } from "react";
import { useParams, Link, NavLink } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/profile/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);


  // Derived display fields with safe fallbacks
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

  const navLinkClass =
    "px-3 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition";
  const navLinkActive = ({ isActive }) =>
    `${navLinkClass} ${isActive ? "bg-base-200" : ""}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4">
        {/* Loading / Error */}
        {loading && (
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-5xl mx-auto">
            <p className="text-red-500">Error: {error}</p>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="max-w-5xl mx-auto">
            {/* Profile Header */}
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

              {/* Quick info grid */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {infoRow("Email", profile.email)}
                {infoRow("Institute", profile.instituteName || "")}
                {infoRow("Contact", profile.contact || "")}
              </div>
            </section>

            {/* Nav bar */}
            <nav className="mt-6 border-b border-base-300">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <NavLink className={navLinkActive} to={`/profile/${profile.username}/edit`}>
                    Edit
                  </NavLink>
                </li>
                <li>
                  <NavLink className={navLinkActive} to={`/profile/${profile.username}/submissions`}>
                    Submissions
                  </NavLink>
                </li>
                <li>
                  <NavLink className={navLinkActive} to={`/profile/${profile.username}/contest-history`}>
                    Contest History
                  </NavLink>
                </li>
                <li>
                  <NavLink className={navLinkActive} to={`/profile/${profile.username}/problems`}>
                    Problems Created
                  </NavLink>
                </li>
                <li>
                  <NavLink className={navLinkActive} to={`/profile/${profile.username}/hosted`}>
                    Contest Hosted
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* Slot for nested routes / content sections */}
            <section className="mt-6">
              {/* Replace this with <Outlet /> if you use nested routes */}
              <div className="rounded-xl border border-base-300 p-4">
                <p className="text-gray-500">
                  Select a tab above to view details (submissions, contest history, etc.).
                </p>
              </div>
            </section>

            {/* Helpful links/actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/profile/${profile.username}/edit`}
                className="btn btn-primary"
              >
                Edit Profile
              </Link>
              <Link
                to="/contests"
                className="btn"
              >
                Browse Contests
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
