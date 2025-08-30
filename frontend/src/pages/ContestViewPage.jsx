import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from "../api/client";

export default function ContestViewPage() {
  const { id } = useParams()
  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchContest() {
      try {
        const data = await apiFetch(`/api/contests/${id}`)
        setContest(data)
      } catch (err) {
        console.error('Error loading contest', err)
      } finally {
        setLoading(false)
      }
    }
    fetchContest()
  }, [id])

  if (loading) return <div className="p-4">Loading contest...</div>
  if (!contest) return <div className="p-4">Contest not found</div>

  const handleRegister = async () => {
    try {
      await apiFetch(`/api/contests/${id}/register`, { method: 'POST' })
      alert('Successfully registered!')
      navigate(`/contests/${id}`)
    } catch (err) {
      alert('Failed to register')
      console.error(err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{contest.title}</h1>
      <p className="text-gray-600 mb-4">{contest.description}</p>

      <div className="text-sm text-gray-500 mb-4">
        <p>Starts: {new Date(contest.startTime).toLocaleString()}</p>
        <p>Ends: {new Date(contest.endTime).toLocaleString()}</p>
        <p>Status: <span className="font-medium">{contest.status}</span></p>
        <p>Duration: {contest.duration} minutes</p>
      </div>

      {contest.status === 'UPCOMING' && (
        <button
          onClick={handleRegister}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Register
        </button>
      )}
    </div>
  )
}
