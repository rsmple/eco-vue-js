import type {FieldWrapperProps} from '@/components/FieldWrapper/types'
import type {Component} from 'vue'

/**
 * Checkbox
 */

export interface CheckboxProps {
  modelValue: boolean | null
  title?: string
  disabled?: boolean
  readonly?: boolean
  icon?: SVGComponent
  radio?: boolean
  loading?: boolean
  intermediate?: boolean
  tooltipText?: string
  alignTop?: boolean
  noMargin?: boolean
  lessTransitions?: boolean
}

export type CheckboxGroupOptionProps<Option> = {option: Option | undefined, selected?: boolean}

export type CheckboxGroupOptionComponent<Option> = Component<CheckboxGroupOptionProps<Option>>

export type GroupModelStringified<Model> = Exclude<Model, null | boolean> | (Model extends boolean ? 'true' | 'false' : never) | (Model extends null ? 'null' : never)

/**
 * CheckboxGroup
 */

interface CheckboxGroupPropsBase<Model extends number | string | null | boolean>
  extends Omit<FieldWrapperProps, 'modelValue'>,
  Omit<CheckboxProps, 'modelValue' | 'title' | 'icon' | 'intermediate' | 'tooltipText'> {
  modelValue: Model | undefined
  wrap?: boolean
  stretch?: boolean
  allowClear?: boolean
  iconMap?: Record<GroupModelStringified<Model>, SVGComponent>
  titleMap?: Record<GroupModelStringified<Model>, string>
  tooltipTextMap?: Record<GroupModelStringified<Model>, string>
  classMap?: Record<GroupModelStringified<Model>, string>
  optionClass?: string
}

interface CheckboxGroupPropsForModel<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends CheckboxGroupPropsBase<Model> {
  list: Model[] | readonly Model[]
  valueGetter?: ValueGetter | undefined
  optionComponent?: CheckboxGroupOptionComponent<Model>
}

interface CheckboxGroupPropsForEntity<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends CheckboxGroupPropsBase<Model> {
  list: Entity[] | readonly Entity[]
  valueGetter: ValueGetter | ((value: Entity) => Model)
  optionComponent?: CheckboxGroupOptionComponent<Entity>
}

export type CheckboxGroupProps<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined> = CheckboxGroupPropsForEntity<Model, Entity, ValueGetter> | CheckboxGroupPropsForModel<Model, Entity, ValueGetter>

/**
 * CheckboxGroupMultiple
 */

interface CheckboxGroupMultiplePropsBase<Model extends number | string | null | boolean>
  extends Omit<CheckboxGroupPropsBase<Model>, 'modelValue' | 'allowClear'> {
  modelValue: Model[]
}

interface CheckboxGroupMultiplePropsForModel<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends CheckboxGroupMultiplePropsBase<Model> {
  list: Model[] | readonly Model[]
  valueGetter?: ValueGetter | undefined
  optionComponent?: CheckboxGroupOptionComponent<Model>
}

interface CheckboxGroupMultiplePropsForEntity<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends CheckboxGroupMultiplePropsBase<Model> {
  list: Entity[] | readonly Entity[]
  valueGetter: ValueGetter | ((value: Entity) => Model)
  optionComponent?: CheckboxGroupOptionComponent<Entity>
}

export type CheckboxGroupMultipleProps<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined> = CheckboxGroupMultiplePropsForEntity<Model, Entity, ValueGetter> | CheckboxGroupMultiplePropsForModel<Model, Entity, ValueGetter>
