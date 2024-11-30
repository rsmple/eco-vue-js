import type {DropdownMenuProps} from '@/components/DropdownMenu/types'
import type {FieldWrapperProps} from '@/components/FieldWrapper/types'
import type {SemanticType} from '@/utils/SemanticType'
import type {Component} from 'vue'

export type ButtonGroupOptionProps<Option> = {option: Option, selected?: boolean}

export type ButtonGroupOptionComponent<Option> = Component<ButtonGroupOptionProps<Option>>

interface ButtonGroupPropsBase<Model extends number | string | null | boolean>
  extends Omit<FieldWrapperProps, 'modelValue'> {
  modelValue: Model
  loading?: Model
  minimize?: boolean
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

export interface ButtonDropdownProps extends Omit<DropdownMenuProps, 'isOpen' | 'updateAlign' | 'emitUpdate' | 'horizontalAlign' | 'maxHeight' | 'maxWidth'>,
  Partial<Pick<DropdownMenuProps, 'horizontalAlign' | 'maxHeight' | 'maxWidth'>> {
  semanticType?: SemanticType
  leftToggle?: boolean
  disabled?: boolean
}