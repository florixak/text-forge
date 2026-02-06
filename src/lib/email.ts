import { CreateEmailResponseSuccess, Resend } from 'resend'

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
}): Promise<CreateEmailResponseSuccess> {
  if (!to || !subject || !html) {
    throw new Error('To, subject, and html are required to send an email.')
  }
  try {
    const { data, error } = await resend.emails.send({
      from: `Ondřej <${FROM_EMAIL!}>`,
      to,
      subject,
      html,
    })
    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }
    return data
  } catch (error) {
    throw error
  }
}
