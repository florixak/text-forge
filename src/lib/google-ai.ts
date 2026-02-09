import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { baseAssistText, baseGenerateData, baseStructureData } from './ai'
import { InputFormat, OutputFormat } from '@/types'
import { User } from '@/db/schema'

const apiKey = process.env.GOOGLE_API_KEY

if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is not defined in environment variables.')
}

const google = createGoogleGenerativeAI({
  apiKey,
})

export async function assistText(
  input: string,
  fromType: InputFormat,
  toType: OutputFormat,
  plan: User['plan'],
) {
  return baseAssistText(
    input,
    fromType,
    toType,
    google('gemini-2.5-flash-lite'),
    plan,
  )
}

export async function structureData(
  input: string,
  format: OutputFormat,
  plan: User['plan'],
) {
  return baseStructureData(input, format, google('gemini-2.5-flash-lite'), plan)
}

export async function generateData(description: string, format: OutputFormat) {
  return baseGenerateData(description, format, google('gemini-2.5-flash-lite'))
}
