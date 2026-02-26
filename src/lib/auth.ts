import { db } from '@/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { sendEmail } from './email'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error(
    'Google OAuth credentials are not set in environment variables.',
  )
}

const APP_URL = process.env.VITE_BASE_URL || 'http://localhost:3000'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [tanstackStartCookies()],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verifyURL = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`
      try {
        await sendEmail({
          to: user.email!,
          subject: 'Verify your email address',
          html: `
            <p>Click the link below to verify your email address:</p>
            <a href="${verifyURL}">${verifyURL}</a>
            <p>If you did not request this, please ignore this email.</p>
          `,
        })
      } catch (error) {
        throw error
      }
    },
  },
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
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
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        try {
          await sendEmail({
            to: user.email,
            subject: 'Approve email change',
            html: `
            <p>Click the link below to approve the change to ${newEmail}:</p>
            <a href="${url}">${url}</a>
          `,
          })
        } catch (error) {
          throw error
        }
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
