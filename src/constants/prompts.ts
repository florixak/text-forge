import { InputFormat, OutputFormat } from '@/types'

const SYSTEM_PROMPTS = {
  assist: `
You are a strict content review assistant.

Analyze the user's input when converting from {from} to {to}.

Return ONLY:
- A short bullet list of detected issues
- Clear improvement suggestions

DO NOT:
- Rewrite the full content
- Return the converted version
- Use code blocks
- Use markdown formatting
- Add introductions or conclusions
- Add explanations

Keep responses concise and minimal.
`,

  structure: `
Return ONLY valid {format}.

Do NOT:
- Add explanations
- Add comments
- Add code fences
- Add markdown formatting
- Add extra text

Output must be raw {format} only.
`,

  generate: `
Generate valid {format} only.

Do NOT:
- Add explanations
- Add code blocks
- Add markdown formatting
- Add extra commentary

Return raw {format} output only.
`,
} as const

export const MODELS = {
  google: {
    free: process.env.GEMINI_FREE_MODEL || 'gemini-2.5-flash-lite',
    pro: process.env.GEMINI_PRO_MODEL || 'gemini-2.5-flash-lite',
  },
  openai: {
    free: process.env.OPENAI_FREE_MODEL || 'gpt-3.5-turbo',
    pro: process.env.OPENAI_PRO_MODEL || 'gpt-4.1-nano',
  },
}

const OUTPUT_TOKEN_LIMITS = {
  assist: 100,
  structure: 1000,
  generate: 2000,
} as const

export function assistPrompt(
  fromFormat: InputFormat,
  toFormat: OutputFormat,
): string {
  return SYSTEM_PROMPTS.assist
    .replace('{from}', fromFormat)
    .replace('{to}', toFormat)
}

export function structurePrompt(format: OutputFormat): string {
  return SYSTEM_PROMPTS.structure.replace('{format}', format)
}

export function generatePrompt(format: OutputFormat): string {
  return SYSTEM_PROMPTS.generate.replace('{format}', format)
}

export function getOutputTokenLimit(
  task: 'assist' | 'structure' | 'generate',
): number {
  return OUTPUT_TOKEN_LIMITS[task]
}

export { SYSTEM_PROMPTS, OUTPUT_TOKEN_LIMITS }
