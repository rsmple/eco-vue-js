import type {DropdownMenuProps} from '../DropdownMenu/types'
import type {FieldWrapperProps} from '@/components/FieldWrapper/types'
import type {Component} from 'vue'

export interface InputProps<Type extends InputType> extends Omit<FieldWrapperProps, 'modelValue'> {
  modelValue?: (Type extends 'number' ? number : string) | undefined
  type?: Type

  textarea?: boolean
  resize?: boolean

  placeholder?: string
  icon?: SVGComponent
  size?: number
  maxLength?: number
  step?: number
  min?: number
  max?: number

  name?: string
  autocomplete?: 'off' | string
  autofocus?: boolean
  readonly?: boolean
  unclickable?: boolean | null
  disabledActions?: boolean
  loading?: boolean

  spellcheck?: boolean
  customBackspaceHandle?: boolean
  textSecure?: boolean
  placeholderSecure?: boolean
  allowClear?: boolean
  allowPaste?: boolean
  hideInput?: boolean
  noWrap?: boolean
}

export interface InputAsyncProps<Type extends InputType> extends InputProps<Type> {
  validate?: ValidateFn | ValidateFn[]
  debounce?: number
  hideButton?: boolean
}

export interface InputSuggestProps<Type extends InputType> extends InputProps<Type>, Partial<Omit<DropdownMenuProps, 'isOpen' | 'updateAlign' | 'emitUpdate'>> {
  mobileTitle?: string
  persist?: boolean
  closeOnClear?: boolean
}

export interface InputOptionsProps<Type extends InputType, Option> extends InputSuggestProps<Type> {
  options: Option[]
  valueGetter: (option: Option) => Required<InputSuggestProps<Type>>['modelValue']
  emptyStub?: string
  optionComponent?: Component<{option: Option, selected?: boolean, model?: boolean}>
}

export interface InputDateProps extends Omit<InputSuggestProps<'text'>, 'modelValue'> {
  modelValue?: Date | undefined
  minDate?: Date
  maxDate?: Date
}
