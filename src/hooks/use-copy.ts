import { useEffect, useRef, useState } from 'react'

const useCopy = () => {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = async (content: string): Promise<boolean> => {
    if (!content?.trim()) return false
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText)
      return false
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
      return true
    } catch {
      setCopied(false)
      return false
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])
  return { copied, handleCopy }
}

export default useCopy
