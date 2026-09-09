import { Text, TextInput, View } from 'react-native'

interface SearchBarProps {
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChangeText, placeholder = 'Buscar objetos...' }: SearchBarProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
      <Text className="text-base">🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="flex-1 text-base text-neutral-900"
        returnKeyType="search"
        autoCorrect={false}
      />
    </View>
  )
}