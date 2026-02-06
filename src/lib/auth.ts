import { db } from '@/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { sendEmail } from './email'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    'Google OAuth credentials are not set in environment variables.',
  )
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [tanstackStartCookies()],
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      const verifyURL = `${new URL(url).origin}/verify-email?token=${token}`
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
      clientId: googleClientId,
      clientSecret: googleClientSecret,
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
