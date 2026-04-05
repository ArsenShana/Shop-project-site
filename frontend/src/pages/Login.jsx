import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/')
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
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your account</p>

        {error && <div className="form-error" style={{ textAlign: 'center', marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
          </div>
          <motion.button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} whileTap={{ scale: 0.97 }}>
            {loading ? <><div className="spinner" /> Signing in...</> : 'Sign In'}
          </motion.button>
        </form>

        <div className="form-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text)' }}>Demo accounts:</strong><br />
          Admin: admin@shop.com / admin123<br />
          User: user@shop.com / user123
        </div>
      </motion.div>
    </motion.div>
  )
}
