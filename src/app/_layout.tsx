import '@/global.css'
import { Redirect, Stack, usePathname } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'
import { SessionProvider, useSession } from '../providers/session-provider'

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  )
}

function RootNavigator() {
  const { session, loading, error } = useSession()
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
      <View className="flex-1 items-center justify-center bg-white p-8">
        <Text className="text-center text-red-600">{error}</Text>
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