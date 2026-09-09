import type { Category } from '@/domain'
import { Pressable, ScrollView, Text } from 'react-native'

interface CategoryFilterProps {
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
    >
      <Chip label="Todos" icon="✨" active={selectedId === null} onPress={() => onSelect(null)} />
      {categories.map((cat) => (
        <Chip
          key={cat.id}
          label={cat.name}
          icon={cat.icon}
          active={selectedId === cat.id}
          onPress={() => onSelect(cat.id)}
        />
      ))}
    </ScrollView>
  )
}

function Chip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string
  icon: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-full border px-4 py-2 ${
        active ? 'border-unison-600 bg-unison-600' : 'border-neutral-200 bg-white'
      }`}
    >
      <Text className="text-sm">{icon}</Text>
      <Text className={`text-sm font-medium ${active ? 'text-white' : 'text-neutral-700'}`}>
        {label}
      </Text>
    </Pressable>
  )
}