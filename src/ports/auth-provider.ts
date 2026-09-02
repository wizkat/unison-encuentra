import type { User } from '@/domain'

export interface Session {
  user: User
  accessToken: string
  expiresAt: Date
}

export interface AuthProvider {
  /**
   * En web redirige el navegador, así que la página se descarga y esta
   * promesa nunca resuelve. La sesión llega por onSessionChange al volver.
   */
  signIn(): Promise<void>
  signOut(): Promise<void>
  getSession(): Promise<Session | null>
  onSessionChange(
    listener: (session: Session | null) => void,
    onError?: (error: Error) => void,
  ): () => void
}