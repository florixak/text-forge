import { Textarea } from './ui/textarea'

interface TextareaWithCounterProps extends React.ComponentProps<
  typeof Textarea
> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  maxLength: number
  label?: React.ReactNode
  id: string
  className?: string
}

export function TextareaWithCounter({
  value,
  onChange,
  maxLength,
  label,
  id,
  className,
  ...props
}: TextareaWithCounterProps) {
  return (
    <div className="space-y-1 relative">
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={`pb-6 ${className}`}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault()
            const textarea = e.target as HTMLTextAreaElement
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newValue =
              value.substring(0, start) + '\t' + value.substring(end)
            onChange({
              ...({
                target: { value: newValue },
              } as React.ChangeEvent<HTMLTextAreaElement>),
            })

            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + 1
            }, 0)
          }
        }}
        {...props}
      />
      <div className="text-right text-xs text-muted-foreground absolute bottom-2 right-2 z-10 pointer-events-none">
        {value.length} / {maxLength}
      </div>
    </div>
  )
}
