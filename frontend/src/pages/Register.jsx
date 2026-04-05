import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.name, form.password)
      navigate('/')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="page" style={{ display: 'flex', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <motion.div
        className="form-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Create Account</h1>
        <p className="subtitle">Join LUXE and start shopping</p>

        {error && <div className="form-error" style={{ textAlign: 'center', marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
          </div>
          <motion.button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} whileTap={{ scale: 0.97 }}>
            {loading ? <><div className="spinner" /> Creating...</> : 'Create Account'}
          </motion.button>
        </form>

        <div className="form-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
