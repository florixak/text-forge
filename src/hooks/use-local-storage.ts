export const useLocalStorage = <T>(key: string) => {
  const setItem = (value: T) => {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log(error)
      }
    }
  }

  const getItem = (): T | undefined => {
    try {
      if (typeof window === 'undefined') return undefined
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : undefined
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log(error)
      }
    }
  }

  const removeItem = () => {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.removeItem(key)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log(error)
      }
    }
  }

  return { setItem, getItem, removeItem }
}
