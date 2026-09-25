import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ResetPassword() {
  const { user, changePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  if (!user && message) return <Navigate to="/login" replace />
  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (password.length < 8) return setError('Use at least 8 characters.')
    const { error: updateError } = await changePassword(password)
    if (updateError) setError(updateError.message)
    else setMessage('Password updated. Redirecting to sign in…')
  }
  return <section className="auth-complete"><span className="eyebrow">Account security</span><h1>Choose a new password.</h1><form className="reset-form" onSubmit={submit}><label><span>New password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="8" required /></label>{error && <div className="auth-error">{error}</div>}{message && <div className="auth-success">{message}</div>}<button className="button dark">Update password</button></form></section>
}
