import { cn } from '@/lib/utils'

interface OutputProps {
  input: string
  output: string
  success: boolean
  error: string | undefined
  className?: string
}

const Output = ({ input, output, success, error, className }: OutputProps) => {
  return (
    <pre
      className={cn(
        `mt-4 h-130 marble-gradient rounded-t-md overflow-y-auto`,
        className,
      )}
    >
      <div className="p-4 font-mono text-sm whitespace-pre-wrap">
        <code>{error ? error : success ? output : input}</code>
      </div>
    </pre>
  )
}

export default Output
