import { Pressable, Text, View } from 'react-native'

const NAV_ITEMS = [
  { key: 'overview', icon: '📊', label: 'Visión General' },
  { key: 'lost', icon: '📦', label: 'Perdidos' },
  { key: 'found', icon: '🤝', label: 'Encontrados' },
  { key: 'users', icon: '👥', label: 'Usuarios' },
  { key: 'settings', icon: '⚙️', label: 'Configuración' },
] as const

interface SidebarProps {
  active: string
  onSelect: (key: string) => void
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <View className="w-60 gap-6 border-r border-admin-border bg-white px-4 py-6">
      <View className="flex-row items-center gap-2">
        <Text className="text-2xl">🎓</Text>
        <Text className="text-base font-bold text-admin-primary">
          UNISON <Text className="text-admin-accent">Encuentra</Text>
        </Text>
      </View>

      <View className="gap-1">
        <Text className="mb-2 pl-2 text-xs font-semibold uppercase text-admin-muted">
          Acceso rápido
        </Text>

        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelect(item.key)}
              className={`flex-row items-center gap-3 rounded-md px-3 py-2.5 ${
                isActive ? 'bg-admin-primaryLight' : ''
              }`}
            >
              <Text className="text-base">{item.icon}</Text>
              <Text className={`text-sm font-medium ${isActive ? 'text-admin-primary' : 'text-admin-text'}`}>
                {item.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}