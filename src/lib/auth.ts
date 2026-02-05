import { db } from '@/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
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
  /*hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/sign-up')) {
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
      }
    }),
  },*/
})

export type Auth = typeof auth
