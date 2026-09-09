import {
  InfrastructureError,
  UnauthorizedError,
  userId,
  type User,
} from '@/domain'

import type { AuthProvider, Session } from '@/ports'

import type {
  Session as SupabaseSession,
  SupabaseClient,
} from '@supabase/supabase-js'

import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import { Platform } from 'react-native'

import type { Database } from './database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const EXPECTED_TENANT_ID =
  process.env.EXPO_PUBLIC_ENTRA_TENANT_ID

if (
  !EXPECTED_TENANT_ID &&
  process.env.NODE_ENV === 'production'
) {
  throw new Error(
    'EXPO_PUBLIC_ENTRA_TENANT_ID es obligatorio en producción',
  )
}

// Necesario para completar correctamente sesiones OAuth.
WebBrowser.maybeCompleteAuthSession()

export class SupabaseAuthProvider implements AuthProvider {
  constructor(
    private readonly db: SupabaseClient<Database>,
  ) {}

  async signIn(): Promise<void> {
    console.log('[AUTH] Inicio de signIn')

    /*
     * WEB
     *
     * Conservamos el comportamiento que ya tenía el proyecto.
     */
    if (Platform.OS === 'web') {
      const redirectTo = window.location.origin

      console.log(
        '[AUTH] Plataforma web. Redirect:',
        redirectTo,
      )

      const { error } =
        await this.db.auth.signInWithOAuth({
          provider: 'azure',
          options: {
            scopes: 'openid profile email',
            redirectTo,
            queryParams: {
              prompt: 'select_account',
            },
          },
        })

      if (error) {
        throw new InfrastructureError(
          'No pudimos abrir el inicio de sesión',
          error,
        )
      }

      return
    }

    /*
     * ANDROID / iOS
     *
     * La aplicación utiliza el scheme definido en app.json:
     *
     * unisonencuentra://auth/callback
     */
    const redirectTo = Linking.createURL(
      'auth/callback',
      {
        scheme: 'unisonencuentra',
      },
    )

    console.log(
      '[AUTH] Redirect móvil:',
      redirectTo,
    )

    /*
     * Pedimos a Supabase la URL de autenticación.
     *
     * skipBrowserRedirect evita que Supabase intente
     * utilizar window.location como en una página web.
     */
    const { data, error } =
      await this.db.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'openid profile email',
          redirectTo,

          skipBrowserRedirect: true,

          queryParams: {
            prompt: 'select_account',
          },
        },
      })

    if (error) {
      console.error(
        '[AUTH] Error signInWithOAuth:',
        error,
      )

      throw new InfrastructureError(
        'No pudimos iniciar sesión con Microsoft',
        error,
      )
    }

    if (!data.url) {
      throw new InfrastructureError(
        'Supabase no generó la URL de autenticación',
      )
    }

    console.log(
      '[AUTH] Abriendo Microsoft...',
    )

    /*
     * Abrimos el navegador de Android.
     *
     * Flujo:
     *
     * App
     *   ↓
     * Supabase
     *   ↓
     * Microsoft
     *   ↓
     * Supabase
     *   ↓
     * unisonencuentra://auth/callback
     */
    const result =
      await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      )

    console.log(
      '[AUTH] Resultado del navegador:',
      result.type,
    )

    /*
     * El usuario puede cerrar manualmente el navegador.
     */
    if (result.type !== 'success') {
      console.log(
        '[AUTH] Login cancelado o navegador cerrado',
      )

      return
    }

    if (!result.url) {
      throw new InfrastructureError(
        'Microsoft no devolvió una URL de autenticación',
      )
    }

    console.log(
      '[AUTH] Callback recibido:',
      result.url,
    )

    /*
     * Extraemos el code PKCE de:
     *
     * unisonencuentra://auth/callback?code=...
     */
    const parsed = Linking.parse(result.url)

    const code =
      typeof parsed.queryParams?.code === 'string'
        ? parsed.queryParams.code
        : null

    if (!code) {
      console.error(
        '[AUTH] No se encontró code en callback',
        parsed.queryParams,
      )

      throw new InfrastructureError(
        'No se recibió el código de autenticación',
      )
    }

    console.log(
      '[AUTH] Código recibido. Canjeando sesión...',
    )

    /*
     * Canjeamos el código OAuth por la sesión de Supabase.
     */
    const { error: exchangeError } =
      await this.db.auth.exchangeCodeForSession(
        code,
      )

    if (exchangeError) {
      console.error(
        '[AUTH] Error exchangeCodeForSession:',
        exchangeError,
      )

      throw new InfrastructureError(
        'No pudimos completar el inicio de sesión',
        exchangeError,
      )
    }

    console.log(
      '[AUTH] Sesión creada correctamente',
    )
  }

  async signOut(): Promise<void> {
    const { error } =
      await this.db.auth.signOut()

    if (error) {
      throw new InfrastructureError(
        'No pudimos cerrar la sesión',
        error,
      )
    }
  }

  async getSession(): Promise<Session | null> {
    const { data, error } =
      await this.db.auth.getSession()

    if (error) {
      throw new InfrastructureError(
        'No pudimos leer la sesión',
        error,
      )
    }

    if (!data.session) {
      return null
    }

    return this.buildSession(data.session)
  }

  onSessionChange(
    listener: (
      session: Session | null,
    ) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const { data } =
      this.db.auth.onAuthStateChange(
        (_event, supabaseSession) => {
          if (!supabaseSession) {
            listener(null)
            return
          }

          /*
           * El callback corre sosteniendo el lock
           * interno de supabase-js.
           *
           * Cualquier await de Supabase aquí puede
           * provocar un bloqueo, por eso diferimos
           * el trabajo al siguiente ciclo.
           */
          setTimeout(() => {
            this.buildSession(
              supabaseSession,
            )
              .then(listener)
              .catch((e) => {
                void this.db.auth.signOut()

                listener(null)

                onError?.(
                  e instanceof Error
                    ? e
                    : new Error(
                        'Error de sesión',
                      ),
                )
              })
          }, 0)
        },
      )

    return () =>
      data.subscription.unsubscribe()
  }

  /**
   * Combina el token de Entra con el
   * perfil almacenado en PostgreSQL.
   */
  private async buildSession(
    session: SupabaseSession,
  ): Promise<Session> {
    const tenantId =
      readTenantId(session)

    /*
     * Verificación de pertenencia:
     * el tid debe ser el tenant de
     * la universidad.
     */
    if (
      EXPECTED_TENANT_ID &&
      tenantId !== EXPECTED_TENANT_ID
    ) {
      await this.db.auth.signOut()

      throw new UnauthorizedError(
        'Usa tu cuenta institucional para entrar',
      )
    }

    const profile =
      await this.fetchProfile()

    return {
      user: toDomainUser(
        profile,
        tenantId,
      ),

      accessToken:
        session.access_token,

      expiresAt: new Date(
        (session.expires_at ?? 0) * 1000,
      ),
    }
  }

  /**
   * Obtiene o crea el profile correspondiente
   * al usuario autenticado.
   */
  private async fetchProfile(): Promise<ProfileRow> {
    const { data, error } =
      await this.db
        .rpc('get_or_create_profile')
        .single()

    if (error) {
      throw new InfrastructureError(
        'No pudimos cargar tu perfil',
        error,
      )
    }

    if (!data) {
      throw new InfrastructureError(
        'No pudimos cargar tu perfil',
      )
    }

    return data
  }
}

/**
 * El tenant ID viene firmado dentro de los
 * claims proporcionados por Microsoft Entra.
 */
const readTenantId = (
  session: SupabaseSession,
): string =>
  session.user.user_metadata
    ?.custom_claims?.tid ?? ''

const toDomainUser = (
  profile: ProfileRow,
  tenantId: string,
): User => ({
  id: userId(profile.id),

  email: profile.email,

  upn: profile.upn,

  displayName:
    profile.display_name,

  studentId:
    profile.student_id,

  affiliation:
    profile.affiliation,

  role: profile.role,

  tenantId,
})