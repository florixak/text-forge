import { InputFormat } from '@/constants'
import {
  assistPrompt,
  generatePrompt,
  structurePrompt,
} from '@/constants/prompts'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables.')
}

const openai = createOpenAI({
  apiKey,
})

export async function assistText(input: string) {
  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
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
      model: openai('gpt-4o-mini'),
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
      model: openai('gpt-4o-mini'),
      system: generatePrompt(format),
      prompt: description,
    })

    return result.text
  } catch (error) {
    throw new Error('Failed to generate data: ' + (error as Error).message)
  }
}
