import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { baseAssistText, baseGenerateData, baseStructureData } from './ai'
import { InputFormat, OutputFormat } from '@/types'
import { User } from '@/db/schema'
import { MODELS } from '@/constants/prompts'

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
    google(MODELS.google[plan]),
    plan,
  )
}

export async function structureData(
  input: string,
  format: OutputFormat,
  plan: User['plan'],
) {
  return baseStructureData(input, format, google(MODELS.google[plan]), plan)
}

export async function generateData(
  description: string,
  format: OutputFormat,
  plan: User['plan'],
) {
  return baseGenerateData(
    description,
    format,
    google(MODELS.google[plan]),
    plan,
  )
}
