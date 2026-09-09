import type { LostFoundItem } from '@/domain'
import { Text, View } from 'react-native'

const relativeTime = (date: Date) => {
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000))
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  return `Hace ${Math.round(hours / 24)} d`
}

const markerColor = (item: LostFoundItem) => {
  if (item.status === 'claimed') return 'bg-reportStatus-pending'
  if (item.status === 'returned') return 'bg-reportStatus-verified'
  return 'bg-admin-primary'
}

const activityText = (item: LostFoundItem) => {
  if (item.status === 'lost') return `Nuevo reporte de pérdida: ${item.title}`
  if (item.status === 'claimed') return `Solicitud de recuperación para ${item.title}`
  if (item.status === 'returned') return `${item.title} verificado y recuperado`
  return `Nuevo reporte de hallazgo: ${item.title}`
}

export function ActivityFeed({ items }: { items: LostFoundItem[] }) {
  const recent = [...items].sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime()).slice(0, 5)

  return (
    <View className="rounded-lg border border-admin-border bg-white p-5">
      <Text className="mb-4 text-sm font-semibold text-admin-text">Actividad Reciente</Text>

      <View className="gap-4">
        {recent.map((item) => (
          <View key={item.id} className="flex-row gap-2.5">
            <View className={`mt-1.5 h-2 w-2 rounded-full ${markerColor(item)}`} />
            <View className="flex-1">
              <Text className="text-xs text-admin-text">
                {activityText(item)} <Text className="font-semibold">(#{item.id.slice(0, 8)})</Text>
              </Text>
              <Text className="mt-0.5 text-[11px] text-admin-muted">{relativeTime(item.reportDate)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}