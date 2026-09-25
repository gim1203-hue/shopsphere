import { ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { user, signUp, configured } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/account" replace />
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.')
    if (form.password !== form.confirm) return setError('The passwords do not match.')
    setBusy(true)
    const { error: authError } = await signUp(form)
    setBusy(false)
    if (authError) setError(authError.message)
    else setComplete(true)
  }
  if (complete) return <section className="auth-complete"><div className="success-mark"><Check /></div><span className="eyebrow">Almost there</span><h1>Check your inbox.</h1><p>We sent a confirmation link to <strong>{form.email}</strong>. Confirm your email, then return to sign in.</p><Link className="button dark" to="/login">Go to sign in <ArrowRight size={17} /></Link></section>

  return <section className="auth-page signup-page"><div className="auth-panel"><span className="eyebrow">Join ShopSphere</span><h1>Create your account.</h1><p>Save favorites, keep your bag across devices, and view your orders.</p>{!configured && <div className="config-notice"><strong>Account setup required</strong><span>Add your Supabase project values to the environment to enable live registration.</span></div>}<form onSubmit={submit}><div className="form-row"><label><span>First name</span><input name="firstName" value={form.firstName} onChange={update} autoComplete="given-name" required /></label><label><span>Last name</span><input name="lastName" value={form.lastName} onChange={update} autoComplete="family-name" required /></label></div><label><span>Email address</span><input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label><label><span>Password</span><input name="password" type="password" value={form.password} onChange={update} autoComplete="new-password" minLength="8" required /><small>At least 8 characters</small></label><label><span>Confirm password</span><input name="confirm" type="password" value={form.confirm} onChange={update} autoComplete="new-password" required /></label>{error && <div className="auth-error" role="alert">{error}</div>}<button className="button dark auth-submit" disabled={busy || !configured}>{busy ? 'Creating account…' : <>Create account <ArrowRight size={17} /></>}</button></form><div className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></div></div><div className="auth-visual signup-visual"><img src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=85" alt="Beautifully styled living room" /></div></section>
}
