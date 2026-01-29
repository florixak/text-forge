const assistPrompt = `Suggest clear, concise improvements to the user's text.`

const structurePrompt = (format: string) =>
  `Convert unstructured text into structured ${format}. Return only valid ${format}.`

const generatePrompt = (format: string) =>
  `Generate structured data in ${format} based on the user's description. Return only valid ${format}.`

export { assistPrompt, structurePrompt, generatePrompt }
