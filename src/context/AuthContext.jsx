import { createContext, useContext, useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut as firebaseSignOut, updatePassword, updateProfile as updateFirebaseProfile } from 'firebase/auth'
import { firebaseAuth, isFirebaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  const loadProfile = (user) => {
    const [firstName = '', ...lastNames] = (user?.displayName || '').split(' ')
    setProfile(user ? { first_name: firstName, last_name: lastNames.join(' ') } : null)
  }

  useEffect(() => {
    if (!firebaseAuth) return undefined
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setSession(nextUser)
      loadProfile(nextUser)
      setLoading(false)
    })
  }, [])

  const signUp = async ({ email, password, firstName, lastName }) => {
    if (!firebaseAuth) return { error: new Error('Firebase is not configured yet.') }
    try {
      const data = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      await updateFirebaseProfile(data.user, { displayName: `${firstName} ${lastName}`.trim() })
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async ({ email, password }) => {
    if (!firebaseAuth) return { error: new Error('Firebase is not configured yet.') }
    try {
      const data = await signInWithEmailAndPassword(firebaseAuth, email, password)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    if (firebaseAuth) await firebaseSignOut(firebaseAuth)
  }

  const resetPassword = async (email) => {
    if (!firebaseAuth) return { error: new Error('Firebase is not configured yet.') }
    try {
      await sendPasswordResetEmail(firebaseAuth, email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const updateProfile = async (changes) => {
    if (!firebaseAuth || !session) return { error: new Error('You must be logged in.') }
    try {
      await updateFirebaseProfile(session, { displayName: `${changes.first_name} ${changes.last_name}`.trim() })
      loadProfile(session)
      return { data: session, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const changePassword = async (password) => {
    if (!session) return { error: new Error('You must be logged in.') }
    try {
      await updatePassword(session, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const user = session ? { ...session, created_at: session.metadata?.creationTime, user_metadata: profile } : null
  const value = { user, session, profile, loading, configured: isFirebaseConfigured, signUp, signIn, signOut, resetPassword, updateProfile, changePassword }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
