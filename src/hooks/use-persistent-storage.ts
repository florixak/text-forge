import { useState } from 'react'
import useDebounce from './use-debounce'
import { useLocalStorage } from './use-local-storage'

interface UsePersistentStorageOptions<T> {
  key: string
  initialData: T
  debounceDelay?: number
  onSave?: (data: T) => void
}

export function usePersistentStorage<T>({
  key,
  initialData,
  debounceDelay = 500,
  onSave,
}: UsePersistentStorageOptions<T>) {
  const { setItem, getItem } = useLocalStorage<T>(key)

  const [data, setData] = useState<T>(() => {
    if (typeof window === 'undefined') return initialData
    return getItem() ?? initialData
  })

  const { debouncedValue } = useDebounce<T>({
    value: data,
    delay: debounceDelay,
    onDebounce: (debouncedData) => {
      setItem(debouncedData)
      onSave?.(debouncedData)
    },
  })

  const updateData = (updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const reset = () => {
    setData(initialData)
    setItem(initialData)
  }

  return {
    data,
    setData,
    updateData,
    reset,
    storedData: getItem() ?? initialData,
    debouncedData: debouncedValue,
  }
}
