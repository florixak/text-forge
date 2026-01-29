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
        type: ['free', 'pro'],
        default: 'free',
        required: true,
      },
      enabled: {
        type: 'boolean',
        default: true,
        required: true,
      },
    },
  },
})

export type Auth = typeof auth
