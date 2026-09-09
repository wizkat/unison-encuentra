import { itemRepository } from '@/adapters/supabase/mock/item-repository'
import { StatusBadge } from '@/components/ui/Badge'
import { itemId, type LostFoundItem } from '@/domain'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [item, setItem] = useState<LostFoundItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    itemRepository
      .getById(itemId(id))
      .then(setItem)
      .finally(() => setLoading(false))
  }, [id])

  const handleClaim = () => {
    Alert.alert(
      'Solicitud enviada (demo)',
      'Cuando conectemos la base de datos, esto creará un reclamo real y notificará al administrador.',
    )
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#0B63C5" />
      </View>
    )
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-white px-8">
        <Text className="text-4xl">🙈</Text>
        <Text className="text-center text-neutral-500">No encontramos este objeto.</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 40 }}>
      <Image source={{ uri: item.photoUrl }} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" />

      <SafeAreaView edges={['bottom']} className="gap-4 px-5 pt-5">
        <View className="flex-row items-center justify-between">
          <StatusBadge status={item.status} />
          <Text className="text-xs text-neutral-400">
            Reportado el {dateFormatter.format(item.reportDate)}
          </Text>
        </View>

        <Text className="text-2xl font-bold text-neutral-900">{item.title}</Text>

        <View className="flex-row flex-wrap gap-2">
          <InfoPill icon="🏷️" label={item.category.name} />
          <InfoPill icon="📍" label={`${item.location.building} · ${item.location.room}`} />
          {item.color ? <InfoPill icon="🎨" label={item.color} /> : null}
          {item.brand ? <InfoPill icon="✨" label={item.brand} /> : null}
        </View>

        <View className="gap-1">
          <Text className="text-sm font-semibold text-neutral-900">Descripción</Text>
          <Text className="text-base leading-relaxed text-neutral-600">{item.description}</Text>
        </View>

        <View className="gap-1 rounded-2xl bg-neutral-50 p-4">
          <Text className="text-sm font-semibold text-neutral-900">Reportado por</Text>
          <Text className="text-sm text-neutral-600">{item.reportedBy.displayName}</Text>
        </View>

        {item.status === 'found' ? (
          <Pressable
            onPress={handleClaim}
            className="items-center rounded-2xl bg-unison-600 py-4 active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">Solicitar recuperación</Text>
          </Pressable>
        ) : null}
      </SafeAreaView>
    </ScrollView>
  )
}

function InfoPill({ icon, label }: { icon: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5">
      <Text className="text-xs">{icon}</Text>
      <Text className="text-xs font-medium text-neutral-700">{label}</Text>
    </View>
  )
}