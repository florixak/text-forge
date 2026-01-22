import { InputType } from '@/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface TypeSelectProps {
  placeholder?: string
  selectedType?: string
  setSelectedType?: (type: InputType) => void
  defaultValue?: string
  inputTypes: readonly InputType[]
  id?: string
}

const TypeSelect = ({
  placeholder = 'Select ',
  selectedType,
  setSelectedType,
  defaultValue,
  inputTypes,
  id,
}: TypeSelectProps) => {
  return (
    <Select
      defaultValue={defaultValue}
      value={selectedType}
      onValueChange={setSelectedType}
    >
      <SelectTrigger className="w-45" id={id}>
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

export default TypeSelect
