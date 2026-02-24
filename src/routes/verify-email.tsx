import LoadingIndicator from '@/components/state/loading-indicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'
import { authOptionalMiddleware } from '@/lib/middleware'
import { getMetadata } from '@/lib/metadata'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, XCircle } from 'lucide-react'
import * as z from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailPage,
  validateSearch: verifyEmailSchema,
  server: {
    middleware: [authOptionalMiddleware],
  },
  pendingComponent: () => <LoadingIndicator text="Verifying your email..." />,
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({
    deps,
    serverContext,
  }): Promise<{
    success: boolean
    message: string
    isAuthenticated: boolean
  }> => {
    const { token } = deps
    const session = serverContext?.session
    const isAuthenticated = !!session
    try {
      const response = await authClient.verifyEmail({
        query: {
          token,
        },
      })
      if (!response.data?.status) {
        return {
          success: false,
          message: 'Email verification failed. Please try again.',
          isAuthenticated,
        }
      }
      return {
        success: true,
        message: 'Email verified successfully!',
        isAuthenticated,
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'An unexpected error occurred.',
        isAuthenticated,
      }
    }
  },
  head: () => getMetadata('/verify-email'),
})

function VerifyEmailPage() {
  const { message, success, isAuthenticated } = Route.useLoaderData()

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {success && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-center font-medium">{message}</p>
            </>
          )}

          {!success && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-center font-medium text-red-600">{message}</p>
            </>
          )}
          <Button
            render={
              <Link to={isAuthenticated ? '/dashboard' : '/signin'}>
                {isAuthenticated ? 'Go to Dashboard' : 'Go to Sign In'}
              </Link>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
