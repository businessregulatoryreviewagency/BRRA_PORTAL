import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useUserRole = (userId) => {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setRole('user')
          } else {
            throw error
          }
        } else {
          setRole(data.role)
        }
      } catch (err) {
        setError(err.message)
        setRole('user')
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()

    const subscription = supabase
      .channel('user_role_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_roles',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.new) {
          setRole(payload.new.role)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  return { role, loading, error }
}
