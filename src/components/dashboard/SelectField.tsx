import { useState } from 'react'
import { FlatList, Modal, Pressable, Text, View } from 'react-native'

interface Option {
  label: string
  value: string
}

interface SelectFieldProps {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <View className="flex-1">
      <Text className="mb-1.5 text-xs font-semibold text-admin-muted">{label}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-md border border-admin-border bg-white px-3 py-2.5"
      >
        <Text className="text-sm text-admin-text">{selected?.label ?? 'Seleccionar'}</Text>
        <Text className="text-xs text-admin-muted">▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <View className="rounded-t-2xl bg-white p-2">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value)
                    setOpen(false)
                  }}
                  className={`rounded-lg px-4 py-3 ${item.value === value ? 'bg-admin-primaryLight' : ''}`}
                >
                  <Text
                    className={`text-sm ${
                      item.value === value ? 'font-semibold text-admin-primary' : 'text-admin-text'
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}