import { ArrowRight, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, signIn, resetPassword, configured } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  if (user) return <Navigate to="/account" replace />

  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true)
    const { error: authError } = await signIn(form)
    setBusy(false)
    if (authError) setError(authError.message)
    else navigate(location.state?.from || '/account', { replace: true })
  }
  const forgot = async () => {
    if (!form.email) return setError('Enter your email address first.')
    setBusy(true); setError('')
    const { error: resetError } = await resetPassword(form.email)
    setBusy(false)
    if (resetError) setError(resetError.message)
    else setMessage('Check your inbox for a password reset link.')
  }

  return <section className="auth-page"><div className="auth-panel"><span className="eyebrow">Welcome back</span><h1>Sign in.</h1><p>Access your saved pieces, profile, and order history.</p>{!configured && <div className="config-notice"><strong>Account setup required</strong><span>Add your Firebase project values to the environment to enable live accounts.</span></div>}<form onSubmit={submit}><label><span>Email address</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required /></label><label><span>Password</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" minLength="8" required /></label>{error && <div className="auth-error" role="alert">{error}</div>}{message && <div className="auth-success" role="status">{message}</div>}<button className="button dark auth-submit" disabled={busy || !configured}>{busy ? 'Signing in…' : <>Sign in <ArrowRight size={17} /></>}</button><button type="button" className="forgot-button" onClick={forgot} disabled={busy || !configured}>Forgot your password?</button></form><div className="auth-switch">New to ShopSphere? <Link to="/signup">Create an account</Link></div><div className="auth-secure"><LockKeyhole size={15} /> Your account is secured by Firebase Auth.</div></div><div className="auth-visual"><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85" alt="Calm, considered interior" /></div></section>
}
