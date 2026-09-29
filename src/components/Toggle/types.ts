import type {Theme} from '@/utils/utils'

export interface ToggleProps<Value extends boolean | null> {
  /** Switch state. `null` puts the caret in the middle, the mixed state used with `intermediate`. */
  modelValue: Value
  /** Label next to the switch; the `title` slot replaces it. */
  title?: string
  /** Icon drawn inside the caret. Hidden while `loading`. */
  icon?: SVGComponent
  /** Smaller title text. */
  small?: boolean
  /** Blocks changes and dims the toggle. When unset, inherits the disabled state provided by a parent. */
  disabled?: boolean
  /** Shows a spinner in the caret and ignores clicks. */
  loading?: boolean
  /** Shows the state without allowing changes, and keeps the title selectable. When unset, inherits the readonly state provided by a parent. */
  readonly?: boolean
  /** Puts the title after the switch instead of before it. */
  rightLabel?: boolean
  /** Drops the default vertical margin around the toggle. */
  noMargin?: boolean
  /** Secondary text under the toggle. */
  description?: string
  /** Cycles through three states on click — `true`, `false`, then `null` — instead of two. */
  intermediate?: boolean
  /** Inverts the display: a `true` model shows the switch as off, and turning it on emits `false`. */
  negate?: boolean
  /** Checks the new value before it is emitted. A returned error message cancels the change and is shown as a warning notification. */
  validate?: ValidateFn | ValidateFn[]
  /** Centers the switch in its row. */
  center?: boolean
  /** Renders a skeleton placeholder. When unset, inherits the skeleton state provided by a parent. */
  skeleton?: boolean
}

export interface ToggleThemeProps extends Omit<ToggleProps<boolean>, 'modelValue' | 'icon' | 'negate' | 'intermediate'> {
  /** Current theme: the toggle is on, with a sun, for `Theme.LIGHT`, and off, with a moon, for `Theme.DARK`. */
  modelValue: Theme
}
