import { InputFormat } from '@/constants'
import {
  assistPrompt,
  generatePrompt,
  structurePrompt,
} from '@/constants/prompts'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

const apiKey = process.env.GOOGLE_API_KEY

if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is not defined in environment variables.')
}

const google = createGoogleGenerativeAI({
  apiKey,
})

export async function assistText(input: string) {
  try {
    const result = await generateText({
      model: google('gemini-2.5-flash-lite'),
      system: assistPrompt,
      prompt: input,
    })

    return result.text
  } catch (error) {
    throw new Error('Failed to assist text: ' + (error as Error).message)
  }
}

export async function structureData(input: string, format: InputFormat) {
  try {
    const result = await generateText({
      model: google('gemini-2.5-flash-lite'),
      system: structurePrompt(format),
      prompt: input,
    })

    return result.text
  } catch (error) {
    throw new Error('Failed to structure data: ' + (error as Error).message)
  }
}

export async function generateData(description: string, format: InputFormat) {
  try {
    const result = await generateText({
      model: google('gemini-2.5-flash-lite'),
      system: generatePrompt(format),
      prompt: description,
    })

    return result.text
  } catch (error) {
    throw new Error('Failed to generate data: ' + (error as Error).message)
  }
}
