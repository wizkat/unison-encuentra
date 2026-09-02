import { SupabaseAuthProvider } from '@/adapters/supabase/auth-provider'
import { supabase } from '@/adapters/supabase/client'
import type { AuthProvider, Session } from '@/ports'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface SessionState {
  session: Session | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionState | null>(null)

export const SessionProvider = ({
  children,
  auth,
}: {
  children: ReactNode
  auth?: AuthProvider
}) => {
  const provider = useMemo(() => auth ?? new SupabaseAuthProvider(supabase), [auth])

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const unsubscribe = provider.onSessionChange(
      (result) => {
        if (!active) return
        setSession(result)
        setLoading(false)
      },
      (e) => {
        if (!active) return
        setError(e.message)
        setLoading(false)
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [provider])

  const value: SessionState = {
    session,
    loading,
    error,
    signIn: async () => {
      setError(null)
      try {
        await provider.signIn()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No logramos iniciar sesión')
      }
    },
    signOut: async () => {
      await provider.signOut()
      setSession(null)
      setError(null)
    },
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export const useSession = () => {
  const state = useContext(SessionContext)
  if (!state) throw new Error('useSession necesita estar dentro de <SessionProvider>')
  return state
}