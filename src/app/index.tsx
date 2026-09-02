import { useSession } from '@/providers/session-provider'
import { Pressable, Text, View } from 'react-native'

export default function Home() {
  const { session, signOut } = useSession()

  return (
    <View className="flex-1 gap-4 p-6">
      <Text className="text-xl font-semibold">
        Hola, {session?.user.displayName}
      </Text>
      <Text className="text-neutral-600">
        {session?.user.affiliation} · {session?.user.role}
        {session?.user.studentId ? ` · ${session.user.studentId}` : ''}
      </Text>

      <Pressable onPress={signOut} className="self-start rounded-lg border border-neutral-300 px-4 py-2">
        <Text>Cerrar sesión</Text>
      </Pressable>
    </View>
  )
}