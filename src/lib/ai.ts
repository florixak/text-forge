import { MAX_INPUT_LENGTH } from '@/constants'
import {
  assistPrompt,
  generatePrompt,
  structurePrompt,
} from '@/constants/prompts'
import { InputFormat, OutputFormat } from '@/types'
import { generateText, LanguageModel } from 'ai'

export async function baseAssistText(
  input: string,
  fromType: InputFormat,
  toType: OutputFormat,
  model: LanguageModel,
) {
  if (!model) {
    throw new Error('No language model specified for text assistance.')
  }

  const getSample = (text: string, maxLength: number = 1000): string => {
    if (text.length <= maxLength) return text

    const start = text.substring(0, 500)
    const middle = text.substring(
      Math.floor(text.length / 2) - 100,
      Math.floor(text.length / 2) + 100,
    )
    const end = text.substring(text.length - 300)

    const preservedLength = start.length + middle.length + end.length
    const truncatedCount = text.length - preservedLength

    return `${start}...[truncated ${truncatedCount} characters]...${middle}...[truncated]...${end}`
  }

  const sample = getSample(input, MAX_INPUT_LENGTH)

  try {
    const result = await generateText({
      model,
      system: assistPrompt(fromType, toType),
      prompt: `Sample of user's data:\n${sample}`,
      maxOutputTokens: 200,
    })

    return result.text
  } catch (error) {
    throw new Error('Failed to assist text: ' + (error as Error).message)
  }
}

export async function baseStructureData(
  input: string,
  format: OutputFormat,
  model: LanguageModel,
) {
  if (!model) {
    throw new Error('No language model specified for data structuring.')
  }

  const MAX_LENGTH = 2000

  if (input.length <= MAX_LENGTH) {
    try {
      const result = await generateText({
        model,
        system: structurePrompt(format),
        prompt: input,
      })
      return result.text
    } catch (error) {
      throw new Error('Failed to structure data: ' + (error as Error).message)
    }
  }

  const lines = input.split('\n')
  const sampleLines = Math.min(15, lines.length)
  const sample = lines.slice(0, sampleLines).join('\n').substring(0, MAX_LENGTH)

  try {
    const result = await generateText({
      model,
      system: structurePrompt(format),
      prompt: `Sample of unstructured data (showing ${sampleLines} of ${lines.length} total lines):\n\n${sample}\n\nStructure this sample as ${format}. The same pattern will be applied to all remaining lines.`,
    })

    return result.text
  } catch (error) {
    throw new Error('Failed to structure data: ' + (error as Error).message)
  }
}

export async function baseGenerateData(
  description: string,
  format: OutputFormat,
  model: LanguageModel,
) {
  if (!model) {
    throw new Error('No language model specified for data generation.')
  }

  try {
    const result = await generateText({
      model,
      system: generatePrompt(format),
      prompt: description,
    })

    return result.text
  } catch (error) {
    throw new Error('Failed to generate data: ' + (error as Error).message)
  }
}
