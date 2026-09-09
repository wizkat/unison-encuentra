import { SupabaseAuthProvider } from '@/adapters/supabase/auth-provider'
import { supabase } from '@/adapters/supabase/client'

import type {
  AuthProvider,
  Session,
} from '@/ports'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface SessionState {
  session: Session | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext =
  createContext<SessionState | null>(null)

export const SessionProvider = ({
  children,
  auth,
}: {
  children: ReactNode
  auth?: AuthProvider
}) => {
  const provider = useMemo(
    () =>
      auth ??
      new SupabaseAuthProvider(supabase),
    [auth],
  )

  const [session, setSession] =
    useState<Session | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    let active = true

    console.log(
      '[SESSION] Inicializando sesión...',
    )

    /*
     * PRIMERO recuperamos la sesión.
     *
     * Esto es muy importante después del callback
     * OAuth de Microsoft.
     */
    const initializeSession = async () => {
      try {
        const currentSession =
          await provider.getSession()

        if (!active) {
          return
        }

        console.log(
          '[SESSION] Sesión inicial:',
          !!currentSession,
        )

        setSession(currentSession)
        setError(null)
      } catch (e) {
        if (!active) {
          return
        }

        const message =
          e instanceof Error
            ? e.message
            : 'No pudimos cargar la sesión'

        console.error(
          '[SESSION] Error inicial:',
          e,
        )

        setSession(null)
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    /*
     * Después escuchamos cambios:
     *
     * SIGNED_IN
     * SIGNED_OUT
     * TOKEN_REFRESHED
     * etc.
     */
    const unsubscribe =
      provider.onSessionChange(
        (result) => {
          if (!active) {
            return
          }

          console.log(
            '[SESSION] Cambio de sesión:',
            !!result,
          )

          setSession(result)
          setError(null)
          setLoading(false)
        },

        (e) => {
          if (!active) {
            return
          }

          console.error(
            '[SESSION] Error de sesión:',
            e,
          )

          setSession(null)
          setError(e.message)
          setLoading(false)
        },
      )

    void initializeSession()

    return () => {
      active = false
      unsubscribe()
    }
  }, [provider])

  const signIn = async () => {
    setError(null)

    try {
      await provider.signIn()
    } catch (e) {
      console.error(
        '[SESSION] Error signIn:',
        e,
      )

      setError(
        e instanceof Error
          ? e.message
          : 'No logramos iniciar sesión',
      )
    }
  }

  const signOut = async () => {
    try {
      await provider.signOut()

      setSession(null)
      setError(null)
    } catch (e) {
      console.error(
        '[SESSION] Error signOut:',
        e,
      )

      setError(
        e instanceof Error
          ? e.message
          : 'No logramos cerrar sesión',
      )
    }
  }

  const value: SessionState = {
    session,
    loading,
    error,
    signIn,
    signOut,
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const state =
    useContext(SessionContext)

  if (!state) {
    throw new Error(
      'useSession necesita estar dentro de <SessionProvider>',
    )
  }

  return state
}