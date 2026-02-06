import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL

if (!RESEND_API_KEY) {
  throw new Error('Resend API key is not set in environment variables.')
}

if (!FROM_EMAIL) {
  throw new Error('From email is not set in environment variables.')
}

const resend = new Resend(RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!to || !subject || !html) {
    throw new Error('To, subject, and html are required to send an email.')
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL!,
      to,
      subject,
      html,
    })
  } catch (error) {
    throw error
  }
}
