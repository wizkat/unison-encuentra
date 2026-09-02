import { InfrastructureError, UnauthorizedError, userId, type User } from '@/domain'
import type { AuthProvider, Session } from '@/ports'
import type { SupabaseClient, Session as SupabaseSession } from '@supabase/supabase-js'
import type { Database } from './database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const EXPECTED_TENANT_ID = process.env.EXPO_PUBLIC_ENTRA_TENANT_ID

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

  onSessionChange(listener: (session: Session | null) => void): () => void {
    const { data } = this.db.auth.onAuthStateChange((_event, supabaseSession) => {
      if (!supabaseSession) {
        listener(null)
        return
      }

      setTimeout(() => {
        this.buildSession(supabaseSession)
          .then(listener)
          .catch(() => {
            void this.db.auth.signOut()
            listener(null)
          })
      }, 0)
    })

    return () => data.subscription.unsubscribe()
  }

  private async buildSession(session: SupabaseSession): Promise<Session> {
    const tenantId = readTenantId(session)

    if (EXPECTED_TENANT_ID && tenantId !== EXPECTED_TENANT_ID) {
      await this.db.auth.signOut()
      throw new UnauthorizedError('Usa tu cuenta institucional para entrar')
    }

    const profile = await this.fetchProfile(session.user.id)

    return {
      user: toDomainUser(profile, tenantId),
      accessToken: session.access_token,
      expiresAt: new Date((session.expires_at ?? 0) * 1000),
    }
  }

  private async fetchProfile(id: string, attempts = 3): Promise<ProfileRow> {
    for (let attempt = 0; attempt < attempts; attempt++) {
      const { data, error } = await this.db
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw new InfrastructureError('No pudimos cargar tu perfil', error)
      if (data) return data

      await delay(200 * (attempt + 1))
    }

    throw new InfrastructureError(
      'Tu cuenta se creó pero el perfil no está listo. Vuelve a intentar en un momento.',
    )
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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