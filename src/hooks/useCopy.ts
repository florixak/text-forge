import { useState } from 'react'

const useCopy = () => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (content: string) => {
    if (!content) return

    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return { copied, handleCopy }
}

export default useCopy
