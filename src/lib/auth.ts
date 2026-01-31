import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/db'
import { aiUsage } from '@/db/schema'
import { createAuthMiddleware } from 'better-auth/api'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [tanstackStartCookies()],
  emailAndPassword: {
    enabled: true,
  },
  /*emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {},
  },*/
  user: {
    additionalFields: {
      plan: {
        type: ['free', 'pro'],
        required: true,
      },
      enabled: {
        type: 'boolean',
        required: true,
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/sign-up')) {
        console.log('Signup detected, initializing AI usage for user')
        const newSession = ctx.context.newSession
        if (newSession) {
          await db.insert(aiUsage).values({
            userId: newSession.user.id,
            day: new Date().toISOString().split('T')[0],
            assist_ai: 0,
            structure_ai: 0,
            generate_ai: 0,
            words: 0,
          })
        }
      } else {
        console.log('No action for path:', ctx.path)
      }
    }),
  },
})

export type Auth = typeof auth
