import { useSession } from '@/providers/session-provider'
import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

export default function SignIn() {
  const { signIn, error } = useSession()
  const [busy, setBusy] = useState(false)

  const handleSignIn = async () => {
    setBusy(true)
    await signIn()

    setBusy(false)
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <View className="w-full max-w-sm gap-8">
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-neutral-900">
            Objetos perdidos
          </Text>
          <Text className="text-base leading-relaxed text-neutral-600">
            Reporta lo que encuentres y recupera lo que perdiste en el campus.
          </Text>
        </View>

        <View className="gap-3">
          <Pressable
            onPress={handleSignIn}
            disabled={busy}
            className="flex-row items-center justify-center gap-3 rounded-xl bg-neutral-900 px-6 py-4 active:opacity-80 disabled:opacity-50"
          >
            {busy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-medium text-white">
                Continuar con Microsoft
              </Text>
            )}
          </Pressable>

          <Text className="text-center text-sm text-neutral-500">
            Usa tu cuenta institucional
          </Text>
        </View>

        {error ? (
          <View className="rounded-lg bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}