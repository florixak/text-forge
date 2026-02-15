import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { auth } from './auth'

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      throw redirect({ to: '/signin' })
    }
    if (!session.user.emailVerified) {
      throw redirect({ to: '/dashboard' })
    }
    return await next({
      context: {
        session,
      },
    })
  },
)

export const authOptionalMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    return await next({
      context: {
        session: session || null,
      },
    })
  },
)

export const guestMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
    return await next()
  },
)
