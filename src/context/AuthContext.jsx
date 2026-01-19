import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useUserRole } from '../hooks/useUserRole'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { role: userRole, loading: roleLoading } = useUserRole(user?.id)
  const lastUserRef = useRef(null)

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Session fetch error (may be rate limited):', error.message)
          // Keep existing user if rate limited
          if (lastUserRef.current && error.message?.includes('429')) {
            return
          }
        }
        
        if (mounted) {
          const currentUser = session?.user ?? null
          setUser(currentUser)
          lastUserRef.current = currentUser
          setLoading(false)
        }
      } catch (err) {
        console.warn('Session error:', err)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore token refresh errors - don't log out user
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('Token refresh failed, keeping existing session')
        return
      }
      
      // Only update user if we have a valid session or explicit sign out
      if (event === 'SIGNED_OUT') {
        setUser(null)
        lastUserRef.current = null
      } else if (session?.user) {
        setUser(session.user)
        lastUserRef.current = session.user
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  }

  const value = {
    user,
    loading: loading || roleLoading,
    userRole,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
