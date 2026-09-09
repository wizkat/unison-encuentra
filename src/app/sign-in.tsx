import { useSession } from '@/providers/session-provider'
import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignIn() {
  const { signIn, error } = useSession()
  const [busy, setBusy] = useState(false)

  const { width } = useWindowDimensions()

  const isDesktop = width >= 850

  const handleSignIn = async () => {
    setBusy(true)

    try {
      await signIn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <View className="flex-1 bg-admin-bg">
      <SafeAreaView className="flex-1">

        {/* Barra superior */}
        <View className="h-[72px] flex-row items-center border-b border-admin-border bg-white px-6 md:px-10">
          <Text className="text-2xl">🎓</Text>

          <View className="ml-3 flex-row items-center">
            <Text className="text-xl font-bold text-admin-primary">
              UNISON
            </Text>

            <Text className="ml-2 text-xl font-bold text-admin-accent">
              Encuentra
            </Text>
          </View>
        </View>

        {/* Contenido */}
        <View
          className={`flex-1 ${
            isDesktop ? 'flex-row' : 'flex-col'
          }`}
        >

          {/* Panel izquierdo */}
          {isDesktop && (
            <View className="flex-1 justify-center bg-admin-primary px-16">
              <View className="max-w-xl">

                <View className="mb-8 h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
                  <Text className="text-4xl">🎓</Text>
                </View>

                <Text className="text-4xl font-bold leading-tight text-white">
                  Encuentra lo que perdiste.
                </Text>

                <Text className="mt-3 text-4xl font-bold leading-tight text-admin-accent">
                  Reporta lo que encontraste.
                </Text>

                <Text className="mt-6 max-w-lg text-lg leading-7 text-white/80">
                  Plataforma institucional para reportar,
                  localizar y recuperar objetos perdidos
                  dentro de la Universidad de Sonora.
                </Text>

                <View className="mt-10 border-l-4 border-admin-accent pl-5">
                  <Text className="text-sm leading-6 text-white/70">
                    Acceso exclusivo para miembros de la comunidad
                    universitaria mediante cuenta institucional.
                  </Text>
                </View>

              </View>
            </View>
          )}

          {/* Panel del login */}
          <View className="flex-1 items-center justify-center px-6 py-10">

            <View className="w-full max-w-md rounded-2xl border border-admin-border bg-admin-card p-7 md:p-9">

              {/* Encabezado */}
              <View className="mb-8">

                {!isDesktop && (
                  <View className="mb-6 items-center">
                    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-admin-primaryLight">
                      <Text className="text-3xl">🎓</Text>
                    </View>
                  </View>
                )}

                <Text
                  className={`text-2xl font-bold text-admin-text ${
                    isDesktop ? '' : 'text-center'
                  }`}
                >
                  Iniciar sesión
                </Text>

                <Text
                  className={`mt-2 text-sm leading-6 text-admin-muted ${
                    isDesktop ? '' : 'text-center'
                  }`}
                >
                  Accede a Encuentra utilizando tu cuenta
                  institucional de la Universidad de Sonora.
                </Text>

              </View>

              {/* Botón Microsoft */}
              <Pressable
                onPress={handleSignIn}
                disabled={busy}
                className="flex-row items-center justify-center rounded-xl bg-admin-primary px-6 py-4 active:opacity-80 disabled:opacity-50"
              >
                {busy ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    {/* Logo Microsoft sencillo */}
                    <View className="mr-3 h-5 w-5 flex-row flex-wrap overflow-hidden">
                      <View className="h-2.5 w-2.5 bg-red-500" />
                      <View className="h-2.5 w-2.5 bg-green-500" />
                      <View className="h-2.5 w-2.5 bg-blue-500" />
                      <View className="h-2.5 w-2.5 bg-yellow-400" />
                    </View>

                    <Text className="text-base font-semibold text-white">
                      Continuar con Microsoft
                    </Text>
                  </>
                )}
              </Pressable>

              {/* Cuenta institucional */}
              <View className="mt-5 flex-row items-center justify-center">
                <Text className="mr-2">🔒</Text>

                <Text className="text-sm text-admin-muted">
                  Usa tu cuenta institucional @unison.mx
                </Text>
              </View>

              {/* Error */}
              {error ? (
                <View className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <Text className="text-sm text-red-700">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Separador */}
              <View className="my-7 h-px bg-admin-border" />

              <Text className="text-center text-xs leading-5 text-admin-muted">
                El acceso está restringido a integrantes
                de la comunidad universitaria.
              </Text>

            </View>

            {/* Footer */}
            <Text className="mt-6 text-xs text-admin-muted">
              Universidad de Sonora · Encuentra
            </Text>

          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}