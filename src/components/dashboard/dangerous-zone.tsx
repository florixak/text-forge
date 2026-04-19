import { db } from '@/db'
import { subscription, user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { authMiddleware } from '@/lib/middleware'
import { getStripe } from '@/lib/stripe'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { sql } from 'drizzle-orm'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Card, CardTitle } from '../ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { getRequest } from '@tanstack/react-start/server'

const deleteAccountFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user: loggedUser } = context.session || {}

    if (!loggedUser) {
      throw new Response('Unauthorized', { status: 401 })
    }

    const subs = await db.transaction(async (tx) => {
      const subs = await tx
        .select()
        .from(subscription)
        .where(eq(subscription.userId, loggedUser.id))

      await tx
        .update(user)
        .set({
          enabled: false,
          email: `deleted_${loggedUser.id}_${Date.now()}@deleted.invalid`,
          deletedAt: sql`NOW()`,
        })
        .where(eq(user.id, loggedUser.id))

      return subs
    })
    if (subs.length > 0) {
      const stripe = getStripe()
      if (subs.length > 0) {
        const results = await Promise.allSettled(
          subs.map(async (sub) => {
            await stripe.subscriptions.cancel(sub.stripeSubscriptionId, {
              cancellation_details: {
                comment: 'User requested account deletion',
              },
            })
          }),
        )

        const failures = results.filter((r) => r.status === 'rejected')
        if (failures.length > 0) {
          throw new Error('Failed to cancel one or more subscriptions')
        }
      }
    }

    try {
      const request = getRequest()
      await auth.api.signOut({ headers: request.headers })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to revoke session during account deletion:', {
          userId: loggedUser.id,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return { success: true }
  })

const DangerousZone = () => {
  const navigate = useNavigate()
  const deleteAccount = useServerFn(deleteAccountFn)

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: () => {
      toast.success('Your account has been deleted successfully.')
      navigate({ to: '/signin' })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'An error occurred while deleting your account.',
      )
    },
  })

  return (
    <Card className="w-full bg-destructive/10 border-destructive p-4">
      <CardTitle className="text-destructive-foreground font-bold">
        Dangerous Zone
      </CardTitle>
      <p className="text-muted-foreground">
        This section contains actions that can have significant consequences.
        Please proceed with caution and ensure you understand the implications
        of any actions taken here.
      </p>
      <div className="flex flex-row items-start sm:items-center gap-4 justify-end">
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="destructive" disabled={isPending}>
                Delete Account
              </Button>
            }
          />
          <DialogContent>
            <DialogTitle className="text-lg font-bold mb-4 text-destructive-foreground">
              Are you absolutely sure?
            </DialogTitle>
            <p className="text-muted-foreground">
              Your account will be deactivated and you will lose access to all
              services. Your personal identifiers will be obfuscated, but your
              historical data (usage analytics, activity logs) will be retained.
              You will not be able to recover your account after deactivation.
            </p>
            <DialogFooter className="justify-end mt-4">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button
                variant="destructive"
                onClick={() => mutate()}
                disabled={isPending}
              >
                Delete My Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger
            render={<Button variant="outline">Learn More</Button>}
          />

          <DialogContent>
            <DialogTitle className="text-lg font-bold mb-4">
              Why is this action dangerous?
            </DialogTitle>
            <p className="text-muted-foreground">
              Deactivating your account will immediately revoke your access and
              cancel any active subscriptions. While we retain historical data
              for compliance purposes, your account cannot be reactivated once
              deleted.
            </p>
            <DialogFooter className="justify-end mt-4">
              <DialogClose render={<Button variant="outline">Got it</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}

export default DangerousZone
