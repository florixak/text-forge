import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useLocalStorage } from './use-local-storage'

describe('useLocalStorage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('should return undefined when the key is missing', () => {
    const { result } = renderHook(() => useLocalStorage<{ n: number }>('prefs'))

    expect(result.current.getItem()).toBeUndefined()
  })

  it('should stringify on set and parse on get', () => {
    const { result } = renderHook(() => useLocalStorage<{ n: number }>('prefs'))

    result.current.setItem({ n: 1 })
    expect(result.current.getItem()).toEqual({ n: 1 })
    expect(JSON.parse(localStorage.getItem('prefs')!)).toEqual({ n: 1 })
  })

  it('should remove the key', () => {
    const { result } = renderHook(() => useLocalStorage<{ n: number }>('prefs'))

    result.current.setItem({ n: 1 })
    result.current.removeItem()

    expect(result.current.getItem()).toBeUndefined()
    expect(JSON.parse(localStorage.getItem('prefs')!)).toBeNull()
  })

  it('returns undefined when stored JSON is invalid', () => {
    const { result } = renderHook(() => useLocalStorage<{ n: number }>('prefs'))
    localStorage.setItem('prefs', '{not json')
    expect(result.current.getItem()).toBeUndefined()
  })
})
