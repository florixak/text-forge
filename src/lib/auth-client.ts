import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { Auth } from './auth'
import { toast } from 'sonner'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  plugins: [inferAdditionalFields<Auth>()],
})

export const handleGoogleLogin = async () => {
  const loadingToastId = toast.loading('Redirecting to Google...')
  try {
    await authClient.signIn.social(
      {
        provider: 'google',
        callbackURL: '/dashboard',
      },
      {
        onSuccess: () => {
          toast.dismiss(loadingToastId)
          toast.success(`Redirecting to Google`)
        },
        onError: (ctx) => {
          toast.dismiss(loadingToastId)
          toast.error(ctx.error.message)
        },
      },
    )
  } catch (error) {
    toast.dismiss(loadingToastId)
    toast.error('An unexpected error occurred during Google login.')
  }
}
