import type {DropdownMenuProps} from '../DropdownMenu/types'
import type {FieldWrapperProps} from '@/components/FieldWrapper/types'
import type {WrapSelectionType} from '@/utils/utils'
import type {Component} from 'vue'

export type InputClearValue = '' | undefined | null

export interface InputProps<Type extends InputType, ClearValue extends InputClearValue = ''> extends Omit<FieldWrapperProps, 'modelValue'> {
  /** Field value — a `number` when `type` is `number`, otherwise a `string`. */
  modelValue?: (Type extends 'number' ? number : string) | undefined | null
  /** Native input type. `number` parses the value into a number. */
  type?: Type

  /** Multi-line editor instead of a single-line input, with undo and redo. */
  textarea?: boolean
  /** Lets the user drag the textarea's height. */
  resize?: boolean

  /** Hint shown while the field is empty. */
  placeholder?: string
  /** Icon at the start of the field, highlighted while focused. */
  icon?: SVGComponent
  /** Native `size` attribute, which sets the input's minimum width in characters. */
  size?: number
  /** Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. */
  maxLength?: number
  /** Native `step` attribute for `type="number"`. */
  step?: number
  /** Native `min` attribute for `type="number"`. */
  min?: number
  /** Native `max` attribute for `type="number"`. */
  max?: number

  /** Native `name` attribute. */
  name?: string
  /** Native `autocomplete` attribute. */
  autocomplete?: 'off' | string
  /** Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. */
  autofocus?: boolean | number
  /** Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. */
  readonly?: boolean
  /** Blocks typing and turns a click into a `focus` event, for fields that open a menu instead of taking text. */
  unclickable?: boolean | null
  /** Disables the action buttons (clear, paste, copy) while keeping the input editable. */
  disabledActions?: boolean
  /** Shows a spinner in the actions and blocks input. */
  loading?: boolean

  /** Enables the browser's spell check. */
  spellcheck?: boolean
  /** Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. */
  customBackspaceHandle?: boolean
  /** Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. */
  textSecure?: boolean
  /** Shows the secret-set check mark while the field is empty. */
  placeholderSecure?: boolean
  /** Adds a button that clears the value, emitting `clearValue`. */
  allowClear?: boolean
  /** Value emitted when cleared or emptied by editing. Defaults to `''` (`undefined` for `type="number"`); set it explicitly to emit `undefined` or `null`. */
  clearValue?: ClearValue
  /** Adds a button that pastes from the clipboard, replacing the value. */
  allowPaste?: boolean
  /** Hides the text input, leaving only the `prefix` content. */
  hideInput?: boolean
  /** Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. */
  noWrap?: boolean
  /** Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. */
  textTransparent?: boolean
  /** Textarea content as a list of strings and tagged parts, for highlighting parts of the text. */
  textParts?: TextPart[]
  /** Adds a formatting toolbar to the textarea. */
  rich?: boolean
  /** Custom buttons for the textarea toolbar. */
  toolbarActions?: ToolbarAction[]
  /** Border color classes, replacing the default gray. */
  borderClass?: string

  /** Keeps edits local and emits them only when saved — on Enter or blur — instead of on every keystroke. */
  async?: boolean
  /** With `async`, also saves after this many ms without typing, showing a progress bar under the text. */
  debounce?: number
  /** Hides the `debounce` progress bar. */
  hideDebounce?: boolean
  /** With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. */
  explicit?: boolean
}

export interface InputAsyncProps<Type extends InputType, ClearValue extends InputClearValue = ''> extends InputProps<Type, ClearValue> {
  /** Checks the value before it is saved. A returned error message is shown under the field and the value is not emitted. */
  validate?: ValidateFn | ValidateFn[]
}

export interface InputSuggestProps<Type extends InputType, ClearValue extends InputClearValue = ''> extends Omit<InputProps<Type, ClearValue>, 'unclickable'>, Partial<Pick<DropdownMenuProps, 'horizontalAlign' | 'dropdownClass'>> {
  /** Title for the mobile bottom sheet the menu opens in. Defaults to `title`. */
  mobileTitle?: string
  /** Keeps the menu open when the input loses focus. */
  persist?: boolean
  /** Closes the menu when the value is cleared. */
  closeOnClear?: boolean
  /** Renders the menu content under the input instead of in a dropdown. */
  static?: boolean
  /** Hides the button that opens and closes the menu. */
  hideToggle?: boolean
}

export interface InputOptionsProps<Type extends InputType, Option, ClearValue extends InputClearValue = ''> extends InputSuggestProps<Type, ClearValue> {
  /** Suggestions shown in the menu. Picking one sets the value and blurs the input. */
  options: Option[]
  /** Value an option puts into the input. */
  valueGetter: (option: Option) => Required<InputSuggestProps<Type>>['modelValue']
  /** Text shown when `options` is empty. Defaults to "No suggestion". */
  emptyStub?: string
  /** Renders an option in the menu. The `option` slot replaces it. */
  optionComponent?: Component<{option: Option, selected?: boolean, model?: boolean}>
}

export interface InputDateProps extends Omit<InputSuggestProps<'text'>, 'modelValue' | 'clearValue'> {
  /** Selected date. Typed text is parsed into a date as it changes. */
  modelValue?: Date | undefined
  /** Earliest selectable date. A typed date before it is replaced with it. */
  minDate?: Date
  /** Latest selectable date. A typed date after it is replaced with it. */
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
  /** Text of the button, e.g. "H1". */
  title?: string
  /** Icon of the button. */
  icon?: SVGComponent
  /** Formatting applied to the selected text on click. A list turns the button into a group that opens its items on hover. */
  value?: WrapSelection | {title?: string, icon?: SVGComponent, value?: WrapSelection, label?: string}[]
  /** Tooltip text. */
  tooltip?: string
  /** Disables the button. */
  disabled?: boolean
  /** Name for screen readers. Defaults to `tooltip`, then `title`. */
  label?: string
}

export type TextPart = {value: string, tag: keyof HTMLElementTagNameMap, edit?: boolean, class?: string, id?: string} | string