import { CreateEmailResponseSuccess, Resend } from 'resend'

function getEmailClient() {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL

  if (!apiKey) {
    throw new Error('Resend API key is not set in environment variables.')
  }

  if (!fromEmail) {
    throw new Error('From email is not set in environment variables.')
  }

  return {
    resend: new Resend(apiKey),
    fromEmail,
  }
}

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

  const { resend, fromEmail } = getEmailClient()

  try {
    const { data, error } = await resend.emails.send({
      from: `TextForge <${fromEmail}>`,
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
