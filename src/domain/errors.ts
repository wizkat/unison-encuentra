export abstract class DomainError extends Error {
  abstract readonly code: string

  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = new.target.name
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND'

  constructor(resource: string, id?: string) {
    super(id ? `No encontramos ${resource} con id ${id}` : `No encontramos ${resource}`)
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED'

  constructor(message = 'Inicia sesión para continuar') {
    super(message)
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN'

  constructor(message = 'Tu cuenta no tiene permiso para esta acción') {
    super(message)
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION'

  constructor(message: string, readonly fields: Record<string, string> = {}) {
    super(message)
  }
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT'
}

export class InfrastructureError extends DomainError {
  readonly code = 'INFRASTRUCTURE'

  constructor(
    message = 'No pudimos completar la operación. Intenta de nuevo.',
    cause?: unknown,
  ) {
    super(message, cause)
  }
}

/** Type guard en los catch de la interfaz. */
export const isDomainError = (error: unknown): error is DomainError =>
  error instanceof DomainError