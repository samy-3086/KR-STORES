import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isConfigured } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true
  })

  useEffect(() => {
    // Skip auth setup if Supabase not configured
    if (!isConfigured) {
      setAuthState(prev => ({ ...prev, loading: false }))
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({ ...prev, session, user: session?.user ?? null }))
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({ ...prev, session, user: session?.user ?? null }))
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setAuthState(prev => ({ ...prev, profile: null, loading: false }))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
        return
      }

      setAuthState(prev => ({ ...prev, profile, loading: false }))
    } catch (error) {
      console.error('Error fetching profile:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  const signUp = async (email: string, password: string, fullName: string, phone?: string, address?: string) => {
    if (!isConfigured) {
      return { data: null, error: { message: 'Demo mode - Supabase not configured' } }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            address
          }
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      return { data: null, error: { message: 'Demo mode - Supabase not configured' } }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user) return { error: 'No user logged in' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', authState.user.id)
        .select()
        .single()

      if (error) throw error

      setAuthState(prev => ({ ...prev, profile: data }))
      return { data, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  }

  return {
    ...authState,
    signUp,
    signIn,
    logout: signOut,
    updateProfile,
    isAdmin: authState.profile?.role === 'admin'
  }
}