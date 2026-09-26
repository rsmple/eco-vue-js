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
  target?: '_self' | '_blank' | '_parent' | '_top'
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
  modelValue: Model
  wrap?: boolean
  col?: boolean
  semanticType?: SemanticType
  loading?: boolean
  stretch?: boolean
  allowClear?: boolean
}

interface ButtonGroupPropsForModel<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends ButtonGroupPropsBase<Model> {
  list: readonly Model[]
  valueGetter?: ValueGetter | undefined
  optionComponent?: ButtonGroupOptionComponent<Model>
}

interface ButtonGroupPropsForEntity<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends ButtonGroupPropsBase<Model> {
  list: Entity[]
  valueGetter: ValueGetter | ((value: Entity) => Model)
  optionComponent?: ButtonGroupOptionComponent<Entity>
}

export type ButtonGroupProps<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined> = ButtonGroupPropsForEntity<Model, Entity, ValueGetter> | ButtonGroupPropsForModel<Model, Entity, ValueGetter>

export interface ButtonDropdownProps extends Omit<DropdownMenuProps, 'isOpen' | 'updateAlign' | 'emitUpdate' | 'horizontalAlign'>,
  Partial<Pick<DropdownMenuProps, 'horizontalAlign'>> {
  semanticType?: SemanticType
  leftToggle?: boolean
  disabled?: boolean
  tooltipText?: string
}