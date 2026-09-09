import { Pressable, Text, TextInput, View } from 'react-native'
import { SelectField } from './SelectField'

interface Option {
  label: string
  value: string
}

interface FilterCardProps {
  search: string
  onSearchChange: (v: string) => void
  categoryOptions: Option[]
  categoryValue: string
  onCategoryChange: (v: string) => void
  locationOptions: Option[]
  locationValue: string
  onLocationChange: (v: string) => void
  date: string
  onDateChange: (v: string) => void
  onFilter: () => void
}

export function FilterCard({
  search,
  onSearchChange,
  categoryOptions,
  categoryValue,
  onCategoryChange,
  locationOptions,
  locationValue,
  onLocationChange,
  date,
  onDateChange,
  onFilter,
}: FilterCardProps) {
  return (
    <View className="mb-6 rounded-lg border border-admin-border bg-white p-5">
      <View className="mb-4 flex-row items-center gap-2">
        <Text className="text-base">🔍</Text>
        <Text className="font-semibold text-admin-primary">Buscar y Filtrar</Text>
      </View>

      <View className="flex-row flex-wrap gap-4">
        <View className="min-w-[160px] flex-1">
          <Text className="mb-1.5 text-xs font-semibold text-admin-muted">Nombre de Objeto</Text>
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder="Ej. Mochila, Llaves..."
            placeholderTextColor="#9CA3AF"
            className="rounded-md border border-admin-border px-3 py-2.5 text-sm text-admin-text"
          />
        </View>

        <View className="min-w-[160px] flex-1">
          <SelectField label="Categoría" value={categoryValue} options={categoryOptions} onChange={onCategoryChange} />
        </View>

        <View className="min-w-[160px] flex-1">
          <SelectField label="Ubicación" value={locationValue} options={locationOptions} onChange={onLocationChange} />
        </View>

        <View className="min-w-[160px] flex-1">
          <Text className="mb-1.5 text-xs font-semibold text-admin-muted">Rango de Fecha</Text>
          <TextInput
            value={date}
            onChangeText={onDateChange}
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#9CA3AF"
            className="rounded-md border border-admin-border px-3 py-2.5 text-sm text-admin-text"
          />
        </View>
      </View>

      <Pressable
        onPress={onFilter}
        className="mt-4 flex-row items-center gap-2 self-start rounded-md bg-admin-primary px-5 py-2.5"
      >
        <Text className="text-sm text-white">🔽</Text>
        <Text className="text-sm font-semibold text-white">Filtrar</Text>
      </Pressable>
    </View>
  )
}