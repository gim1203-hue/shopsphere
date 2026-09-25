import { createContext, useContext, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const loadProfile = async (user) => {
    if (!user || !supabase) {
      setProfile(null)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    setProfile(data)
  }

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      loadProfile(data.session?.user)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      loadProfile(nextSession?.user)
      setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signUp = async ({ email, password, firstName, lastName }) => {
    if (!supabase) return { error: new Error('Supabase is not configured yet.') }
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: window.location.origin + window.location.pathname,
      },
    })
  }

  const signIn = async ({ email, password }) => {
    if (!supabase) return { error: new Error('Supabase is not configured yet.') }
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
  }

  const resetPassword = async (email) => {
    if (!supabase) return { error: new Error('Supabase is not configured yet.') }
    return supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${window.location.pathname}#/reset-password` })
  }

  const updateProfile = async (changes) => {
    if (!supabase || !session?.user) return { error: new Error('You must be logged in.') }
    const { data, error } = await supabase.from('profiles').update(changes).eq('id', session.user.id).select().single()
    if (!error) setProfile(data)
    return { data, error }
  }

  const value = { user: session?.user ?? null, session, profile, loading, configured: isSupabaseConfigured, signUp, signIn, signOut, resetPassword, updateProfile }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
