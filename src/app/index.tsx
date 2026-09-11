import { itemRepository } from '@/adapters/supabase/mock/item-repository'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { FilterCard } from '@/components/dashboard/FilterCard'
import { ReportsTable } from '@/components/dashboard/ReportsTable'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import type { CampusLocation, Category, LostFoundItem } from '@/domain'
import { useSession } from '@/providers/session-provider'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function Dashboard() {
  const router = useRouter()
  const { session, signOut } = useSession()
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const isStackedLayout = width < 1024

  const [allItems, setAllItems] = useState<LostFoundItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<CampusLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('overview')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('todas')
  const [location, setLocation] = useState('todas')
  const [date, setDate] = useState('')

  useEffect(() => {
    Promise.all([itemRepository.list(), itemRepository.listCategories(), itemRepository.listLocations()]).then(
      ([items, cats, locs]) => {
        setAllItems(items)
        setCategories(cats)
        setLocations(locs)
        setLoading(false)
      },
    )
  }, [])

  const categoryOptions = useMemo(
    () => [{ label: 'Todas', value: 'todas' }, ...categories.map((c) => ({ label: c.name, value: c.id }))],
    [categories],
  )

  const locationOptions = useMemo(
    () => [{ label: 'Todas', value: 'todas' }, ...locations.map((l) => ({ label: l.building, value: l.id }))],
    [locations],
  )

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const needle = search.trim().toLowerCase()
      const matchesSearch = !needle || item.title.toLowerCase().includes(needle) || item.id.toLowerCase().includes(needle)
      const matchesCategory = category === 'todas' || item.category.id === category
      const matchesLocation = location === 'todas' || item.location.id === location
      const matchesDate = !date || toDateKey(item.eventDate) === date

      return matchesSearch && matchesCategory && matchesLocation && matchesDate
    })
  }, [allItems, search, category, location, date])

  const handleDelete = (item: LostFoundItem) => {
    Alert.alert('Eliminar reporte', `¿Eliminar "${item.title}"? (solo en esta vista, demo)`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => setAllItems((prev) => prev.filter((i) => i.id !== item.id)),
      },
    ])
  }

  const handleEdit = (item: LostFoundItem) => router.push(`/item/${item.id}`)

  const handleProfilePress = () => {
    Alert.alert('Sesión', session?.user.displayName ?? '', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
    ])
  }

  return (
    <View className="flex-1 flex-row bg-admin-bg">
      {!isMobile || sidebarOpen ? (
        <>
          {isMobile ? <Pressable onPress={() => setSidebarOpen(false)} className="absolute inset-0 z-10 bg-black/40" /> : null}
          <View className={isMobile ? 'absolute bottom-0 left-0 top-0 z-20' : undefined}>
            <SafeAreaView edges={isMobile ? ['top', 'bottom'] : []}>
              <Sidebar
                active={activeNav}
                onSelect={(key) => {
                  setActiveNav(key)
                  setSidebarOpen(false)
                }}
              />
            </SafeAreaView>
          </View>
        </>
      ) : null}

      <View className="flex-1">
        <SafeAreaView edges={['top']}>
          <Topbar
            showMenuButton={isMobile}
            onMenuPress={() => setSidebarOpen(true)}
            showName={!isMobile}
            userName={session?.user.displayName ?? 'Admin'}
            onProfilePress={handleProfilePress}
          />
        </SafeAreaView>

        <ScrollView
  className="flex-1 p-4"
  contentContainerStyle={{ paddingBottom: 40 }}
>
  {activeNav === 'overview' && (
    <>
      <Text className="mb-4 text-base text-admin-text">
        PANEL DE ADMINISTRACIÓN:{' '}
        <Text className="font-normal text-admin-muted">
          Gestión de Reportes
        </Text>
      </Text>

      <View
        className={
          isStackedLayout
            ? 'gap-4'
            : 'flex-row gap-4'
        }
      >
        <View className="flex-1">
          <FilterCard
            search={search}
            onSearchChange={setSearch}
            categoryOptions={categoryOptions}
            categoryValue={category}
            onCategoryChange={setCategory}
            locationOptions={locationOptions}
            locationValue={location}
            onLocationChange={setLocation}
            date={date}
            onDateChange={setDate}
            onFilter={() => {}}
          />

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator color="#003366" />
            </View>
          ) : (
            <ReportsTable
              items={filtered}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </View>

        <View
          className={
            isStackedLayout
              ? undefined
              : 'w-[280px]'
          }
        >
          <ActivityFeed items={allItems} />
        </View>
      </View>
    </>
  )}

  {activeNav === 'lost' && (
    <View>
      <Text className="mb-4 text-base text-admin-text">
        PANEL DE ADMINISTRACIÓN:{' '}
        <Text className="font-normal text-admin-muted">
          Objetos Perdidos
        </Text>
      </Text>

      <View className="rounded-xl border border-admin-border bg-white p-8">
        <Text className="text-xl font-bold text-admin-primary">
          📦 Objetos Perdidos
        </Text>

        <Text className="mt-3 text-sm text-admin-muted">
          Aquí se mostrarán todos los reportes de objetos perdidos.
        </Text>

        <Text className="mt-6 text-sm text-admin-muted">
          Esta sección se encuentra en desarrollo.
        </Text>
      </View>
    </View>
  )}

  {activeNav === 'found' && (
    <View>
      <Text className="mb-4 text-base text-admin-text">
        PANEL DE ADMINISTRACIÓN:{' '}
        <Text className="font-normal text-admin-muted">
          Objetos Encontrados
        </Text>
      </Text>

      <View className="rounded-xl border border-admin-border bg-white p-8">
        <Text className="text-xl font-bold text-admin-primary">
          🤝 Objetos Encontrados
        </Text>

        <Text className="mt-3 text-sm text-admin-muted">
          Aquí se mostrarán todos los reportes de objetos encontrados.
        </Text>

        <Text className="mt-6 text-sm text-admin-muted">
          Esta sección se encuentra en desarrollo.
        </Text>
      </View>
    </View>
  )}

  {activeNav === 'users' && (
    <View>
      <Text className="mb-4 text-base text-admin-text">
        PANEL DE ADMINISTRACIÓN:{' '}
        <Text className="font-normal text-admin-muted">
          Gestión de Usuarios
        </Text>
      </Text>

      <View className="rounded-xl border border-admin-border bg-white p-8">
        <Text className="text-xl font-bold text-admin-primary">
          👥 Usuarios
        </Text>

        <Text className="mt-3 text-sm text-admin-muted">
          Aquí se administrarán los usuarios de Encuentra UNISON.
        </Text>

        <Text className="mt-6 text-sm text-admin-muted">
          Esta sección se encuentra en desarrollo.
        </Text>
      </View>
    </View>
  )}

  {activeNav === 'settings' && (
    <View>
      <Text className="mb-4 text-base text-admin-text">
        PANEL DE ADMINISTRACIÓN:{' '}
        <Text className="font-normal text-admin-muted">
          Configuración
        </Text>
      </Text>

      <View className="rounded-xl border border-admin-border bg-white p-8">
        <Text className="text-xl font-bold text-admin-primary">
          ⚙️ Configuración
        </Text>

        <Text className="mt-3 text-sm text-admin-muted">
          Aquí se mostrarán las opciones de configuración del sistema.
        </Text>

        <Text className="mt-6 text-sm text-admin-muted">
          Esta sección se encuentra en desarrollo.
        </Text>
      </View>
    </View>
  )}
</ScrollView>
      </View>
    </View>
  )
}