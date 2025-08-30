import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContestCard from "../components/ContestCard.jsx";

export default function ContestListPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContests() {
      try {
        const data = await apiFetch("/api/contests");
        setContests(data);
      } catch (err) {
        console.error("Failed to fetch contests", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContests();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading contests…</p>;

  return (
    <>
    <Header />
    <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Contests</h1>

      {contests.length === 0 ? (
        <p className="text-gray-500">No contests available.</p>
      ) : (
        contests.map((c) => <ContestCard key={c.id} contest={c} />)
      )}
    </div>
    <Footer />
    </>
  );
}
