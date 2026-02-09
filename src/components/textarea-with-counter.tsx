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
        className={className}
        {...props}
      />
      <div className="text-right text-xs text-muted-foreground mt-1 absolute bottom-1 right-2 z-50">
        {value.length} / {maxLength}
      </div>
    </div>
  )
}
