import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(params.get('reason') === 'unauthorized' ? 'Username or password is incorrect' : null)

  async function onSubmit(e) {
    e.preventDefault()
    setErr(null)
    try {
      await login(username, password)
      nav('/')
    } catch (e) {
      setErr(e.message || 'Login failed')
    }
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      {err && <p className="text-red-600 mb-2">{err}</p>}
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="input input-bordered" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="input input-bordered" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn btn-primary">Sign in</button>
      </form>
      <p className="mt-3 text-sm">No account? <Link to="/register" className="link">Register</Link></p>
    </main>
  )
}
