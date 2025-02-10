export interface ToggleProps<Value extends boolean | null> {
  modelValue: Value
  title?: string
  small?: boolean
  disabled?: boolean
  loading?: boolean
  readonly?: boolean
  rightLabel?: boolean
  noMargin?: boolean
  description?: string
  intermediate?: boolean
  negate?: boolean
  validate?: ValidateFn | ValidateFn[]
}
