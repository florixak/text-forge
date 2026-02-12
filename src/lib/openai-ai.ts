import { User } from '@/db/schema'
import { InputFormat, OutputFormat } from '@/types'
import { createOpenAI } from '@ai-sdk/openai'
import { baseAssistText, baseGenerateData, baseStructureData } from './ai'
import { MODELS } from '@/constants/prompts'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables.')
}

const openai = createOpenAI({
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
    openai(MODELS.openai[plan]),
    plan,
  )
}

export async function structureData(
  input: string,
  format: OutputFormat,
  plan: User['plan'],
) {
  return baseStructureData(input, format, openai(MODELS.openai[plan]), plan)
}

export async function generateData(
  description: string,
  format: OutputFormat,
  plan: User['plan'],
) {
  return baseGenerateData(
    description,
    format,
    openai(MODELS.openai[plan]),
    plan,
  )
}
