import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface FormatSelectProps<T> {
  placeholder?: string
  selectedFormat?: T
  setSelectedFormat?: (type: T) => void
  defaultValue?: T
  inputTypes: readonly T[]
  id?: string
  className?: string
}

const FormatSelect = <T,>({
  placeholder = 'Select',
  selectedFormat,
  setSelectedFormat,
  defaultValue,
  inputTypes,
  id,
  className,
}: FormatSelectProps<T>) => {
  return (
    <Select
      defaultValue={defaultValue as string}
      value={selectedFormat as string}
      onValueChange={(value) => setSelectedFormat?.(value as T)}
    >
      <SelectTrigger className={cn(`w-45 bg-card`, className)} id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {inputTypes.map((type) => (
          <SelectItem key={type as string} value={type as string}>
            {String(type)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default FormatSelect
