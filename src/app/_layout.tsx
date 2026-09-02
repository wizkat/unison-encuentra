import '@/global.css'
import { SessionProvider, useSession } from '@/providers/session-provider'
import { Redirect, Stack, usePathname } from 'expo-router'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  )
}

function RootNavigator() {
  const { session, loading, error, signOut } = useSession()
  const pathname = usePathname()

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
        <Text className="text-center text-red-600">{error}</Text>
        <Pressable onPress={signOut} className="rounded-lg border border-neutral-300 px-4 py-2">
          <Text>Volver a intentar</Text>
        </Pressable>
      </View>
    )
  }

  if (!session && pathname !== '/sign-in') {
    return <Redirect href="/sign-in" />
  }

  if (session && pathname === '/sign-in') {
    return <Redirect href="/" />
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Objetos perdidos' }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
    </Stack>
  )
}