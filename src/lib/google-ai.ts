import { InputFormat, OutputFormat } from '@/constants'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { baseAssistText, baseGenerateData, baseStructureData } from './ai'

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
) {
  return baseAssistText(
    input,
    fromType,
    toType,
    google('gemini-2.5-flash-lite'),
  )
}

export async function structureData(input: string, format: OutputFormat) {
  return baseStructureData(input, format, google('gemini-2.5-flash-lite'))
}

export async function generateData(description: string, format: OutputFormat) {
  return baseGenerateData(description, format, google('gemini-2.5-flash-lite'))
}
