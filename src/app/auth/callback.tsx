import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native'

export default function AuthCallback() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ActivityIndicator size="large" />

      <Text className="mt-4 text-center text-base text-gray-600">
        Completando inicio de sesión...
      </Text>
    </View>
  )
}