import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Cache to store roles and prevent excessive API calls
const roleCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useUserRole = (userId) => {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Check cache first
    const cached = roleCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setRole(cached.role)
      setLoading(false)
      return
    }

    // Prevent duplicate fetches
    if (fetchedRef.current) {
      return
    }
    fetchedRef.current = true

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            const defaultRole = 'user'
            setRole(defaultRole)
            roleCache.set(userId, { role: defaultRole, timestamp: Date.now() })
          } else {
            throw error
          }
        } else {
          setRole(data.role)
          roleCache.set(userId, { role: data.role, timestamp: Date.now() })
        }
      } catch (err) {
        console.error('Error fetching role:', err)
        setError(err.message)
        const defaultRole = 'user'
        setRole(defaultRole)
        roleCache.set(userId, { role: defaultRole, timestamp: Date.now() })
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()

    const subscription = supabase
      .channel(`user_role_changes_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_roles',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.new) {
          setRole(payload.new.role)
          roleCache.set(userId, { role: payload.new.role, timestamp: Date.now() })
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
      fetchedRef.current = false
    }
  }, [userId])

  return { role, loading, error }
}
