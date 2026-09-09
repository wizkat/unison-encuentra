import { statusColors } from '@/theme/token'
import type { ItemStatus } from '@/domain'
import { Text, View } from 'react-native'

export function StatusBadge({ status }: { status: ItemStatus }) {
  const { bg, text, label } = statusColors[status]

  return (
    <View style={{ backgroundColor: bg }} className="self-start rounded-full px-3 py-1">
      <Text style={{ color: text }} className="text-xs font-semibold">
        {label}
      </Text>
    </View>
  )
}