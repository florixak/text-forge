import { Spinner } from '../ui/spinner'

const LoadingIndicator = ({ text = 'Loading...' }: { text?: string }) => {
  return (
    <div className="min-h-screen flex-center flex-col gap-4">
      <Spinner className="size-12 text-muted-foreground" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  )
}

export default LoadingIndicator
