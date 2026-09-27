import type {SelectOptionProps} from '../Select/types'
import type {DropdownMenuProps} from '@/components/DropdownMenu/types'
import type {FieldWrapperProps} from '@/components/FieldWrapper/types'
import type {LinkProps} from '@/types/types'
import type {SemanticType} from '@/utils/SemanticType'
import type {Component, VNode} from 'vue'

export interface ButtonProps extends Partial<LinkProps> {
  /** Color scheme. Classes per type are app-wide and can be overridden with `setSemanticTypeButtonBackgroundMap`. */
  semanticType?: SemanticType
  /** Blocks clicks and dims the button. When unset, inherits the disabled or readonly state provided by a parent. */
  disabled?: boolean
  /** Replaces the content with a spinner and swallows clicks, keeping the button's width. */
  loading?: boolean
  /** Element to render when neither `to` nor `href` applies. */
  tag?: keyof HTMLElementTagNameMap
  /** Native `type` attribute, e.g. `submit` inside a form. */
  type?: string
  /** With `to`, replaces the current history entry instead of pushing a new one. */
  replace?: boolean
  /** Link target when `tag` is `a`. */
  href?: string
  /** Native `target` of the link, with `href` or `to`. */
  target?: '_self' | '_blank' | '_parent' | '_top'
  /** Native `rel` of the link, with `href` or `to`. */
  rel?: string
  /** Squares off inner corners and borders so adjacent buttons read as one segmented control. */
  join?: boolean
  /** Shows a tooltip on hover — also the accessible hint for icon-only buttons. */
  tooltipText?: string
  /** Native `download` attribute, used with `tag="a"` and `href`. */
  download?: string
  /** Renders a skeleton placeholder of the button's size. When unset, inherits the skeleton state provided by a parent. */
  skeleton?: boolean
  /** Focuses the button after mount and whenever it becomes enabled again. */
  autofocus?: boolean
  /** Border and text only, no background fill. */
  outline?: boolean
  /** Custom decorative border layer, overriding the one registered for the `semanticType`. */
  borderComponent?: VNode
  /** Skips the decorative border layer. */
  noBorderComponent?: boolean
}

export type ButtonGroupOptionComponent<Option> = Component<SelectOptionProps<Option>>

interface ButtonGroupPropsBase<Model extends number | string | null | boolean>
  extends Omit<FieldWrapperProps, 'modelValue'> {
  /** Value of the pressed option. */
  modelValue: Model
  /** Wraps the options onto new lines instead of overflowing. */
  wrap?: boolean
  /** Stacks the options vertically. */
  col?: boolean
  /** Color scheme of the pressed option. */
  semanticType?: SemanticType
  /** Shows a spinner in the last clicked option and disables the others, while its change is saved. */
  loading?: boolean
  /** Stretches the group to the full width, sharing it equally between the options. */
  stretch?: boolean
  /** A click on the pressed option emits `null`. */
  allowClear?: boolean
  /** Values of the options to disable. */
  disabledItems?: Model[]
}

interface ButtonGroupPropsForModel<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends ButtonGroupPropsBase<Model> {
  /** Options, each passed to the `option` slot. A primitive is its own value, an object needs `valueGetter`. */
  list: readonly Model[]
  /** Value of an option. Needed when `list` holds objects. */
  valueGetter?: ValueGetter | undefined
  /** Renders an option's content. The `option` slot replaces it. */
  optionComponent?: ButtonGroupOptionComponent<Model>
}

interface ButtonGroupPropsForEntity<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends ButtonGroupPropsBase<Model> {
  /** Options, each passed to the `option` slot. A primitive is its own value, an object needs `valueGetter`. */
  list: Entity[]
  /** Value of an option. Needed when `list` holds objects. */
  valueGetter: ValueGetter | ((value: Entity) => Model)
  /** Renders an option's content. The `option` slot replaces it. */
  optionComponent?: ButtonGroupOptionComponent<Entity>
}

export type ButtonGroupProps<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined> = ButtonGroupPropsForEntity<Model, Entity, ValueGetter> | ButtonGroupPropsForModel<Model, Entity, ValueGetter>

export interface ButtonDropdownProps extends Partial<Pick<DropdownMenuProps, 'horizontalAlign'>> {
  /** Color scheme of the arrow button. */
  semanticType?: SemanticType
  /** Puts the arrow button before the `button` slot instead of after it. */
  leftToggle?: boolean
  /** Disables the arrow button. Buttons in the `button` slot keep their own state. */
  disabled?: boolean
  /** Tooltip over the whole button row. */
  tooltipText?: string
}