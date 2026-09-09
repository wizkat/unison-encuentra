import { SafeAreaView, Text, View, Pressable } from 'react-native'

export default function MobileHome() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-10">
        <Text className="text-3xl font-bold text-[#052646]">
          Encuentra UNISON
        </Text>

        <Text className="mt-2 text-base text-gray-500">
          Objetos perdidos y encontrados
        </Text>

        <View className="mt-10 gap-4">
          <Pressable className="rounded-xl bg-[#052646] p-5">
            <Text className="text-center text-lg font-semibold text-white">
              Buscar objeto
            </Text>
          </Pressable>

          <Pressable className="rounded-xl bg-[#052646] p-5">
            <Text className="text-center text-lg font-semibold text-white">
              Reportar objeto
            </Text>
          </Pressable>

          <Pressable className="rounded-xl border border-[#052646] p-5">
            <Text className="text-center text-lg font-semibold text-[#052646]">
              Mis reportes
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}