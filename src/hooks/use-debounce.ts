import { useState, useEffect } from 'react'

type UseDebounceParams<T> = {
  value: T
  delay: number
  onDebounce?: (value: T) => void
}

const useDebounce = <T>({ value, delay, onDebounce }: UseDebounceParams<T>) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
      onDebounce?.(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay, onDebounce])

  return { debouncedValue }
}

export default useDebounce
