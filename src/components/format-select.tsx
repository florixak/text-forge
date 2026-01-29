import { InputType } from '@/constants'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface FormatSelectProps {
  placeholder?: string
  selectedFormat?: InputType
  setSelectedFormat?: (type: InputType) => void
  defaultValue?: InputType
  inputTypes: readonly InputType[]
  id?: string
  className?: string
}

const FormatSelect = ({
  placeholder = 'Select',
  selectedFormat,
  setSelectedFormat,
  defaultValue,
  inputTypes,
  id,
  className,
}: FormatSelectProps) => {
  return (
    <Select
      defaultValue={defaultValue}
      value={selectedFormat}
      onValueChange={setSelectedFormat}
    >
      <SelectTrigger className={cn(`w-45 bg-card`, className)} id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {inputTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default FormatSelect
