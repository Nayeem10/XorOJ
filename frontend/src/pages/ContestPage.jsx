import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { apiFetch } from "../api/client";

export default function ContestPage() {
  const { id } = useParams()
  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchContest() {
      try {
        const data = await apiFetch(`/api/contests/${id}`)
        // Require registration + contest started
        if (!data.registered) {
          alert('You must register for this contest.')
          navigate(`/contests/${id}/view`)
          return
        }
        if (data.status !== 'RUNNING') {
          alert('Contest has not started yet.')
          navigate(`/contests/${id}/view`)
          return
        }
        setContest(data)
      } catch (err) {
        console.error('Error loading contest', err)
      } finally {
        setLoading(false)
      }
    }
    fetchContest()
  }, [id, navigate])

  if (loading) return <div className="p-4">Loading contest...</div>
  if (!contest) return <div className="p-4">Contest not found</div>

  return (
    <div className="p-6">
      
      <h1 className="text-2xl font-bold mb-2">{contest.title}</h1>
      <p className="text-gray-600 mb-4">{contest.description}</p>

      <h2 className="text-xl font-semibold mb-2">Problems</h2>
      <ul className="list-disc list-inside mb-4">
        {contest.problems?.map(p => (
          <li key={p.id}>
            <Link to={`/problems/${p.id}`} className="text-blue-600 hover:underline">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex gap-3">
        <Link
          to={`/contests/${contest.id}/my-submissions`}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          My Submissions
        </Link>
        <Link
          to={`/contests/${contest.id}/submissions`}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          All Submissions
        </Link>
        <Link
          to={`/contests/${contest.id}/standings`}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Standings
        </Link>
      </div>
    </div>
  )
}
