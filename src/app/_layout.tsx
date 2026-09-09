import '@/global.css'

import {
  SessionProvider,
  useSession,
} from '@/providers/session-provider'

import {
  Redirect,
  Stack,
  usePathname,
} from 'expo-router'

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native'

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  )
}

function RootNavigator() {
  const {
    session,
    loading,
    error,
    signOut,
  } = useSession()

  const pathname = usePathname()

  console.log(
    '[ROUTER]',
    'pathname:',
    pathname,
    'session:',
    !!session,
    'loading:',
    loading,
  )

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-white p-8">
        <Text className="text-center text-red-600">
          {error}
        </Text>

        <Pressable
          onPress={signOut}
          className="rounded-lg border border-neutral-300 px-4 py-2"
        >
          <Text>
            Volver a intentar
          </Text>
        </Pressable>
      </View>
    )
  }

  /*
   * Rutas que pueden abrirse SIN que todavía exista
   * una sesión.
   *
   * auth/callback tiene que ser pública porque
   * Microsoft/Supabase regresan aquí ANTES de que
   * terminemos de crear la sesión.
   */
  const isPublicRoute =
    pathname === '/sign-in' ||
    pathname === '/auth/callback'

  if (!session && !isPublicRoute) {
    return (
      <Redirect href="/sign-in" />
    )
  }

  /*
   * Si ya inició sesión y vuelve al login,
   * lo mandamos a la aplicación.
   */
  if (
    session &&
    pathname === '/sign-in'
  ) {
    return <Redirect href="/" />
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="sign-in"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="auth/callback"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="item/[id]"
        options={{
          title: 'Detalle del objeto',
          headerStyle: {
            backgroundColor: '#052646',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack>
  )
}