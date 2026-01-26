import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/db'

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
        type: 'string',
        options: ['free', 'pro'],
        default: 'free',
      },
      enabled: {
        type: 'boolean',
        default: true,
      },
    },
  },
})
