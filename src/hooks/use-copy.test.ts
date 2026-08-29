import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useCopy from './use-copy'

const writeText = vi.fn().mockResolvedValue(undefined)

describe('useCopy', () => {
  beforeEach(() => {
    writeText.mockClear()
    writeText.mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('should return false for empty or whitespace content', async () => {
    const { result } = renderHook(() => useCopy())

    expect(result.current.copied).toBe(false)

    let ok = true
    await act(async () => {
      ok = await result.current.handleCopy('   ')
    })

    expect(ok).toBe(false)
    expect(result.current.copied).toBe(false)
    expect(writeText).not.toHaveBeenCalled()
  })

  it('should copy the text to the clipboard', async () => {
    const { result } = renderHook(() => useCopy())

    let ok = false
    await act(async () => {
      ok = await result.current.handleCopy('hello')
    })

    expect(ok).toBe(true)
    expect(result.current.copied).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('should reset the copied state after 2 seconds', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useCopy())

    await act(async () => {
      await result.current.handleCopy('hello')
    })
    expect(result.current.copied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.copied).toBe(false)
  })

  it('should return false when writeText throws', async () => {
    const { result } = renderHook(() => useCopy())
    await act(async () => {
      await result.current.handleCopy('hello')
    })
    expect(result.current.copied).toBe(true)
    writeText.mockRejectedValueOnce(new Error('denied'))
    let ok = true
    await act(async () => {
      ok = await result.current.handleCopy('hello')
    })
    expect(ok).toBe(false)
    expect(result.current.copied).toBe(false)
  })
})
