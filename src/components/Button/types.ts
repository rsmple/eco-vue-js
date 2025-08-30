import type {SelectOptionProps} from '../Select/types'
import type {DropdownMenuProps} from '@/components/DropdownMenu/types'
import type {FieldWrapperProps} from '@/components/FieldWrapper/types'
import type {LinkProps} from '@/types/types'
import type {SemanticType} from '@/utils/SemanticType'
import type {Component} from 'vue'

export interface ButtonProps extends Partial<LinkProps> {
  semanticType?: SemanticType
  disabled?: boolean
  loading?: boolean
  tag?: 'a' | 'button'
  type?: string
  replace?: boolean
  href?: string
  target?: '_self' | '_blank' | '_parent' | '_top'
  join?: boolean
  tooltipText?: string
  download?: string
  skeleton?: boolean
  autofocus?: boolean
  outline?: boolean
}

export type ButtonGroupOptionComponent<Option> = Component<SelectOptionProps<Option>>

interface ButtonGroupPropsBase<Model extends number | string | null | boolean>
  extends Omit<FieldWrapperProps, 'modelValue'>,
  Omit<ButtonProps, 'tag' | 'type' | 'replace' | 'href' | 'target' | 'join'> {
  modelValue: Model
  wrap?: boolean
  col?: boolean
  semanticType?: SemanticType
  stretch?: boolean
  allowClear?: boolean
}

interface ButtonGroupPropsForModel<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends ButtonGroupPropsBase<Model> {
  list: Model[]
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