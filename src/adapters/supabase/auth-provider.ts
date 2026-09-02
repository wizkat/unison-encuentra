import { InfrastructureError, UnauthorizedError, userId, type User } from '@/domain'
import type { AuthProvider, Session } from '@/ports'
import type { SupabaseClient, Session as SupabaseSession } from '@supabase/supabase-js'
import type { Database } from './database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const EXPECTED_TENANT_ID = process.env.EXPO_PUBLIC_ENTRA_TENANT_ID

// Falla al cargar el módulo, no a media autenticación.
if (!EXPECTED_TENANT_ID && process.env.NODE_ENV === 'production') {
  throw new Error('EXPO_PUBLIC_ENTRA_TENANT_ID es obligatorio en producción')
}

export class SupabaseAuthProvider implements AuthProvider {
  constructor(private readonly db: SupabaseClient<Database>) {}

  async signIn(): Promise<void> {
    const { error } = await this.db.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'openid profile email',
        redirectTo: window.location.origin,
      },
    })

    if (error) throw new InfrastructureError('No pudimos abrir el inicio de sesión', error)
  }

  async signOut(): Promise<void> {
    await this.db.auth.signOut()
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.db.auth.getSession()

    if (error) throw new InfrastructureError('No pudimos leer la sesión', error)
    if (!data.session) return null

    return this.buildSession(data.session)
  }

  onSessionChange(
    listener: (session: Session | null) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const { data } = this.db.auth.onAuthStateChange((_event, supabaseSession) => {
      if (!supabaseSession) {
        listener(null)
        return
      }

      // El callback corre sosteniendo el lock interno de supabase-js.
      // Cualquier await de Supabase aquí provoca un deadlock silencioso,
      // así que el trabajo real se difiere al siguiente ciclo del loop.
      setTimeout(() => {
        this.buildSession(supabaseSession)
          .then(listener)
          .catch((e) => {
            void this.db.auth.signOut()
            listener(null)
            onError?.(e instanceof Error ? e : new Error('Error de sesión'))
          })
      }, 0)
    })

    return () => data.subscription.unsubscribe()
  }

  /** Combina el token de Entra con el perfil almacenado en la base. */
  private async buildSession(session: SupabaseSession): Promise<Session> {
    const tenantId = readTenantId(session)

    // El guardia va antes de tocar la base: si la cuenta no pertenece
    // al tenant esperado, no hay razón para consultar nada.
    if (EXPECTED_TENANT_ID && tenantId !== EXPECTED_TENANT_ID) {
      await this.db.auth.signOut()
      throw new UnauthorizedError('Usa tu cuenta institucional para entrar')
    }

    const profile = await this.fetchProfile()

    return {
      user: toDomainUser(profile, tenantId),
      accessToken: session.access_token,
      expiresAt: new Date((session.expires_at ?? 0) * 1000),
    }
  }

  /**
   * RPC en vez de select: la función crea el perfil si no existe,
   * lo que elimina la carrera con el trigger en el primer inicio
   * de sesión y repara cuentas sin perfil. El id sale de auth.uid()
   * del lado del servidor, por eso no recibe argumentos.
   */
  private async fetchProfile(): Promise<ProfileRow> {
    const { data, error } = await this.db.rpc('get_or_create_profile').single()

    if (error) throw new InfrastructureError('No pudimos cargar tu perfil', error)
    if (!data) throw new InfrastructureError('No pudimos cargar tu perfil')

    return data
  }
}

/**
 * El tenant id viene en los claims de Entra, no en las columnas de
 * Supabase. Es la verificación fuerte de pertenencia institucional:
 * lo emite Microsoft y no se puede falsificar.
 */
const readTenantId = (session: SupabaseSession): string =>
  session.user.user_metadata?.custom_claims?.tid ?? ''

const toDomainUser = (profile: ProfileRow, tenantId: string): User => ({
  id: userId(profile.id),
  email: profile.email,
  upn: profile.upn,
  displayName: profile.display_name,
  studentId: profile.student_id,
  affiliation: profile.affiliation,
  role: profile.role,
  tenantId,
})