import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";
import { apiFetch } from "../api/client";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function ContestViewPage() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Fetch contest details
    apiFetch(`/api/contests/${id}/details`)
      .then((data) => {
        if (cancelled) return; // Ensure no state updates if the component is unmounted

        setContest(data); // Update the contest state with fetched data
        setLoading(false); // Stop loading state
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message); // Capture the error if request fails
          setLoading(false); // Stop loading state
        }
      });

    return () => { cancelled = true; }; // Set cancelled to true when the component is unmounted
  }, [id]);

  if (loading) return <p className="text-center mt-6">Loading contest…</p>;
  if (error || !contest) return <p className="text-red-500 text-center mt-6">Error: {error || "Not found"}</p>;

  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);

  // Contest not started yet
  if (now < startTime) {
    return (
      <>
        <div className="max-w-6xl mx-auto mt-6 px-4">
          <p className="text-gray-500">Contest has not started yet.</p>
          <Link to={`/contests`} className="btn mt-2">Back to Contests</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
        {/* Contest Header */}
        <Card>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{contest.title}</h1>
            <CountdownTimer startTime={endTime} />
          </div>
          {contest.description && <p className="mt-2">{contest.description}</p>}
        </Card>

        {/* Problems */}
        {contest.problems && contest.problems.length > 0 && (
          <Card title="Problems">
            <ul className="list-decimal pl-5">
              {contest.problems.map((p) => (
                <li key={p.id}>
                  <Link to={`/contests/${id}/problems/${p.id}`} className="text-indigo-600">{p.title}</Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Tabs */}
        <Card title="My Submissions"> 
          <Link to={`/contests/${id}/my`} className="text-indigo-600 hover:underline">
            View My Submissions
          </Link>
        </Card>

        <Card title="All Submissions">
          <Link
            to={`/contests/${id}/submissions/1`} // Always go to page 1 by default
            className="text-indigo-600 hover:underline"
          >
            View All Submissions
          </Link>
        </Card>


        <Card title="Standings">
          <Link to={`/contests/${id}/standings`} className="text-indigo-600 hover:underline">
            View Standings
          </Link>
        </Card>

        <Link to={`/contests`} className="btn btn-secondary mt-4">Back to Contests</Link>
      </div>
    </>
  );
}
