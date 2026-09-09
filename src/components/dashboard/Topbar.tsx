import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'

interface TopbarProps {
  onMenuPress?: () => void
  showMenuButton: boolean
  showName: boolean
  userName: string
  onProfilePress: () => void
}

export function Topbar({ onMenuPress, showMenuButton, showName, userName, onProfilePress }: TopbarProps) {
  return (
    <View className="h-[60px] flex-row items-center justify-between border-b border-admin-border bg-white px-4">
      <View className="flex-row items-center gap-3">
        {showMenuButton ? (
          <Pressable onPress={onMenuPress} className="p-1">
            <Text className="text-lg">☰</Text>
          </Pressable>
        ) : null}

        <Text className="text-xs text-admin-muted">
          Dashboard {'>'} Administrador {'>'} <Text className="font-semibold text-admin-text">Reportes</Text>
        </Text>
      </View>

      <View className="flex-row items-center gap-4">
        <View className="relative">
          <Text className="text-base">🔔</Text>
          <View className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-reportStatus-lost" />
        </View>

        <Pressable onPress={onProfilePress} className="flex-row items-center gap-2">
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=003366&color=fff`,
            }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
          {showName ? <Text className="text-sm font-medium text-admin-text">{userName}</Text> : null}
          <Text className="text-xs text-admin-muted">▾</Text>
        </Pressable>
      </View>
    </View>
  )
}