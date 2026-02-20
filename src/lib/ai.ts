import { PLAN_LIMITS } from '@/constants'
import {
  assistPrompt,
  generatePrompt,
  getOutputTokenLimit,
  structurePrompt,
} from '@/constants/prompts'
import { User } from '@/db/schema'
import { InputFormat, OutputFormat } from '@/types'
import { generateText, LanguageModel } from 'ai'
import { ProcessedInput, processInput } from './input-processor'

interface AIOptions {
  model: LanguageModel
  plan: User['plan']
  verbose?: boolean
}

export interface AIResult {
  text: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  processing?: ProcessedInput
}

async function baseGenerateText(
  systemPrompt: string,
  userPrompt: string,
  task: 'assist' | 'structure' | 'generate',
  options: AIOptions,
): Promise<AIResult> {
  if (!options.model) {
    throw new Error(`No language model specified for ${task}.`)
  }

  try {
    const result = await generateText({
      model: options.model,
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: getOutputTokenLimit(task),
    })
    if (import.meta.env.DEV) {
      console.log(`Generating ${task} with model ${options.model}...`)
      console.log('System prompt:', systemPrompt)
      console.log('User prompt:', userPrompt)
      console.log(`${task} result:`, result.text)
      console.log(`${task} token usage:`, result.usage)
      console.log(`${task} token total usage:`, result.totalUsage)
    }

    return {
      text: result.text,
      usage: result.usage
        ? {
            inputTokens: result.usage.inputTokens || 0,
            outputTokens: result.usage.outputTokens || 0,
            totalTokens: result.usage.totalTokens || 0,
          }
        : undefined,
    }
  } catch (error) {
    throw new Error(`Failed to ${task} text: ` + (error as Error).message)
  }
}

export async function baseAssistText(
  input: string,
  fromType: InputFormat,
  toType: OutputFormat,
  model: LanguageModel,
  plan: User['plan'],
) {
  const maxLength = PLAN_LIMITS[plan].max_input_length

  const processed = processInput(input, fromType, maxLength, toType)

  const userPrompt = `Sample:\n${processed.content}`

  return baseGenerateText(
    assistPrompt(fromType, toType),
    userPrompt,
    'assist',
    { model, plan },
  ).then((result) => ({
    ...result,
    processing: processed,
  }))
}

export async function baseStructureData(
  input: string,
  format: OutputFormat,
  model: LanguageModel,
  plan: User['plan'],
) {
  const maxLength = PLAN_LIMITS[plan].max_input_length

  const detectedFormat = detectFormat(input)
  const processed = processInput(input, detectedFormat, maxLength, format)

  const compressionNote =
    processed.compressionRatio < 0.6
      ? `\n(Note: Input sampled to fit context. Pattern should apply to all ${processed.metadata.sampleInfo || 'data'}.)`
      : ''

  const userPrompt = `${processed.content}${compressionNote}`

  return baseGenerateText(structurePrompt(format), userPrompt, 'structure', {
    model,
    plan,
  }).then((result) => ({
    ...result,
    processing: processed,
  }))
}

export async function baseGenerateData(
  description: string,
  format: OutputFormat,
  model: LanguageModel,
  plan: User['plan'],
) {
  const normalized = description
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .join('\n')

  return baseGenerateText(generatePrompt(format), normalized, 'generate', {
    model,
    plan,
  })
}

function detectFormat(input: string): InputFormat {
  try {
    JSON.parse(input)
    return 'JSON'
  } catch {}

  if (
    /<\?xml[\s\S]*?\?>/.test(input) ||
    /<([a-z][\w-]*)[\s\S]*?<\/\1>/i.test(input)
  ) {
    return 'XML'
  }

  if (/^\s{0,3}(#{1,6})\s.+/m.test(input) || /```[\s\S]*?```/m.test(input)) {
    return 'Markdown'
  }

  const lines = input.split('\n').filter(Boolean)
  if (lines.length > 1) {
    const commaCounts = lines.map((l) => (l.match(/,/g) || []).length)
    if (commaCounts.every((c) => c === commaCounts[0] && c > 0)) {
      return 'CSV'
    }
  }

  return 'Text'
}
