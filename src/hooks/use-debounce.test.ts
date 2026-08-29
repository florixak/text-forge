import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import useDebounce from './use-debounce'

describe('useDebounce', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not update until the delay has elapsed', () => {
    vi.useFakeTimers()
    const onDebounce = vi.fn()

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce({ value, delay: 500, onDebounce }),
      {
        initialProps: { value: 'a' },
      },
    )

    expect(result.current.debouncedValue).toBe('a')

    rerender({ value: 'ab' })
    expect(result.current.debouncedValue).toBe('a')
    expect(onDebounce).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.debouncedValue).toBe('ab')
    expect(onDebounce).toHaveBeenCalledTimes(1)
    expect(onDebounce).toHaveBeenLastCalledWith('ab')
    rerender({ value: 'abc' })
    expect(result.current.debouncedValue).toBe('ab')
    expect(onDebounce).toHaveBeenCalledTimes(1)
  })
})
