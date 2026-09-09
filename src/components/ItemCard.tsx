import type { LostFoundItem } from '@/domain'
import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'
import { StatusBadge } from './ui/Badge'

const dateFormatter = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' })

export function ItemCard({ item, onPress }: { item: LostFoundItem; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 w-[48%] overflow-hidden rounded-2xl bg-white shadow-sm active:opacity-90"
    >
      <Image
        source={{ uri: item.photoUrl }}
        style={{ width: '100%', aspectRatio: 1 }}
        contentFit="cover"
        transition={200}
      />

      <View className="gap-1 p-3">
        <StatusBadge status={item.status} />

        <Text numberOfLines={1} className="mt-1 text-sm font-semibold text-neutral-900">
          {item.title}
        </Text>

        <Text numberOfLines={1} className="text-xs text-neutral-500">
          📍 {item.location.building}
        </Text>

        <Text className="text-xs text-neutral-400">{dateFormatter.format(item.eventDate)}</Text>
      </View>
    </Pressable>
  )
}