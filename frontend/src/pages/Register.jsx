import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ username: '', password: '', email: '', firstName: '', lastName: '' })
  const [err, setErr] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setErr(null)
    try {
      await register(f)
      nav('/')
    } catch (e) {
      setErr(e.message || 'Registration failed')
    }
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      {err && <p className="text-red-600 mb-2">{err}</p>}
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="input input-bordered" placeholder="Username" value={f.username} onChange={e => setF({ ...f, username: e.target.value })} />
        <input className="input input-bordered" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input input-bordered" placeholder="First name" value={f.firstName} onChange={e => setF({ ...f, firstName: e.target.value })} />
          <input className="input input-bordered" placeholder="Last name" value={f.lastName} onChange={e => setF({ ...f, lastName: e.target.value })} />
        </div>
        <input className="input input-bordered" placeholder="Password" type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
        <button className="btn btn-primary">Create account</button>
      </form>
      <p className="mt-3 text-sm">Already have an account? <Link to="/login" className="link">Login</Link></p>
    </main>
  )
}
