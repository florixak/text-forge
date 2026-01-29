const assistPrompt = `Suggest clear, concise improvements to the user's text.`

const structurePrompt = (format: string) =>
  `Convert text into structured ${format}. Return only valid ${format} data, without any extra text.`

const generatePrompt = (format: string) =>
  `Generate structured data in ${format} based on the user's description. Return only valid ${format} data, without any extra text.`

export { assistPrompt, structurePrompt, generatePrompt }
