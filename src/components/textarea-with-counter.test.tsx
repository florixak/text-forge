import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { TextareaWithCounter } from './textarea-with-counter'

const Harness = ({
  initial = 'hi',
  maxLength = 10,
}: {
  initial?: string
  maxLength?: number
}) => {
  const [value, setValue] = useState(initial)
  return (
    <TextareaWithCounter
      id="input"
      label="Input"
      value={value}
      maxLength={maxLength}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

describe('TextareaWithCounter', () => {
  it('should show the current length against the max', () => {
    render(<Harness />)
    expect(screen.getByText('2 / 10')).toBeTruthy()
  })

  it('should update the counter when user types', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const textarea = screen.getByRole('textbox', { name: 'Input' })
    await user.type(textarea, '!')
    expect((textarea as HTMLTextAreaElement).value).toBe('hi!')
    expect(screen.getByText('3 / 10')).toBeTruthy()
  })

  it('should insert a tab instead of moving focus', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Harness />
        <input aria-label="Next field" />
      </>,
    )

    const textarea = screen.getByRole('textbox', { name: 'Input' })
    await user.click(textarea)
    await user.keyboard('{Tab}')

    expect((textarea as HTMLTextAreaElement).value).toBe('hi\t')
    expect(screen.getByText('3 / 10')).toBeTruthy()
    expect(document.activeElement).toBe(textarea)
    expect(document.activeElement).not.toBe(
      screen.getByRole('textbox', { name: 'Next field' }),
    )
  })
})
