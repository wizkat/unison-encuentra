import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { supabase } from '../adapters/supabase/client'

export default function TestAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    const fromQuery = url.searchParams.get('error_description')
    const fromHash = new URLSearchParams(url.hash.slice(1)).get('error_description')
    const redirectError = fromQuery ?? fromHash

    if (redirectError) setError(decodeURIComponent(redirectError))

    supabase.auth.getSession().then(({ data, error }) => {
      setSession(data.session)
      if (error) setError(error.message)
      setReady(true)
    })

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('auth event:', event)
      setSession(session)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'openid profile email',
        redirectTo: window.location.origin + '/test-auth',
      },
    })
    if (error) setError(error.message)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Prueba de autenticación</Text>

      <Text>{ready ? (session ? 'Sesión activa' : 'Sin sesión') : 'Cargando...'}</Text>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable onPress={signIn} style={{ backgroundColor: '#171717', padding: 12, borderRadius: 8 }}>
          <Text style={{ color: 'white' }}>Entrar con Microsoft</Text>
        </Pressable>

        <Pressable onPress={signOut} style={{ borderWidth: 1, borderColor: '#d4d4d4', padding: 12, borderRadius: 8 }}>
          <Text>Salir</Text>
        </Pressable>
      </View>

      <Text selectable style={{ fontFamily: 'monospace', fontSize: 12 }}>
        {JSON.stringify(session?.user.identities, null, 2)}
    </Text>

      {error ? <Text style={{ color: '#dc2626' }}>Error: {error}</Text> : null}

      {session ? (
        <>
          <Text style={{ fontWeight: '600' }}>user_metadata</Text>
          <Text selectable style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {JSON.stringify(session.user.user_metadata, null, 2)}
          </Text>

          <Text style={{ fontWeight: '600' }}>Sesión completa</Text>
          <Text selectable style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {JSON.stringify(session, null, 2)}
          </Text>
        </>
      ) : null}
    </ScrollView>
  )
}