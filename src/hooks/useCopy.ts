import { useEffect, useRef, useState } from 'react'

const useCopy = () => {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = async (content: string) => {
    if (!content?.trim()) return
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText)
      return
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
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
