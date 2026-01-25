import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { planLimits } from '@/constants'
import { db } from '@/db'
import { aiUsage } from '@/db/schema'
import { authClient } from '@/lib/auth-client'
import { authMiddleware } from '@/lib/middleware'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'
import {
  CirclePile,
  ShieldCheck,
  Sparkles,
  Star,
  TextAlignStart,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
  errorComponent: () => <div>Failed to load dashboard</div>,
  pendingComponent: () => <div>Loading dashboard...</div>,
  loader: async ({ serverContext }) => {
    const { user } = serverContext?.session || {}

    if (!user) {
      throw new Response('Unauthorized', { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    const todayUsage = await db
      .select()
      .from(aiUsage)
      .where(and(eq(aiUsage.userId, user.id), eq(aiUsage.day, today)))
      .limit(1)

    const limit =
      planLimits[user.plan as keyof typeof planLimits].ai_generations_day
    const used = todayUsage[0]?.used ?? 0

    return {
      user,
      usage: {
        used,
        limit,
        remaining: limit - used,
        percentage: (used / limit) * 100,
      },
    }
  },
})

function RouteComponent() {
  const { user, usage } = Route.useLoaderData()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/signin', replace: true })
        },
      },
    })
  }

  if (usage.percentage >= 100) {
    return <div>Please upgrade your plan to continue using the service.</div>
  }

  return (
    <section className="max-w-3xl mx-auto min-h-screen flex flex-col items-start justify-center gap-8 mt-8">
      <div className="text-left">
        <h2 className="text-3xl font-bold mb-2">Hi, {user?.name}</h2>
        <p>Manage your account and AI usage</p>
      </div>

      <div className="flex flex-wrap gap-4 w-full">
        <Card className="p-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="bg-primary/10 p-2 rounded-md">
              <Star className="text-primary" />
            </div>
            <Button size="sm" asChild>
              <Link to="/plans">Upgrade</Link>
            </Button>
          </div>
          <div className="flex flex-col">
            <h4 className="text-lg font-bold">Free</h4>
            <p className="text-sm text-muted-foreground">Current Plan</p>
          </div>
        </Card>
        <Card className="p-4 flex-1">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-md">
              <Sparkles className="text-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold">
                {usage.used} / {usage.limit} used
              </h4>
              <span className="text-xs">{Math.round(usage.percentage)}%</span>
            </div>

            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-primary"
                style={{ width: `${usage.percentage}%` }}
              ></div>
            </div>

            <p className="text-sm text-muted-foreground">Resets at midnight</p>
          </div>
        </Card>
        <Card className="p-4 flex-1">
          <div className="flex items-center">
            <div className="bg-green-200/50 p-2 rounded-md">
              <ShieldCheck className="text-green-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <h4 className="text-lg font-bold">Active</h4>
            <p className="text-sm text-muted-foreground">Account Status</p>
          </div>
        </Card>
      </div>

      <div className="w-full flex flex-col">
        <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-4 w-full">
          <Link to="/" className="flex-1">
            <Card className="p-4 mb-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-accent/50">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-md">
                  <TextAlignStart className="text-primary" />
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold">Go To Formatter</h4>
                <p className="text-sm text-muted-foreground">
                  Clean and beautify your data
                </p>
              </div>
            </Card>
          </Link>
          <Link to="/" className="flex-1">
            <Card className="p-4 mb-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-accent/50">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-md">
                  <CirclePile className="text-primary" />
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold">AI Structuring</h4>
                <p className="text-sm text-muted-foreground">
                  Structure unorganized data using AI
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      <Card className="w-full pb-0">
        <CardHeader className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Usage Info</h3>
          <Link to="/history" className="text-primary">
            View History
          </Link>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h5>Daily Limit</h5>
              <p className="text-sm text-muted-foreground">
                Standard for {user.plan} tier users
              </p>
            </div>
            <p className="font-semibold text-base">{usage.limit} Generations</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h5>Words Processed Today</h5>
              <p className="text-sm text-muted-foreground">
                Total words processed so far today
              </p>
            </div>
            <p className="font-semibold text-base">1,240 words</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h5>Last Used</h5>
              <p className="text-sm text-muted-foreground">
                Your most recent AI generation
              </p>
            </div>
            <p className="font-semibold text-base">2 hours ago</p>
          </div>
        </CardContent>
        <CardFooter className="bg-border/50 flex flex-col items-center p-4">
          <p className="text-sm">
            Need more power?{' '}
            <Link to="/plans" className="text-primary font-semibold">
              Compare all plans
            </Link>
          </p>
        </CardFooter>
      </Card>

      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </section>
  )
}
