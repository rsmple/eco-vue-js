import type {Theme} from '@/main'

export interface ToggleProps<Value extends boolean | null> {
  modelValue: Value
  title?: string
  icon?: SVGComponent
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
  center?: boolean
  mandatory?: boolean
}

export interface ToggleThemeProps extends Omit<ToggleProps<boolean>, 'modelValue' | 'icon' | 'negate' | 'intermediate'> {
  modelValue: Theme
}
