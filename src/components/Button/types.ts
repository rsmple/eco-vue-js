import type {FieldWrapperProps} from '@/components/FieldWrapper/types'
import type {SemanticType} from '@/utils/SemanticType'
import type {DropdownMenuProps} from '@/components/DropdownMenu/types'

interface Props<Model extends number | string | null | boolean>
  extends Omit<FieldWrapperProps, 'modelValue'> {
  modelValue: Model
  loading?: number | string
  minimize?: boolean
  wrap?: boolean
  col?: boolean
  semanticType?: SemanticType
  stretch?: boolean
  alwaysEmit?: boolean
}

interface PropsForModel<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends Props<Model> {
  list: Model[]
  valueGetter?: ValueGetter | undefined
}

interface PropsForEntity<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends Props<Model> {
  list: Entity[]
  valueGetter: ValueGetter | ((value: Entity) => Model)
}

export type ButtonGroupProps<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined> = PropsForModel<Model, Entity, ValueGetter> | PropsForEntity<Model, Entity, ValueGetter>

export interface ButtonDropdownProps extends Omit<DropdownMenuProps, 'isOpen' | 'updateAlign' | 'emitUpdate'> {
  semanticType?: SemanticType
  leftToggle?: boolean
  disabled?: boolean
}