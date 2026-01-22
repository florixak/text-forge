import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface TypeSelectProps {
  placeholder?: string
  defaultValue?: string
  inputTypes: readonly string[]
  id?: string
}

const TypeSelect = ({
  placeholder = 'Select ',
  defaultValue,
  inputTypes,
  id,
}: TypeSelectProps) => {
  return (
    <Select defaultValue={defaultValue}>
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
