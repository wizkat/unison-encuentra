import type { LostFoundItem } from '@/domain'
import { Image } from 'expo-image'
import type { ReactNode } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

interface ReportsTableProps {
  items: LostFoundItem[]
  onEdit: (item: LostFoundItem) => void
  onDelete: (item: LostFoundItem) => void
}

const dateFormatter = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })

const typeOf = (item: LostFoundItem) => (item.status === 'lost' ? 'Perdido' : 'Encontrado')

const claimBadge = (item: LostFoundItem) => {
  if (item.status === 'claimed') return { kind: 'outline' as const, label: 'Pendiente', color: '#FF9F1C' }
  if (item.status === 'returned') return { kind: 'outline' as const, label: 'Verificada', color: '#2BA84A' }
  if (item.status === 'lost') return { kind: 'dash' as const, label: '—', color: '#7F8C8D' }
  return { kind: 'button' as const, label: 'Ver Solicitudes', color: '#003366' }
}

const COLUMN_WIDTHS = [80, 60, 180, 130, 150, 100, 100, 150, 90]

export function ReportsTable({ items, onEdit, onDelete }: ReportsTableProps) {
  return (
    <View className="overflow-hidden rounded-lg border border-admin-border bg-white">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View className="flex-row border-b border-admin-border bg-neutral-50">
            <HeaderCell width={COLUMN_WIDTHS[0]} label="ID Reporte" />
            <HeaderCell width={COLUMN_WIDTHS[1]} label="Foto" />
            <HeaderCell width={COLUMN_WIDTHS[2]} label="Nombre" />
            <HeaderCell width={COLUMN_WIDTHS[3]} label="Categoría" />
            <HeaderCell width={COLUMN_WIDTHS[4]} label="Ubicación" />
            <HeaderCell width={COLUMN_WIDTHS[5]} label="Fecha" />
            <HeaderCell width={COLUMN_WIDTHS[6]} label="Tipo" />
            <HeaderCell width={COLUMN_WIDTHS[7]} label="Solicitud" />
            <HeaderCell width={COLUMN_WIDTHS[8]} label="Acciones" />
          </View>

          {items.length === 0 ? (
            <View className="items-center justify-center px-4 py-8">
              <Text className="text-sm text-admin-muted">No se encontraron reportes.</Text>
            </View>
          ) : (
            items.map((item) => {
              const type = typeOf(item)
              const claim = claimBadge(item)

              return (
                <View key={item.id} className="flex-row items-center border-b border-admin-border">
                  <Cell width={COLUMN_WIDTHS[0]}>
                    <Text className="text-xs font-bold text-admin-text">{item.id.slice(0, 8)}</Text>
                  </Cell>

                  <Cell width={COLUMN_WIDTHS[1]}>
                    <Image source={{ uri: item.photoUrl }} style={{ width: 36, height: 36, borderRadius: 6 }} />
                  </Cell>

                  <Cell width={COLUMN_WIDTHS[2]}>
                    <Text numberOfLines={1} className="text-xs text-admin-text">{item.title}</Text>
                  </Cell>

                  <Cell width={COLUMN_WIDTHS[3]}>
                    <Text numberOfLines={1} className="text-xs text-admin-text">{item.category.name}</Text>
                  </Cell>

                  <Cell width={COLUMN_WIDTHS[4]}>
                    <Text numberOfLines={1} className="text-xs text-admin-text">{item.location.building}</Text>
                  </Cell>

                  <Cell width={COLUMN_WIDTHS[5]}>
                    <Text className="text-xs text-admin-text">{dateFormatter.format(item.eventDate)}</Text>
                  </Cell>

                  <Cell width={COLUMN_WIDTHS[6]}>
                    <View
                      className={`self-start rounded-full px-2.5 py-1 ${
                        type === 'Perdido' ? 'bg-reportStatus-lost' : 'bg-reportStatus-found'
                      }`}
                    >
                      <Text className="text-[11px] font-semibold text-white">{type}</Text>
                    </View>
                  </Cell>

                  <Cell width={COLUMN_WIDTHS[7]}>
                    {claim.kind === 'button' ? (
                      <View className="self-start rounded border border-admin-primary px-2 py-1">
                        <Text className="text-[11px] font-semibold text-admin-primary">{claim.label}</Text>
                      </View>
                    ) : claim.kind === 'dash' ? (
                      <Text className="text-xs text-admin-muted">—</Text>
                    ) : (
                      <View style={{ borderColor: claim.color }} className="self-start rounded border px-2 py-1">
                        <Text style={{ color: claim.color }} className="text-[11px] font-semibold">
                          {claim.label}
                        </Text>
                      </View>
                    )}
                  </Cell>

                  <Cell width={COLUMN_WIDTHS[8]}>
                    <View className="flex-row gap-3">
                      <Pressable onPress={() => onEdit(item)}>
                        <Text className="text-sm">✏️</Text>
                      </Pressable>
                      <Pressable onPress={() => onDelete(item)}>
                        <Text className="text-sm">🗑️</Text>
                      </Pressable>
                    </View>
                  </Cell>
                </View>
              )
            })
          )}
        </View>
      </ScrollView>
    </View>
  )
}

function HeaderCell({ width, label }: { width: number; label: string }) {
  return (
    <View style={{ width }} className="px-3 py-3">
      <Text className="text-[10px] font-semibold uppercase text-admin-muted">{label}</Text>
    </View>
  )
}

function Cell({ width, children }: { width: number; children: ReactNode }) {
  return (
    <View style={{ width }} className="px-3 py-3">
      {children}
    </View>
  )
}