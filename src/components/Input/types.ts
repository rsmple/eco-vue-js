import type {DropdownMenuProps} from '../DropdownMenu/types'
import type {FieldWrapperProps} from '@/components/FieldWrapper/types'
import type {WrapSelectionType} from '@/utils/utils'
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
  autofocus?: boolean | number
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
  textTransparent?: boolean
  textParts?: TextPart[]
  rich?: boolean
  toolbarActions?: ToolbarAction[]
}

export interface InputAsyncProps<Type extends InputType> extends InputProps<Type> {
  validate?: ValidateFn | ValidateFn[]
  debounce?: number
  hideDebounce?: boolean
}

export interface InputSuggestProps<Type extends InputType> extends Omit<InputProps<Type>, 'unclickable'>, Partial<Omit<DropdownMenuProps, 'isOpen' | 'updateAlign' | 'emitUpdate'>> {
  mobileTitle?: string
  persist?: boolean
  closeOnClear?: boolean
  static?: boolean
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

export type WrapSelection = {
  type: WrapSelectionType.TOGGLE
  start: string
  end: string
  prepare?: (previousValue: string, offset: number) => string
  lineBreakPadding?: boolean
} | {
  type: WrapSelectionType.LINE_PREFIX
  linePrefix: string
  lineTransform?: never
  lineTransformAll?: never
  detectPattern?: never
} | {
  type: WrapSelectionType.LINE_PREFIX
  linePrefix?: never
  lineTransform: (line: string, index: number, lines: string[]) => string
  lineTransformAll?: never
  detectPattern?: RegExp
} | {
  type: WrapSelectionType.LINE_PREFIX
  linePrefix?: never
  lineTransform?: never
  lineTransformAll: (lines: string[]) => string
  detectPattern?: RegExp
}

export type ToolbarAction = {
  title?: string
  icon?: SVGComponent
  value?: WrapSelection | {title?: string, icon?: SVGComponent, value?: WrapSelection, label?: string}[]
  tooltip?: string
  disabled?: boolean
  label?: string
}

export type TextPart = {value: string, tag: keyof HTMLElementTagNameMap, edit?: boolean, class?: string} | string