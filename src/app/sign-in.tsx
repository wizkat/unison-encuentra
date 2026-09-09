import { useSession } from '@/providers/session-provider'
import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignIn() {
  const { signIn, error } = useSession()
  const [busy, setBusy] = useState(false)

  const handleSignIn = async () => {
    setBusy(true)
    await signIn()
    setBusy(false)
  }

  return (
    <View className="flex-1 bg-unison-700">
      <SafeAreaView className="flex-1 justify-between px-8 py-10">
        <View className="items-center gap-3 pt-12">
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-white/15">
            <Text className="text-4xl">🦉</Text>
          </View>
          <Text className="text-3xl font-bold text-white">Unison Encuentra</Text>
          <Text className="text-center text-base text-unison-100">
            Reporta lo que encuentres y recupera lo que perdiste en el campus.
          </Text>
        </View>

        <View className="gap-4 rounded-3xl bg-white p-6">
          <Pressable
            onPress={handleSignIn}
            disabled={busy}
            className="flex-row items-center justify-center gap-3 rounded-xl bg-unison-600 px-6 py-4 active:opacity-80 disabled:opacity-50"
          >
            {busy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-semibold text-white">Continuar con Microsoft</Text>
            )}
          </Pressable>

          <Text className="text-center text-sm text-neutral-500">
            Usa tu cuenta institucional @unison.mx
          </Text>

          {error ? (
            <View className="rounded-lg bg-red-50 px-4 py-3">
              <Text className="text-sm text-red-700">{error}</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  )
}