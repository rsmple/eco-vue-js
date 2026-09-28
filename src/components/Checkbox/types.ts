import type {FieldWrapperProps} from '@/components/FieldWrapper/types'
import type {Component} from 'vue'

/**
 * Checkbox
 */

export interface CheckboxProps {
  /** Checked state. `null` is the mixed state — drawn as a smaller mark with `intermediate`. */
  modelValue: boolean | null
  /** Label next to the box; the default slot replaces it. */
  title?: string
  /** Blocks changes and dims the checkbox. When unset, inherits the disabled state provided by a parent. */
  disabled?: boolean
  /** Shows the state without allowing changes. When unset, inherits the readonly state provided by a parent. */
  readonly?: boolean
  /** Icon drawn inside the box instead of the check mark. */
  icon?: SVGComponent
  /** Round radio button with a dot instead of a square box with a check mark. */
  radio?: boolean
  /** Shows a spinner in the box and ignores clicks. */
  loading?: boolean
  /** Renders in a gray loading state and ignores clicks. When unset, inherits the skeleton state provided by a parent. */
  skeleton?: boolean
  /** Draws a `null` model as a smaller mark, the mixed state, instead of a filled box. */
  intermediate?: boolean
  /** Tooltip on hover over the box. Not shown on touch devices. Also names a checkbox without `title` or `label` for screen readers. */
  tooltipText?: string
  /** Names a checkbox without a visible `title` for screen readers. */
  label?: string
  /** Aligns the box with the first line of a multi-line title instead of centering it. */
  alignTop?: boolean
  /** Drops the bottom padding added under a checkbox with a title. */
  noMargin?: boolean
  /** Checks and unchecks without the scale animation. */
  lessTransitions?: boolean
}

export type CheckboxGroupOptionProps<Option> = {option: Option | undefined, selected?: boolean}

export type CheckboxGroupOptionComponent<Option> = Component<CheckboxGroupOptionProps<Option>>

export type GroupModelStringified<Model> = Exclude<Model, null | boolean | undefined> | (Model extends boolean ? 'true' | 'false' : never) | (Model extends null ? 'null' : never)

/**
 * CheckboxGroup
 */

interface CheckboxGroupPropsBase<Model extends number | string | null | boolean | undefined>
  extends Omit<FieldWrapperProps, 'modelValue'>,
  Omit<CheckboxProps, 'modelValue' | 'title' | 'icon' | 'intermediate' | 'tooltipText' | 'label'> {
  /** Selected value. */
  modelValue: Model | undefined
  /** Lays the options out in a row that wraps, instead of a column. */
  wrap?: boolean
  /** Lays the options out in one row, stretched to equal widths. */
  stretch?: boolean
  /** Shows a spinner in the last clicked option and disables the others, while its change is saved. */
  loading?: boolean
  /** Clicking the selected option again emits `null`. */
  allowClear?: boolean
  /** Icon inside each option's box, keyed by the option's value as a string. */
  iconMap?: Record<GroupModelStringified<Model>, SVGComponent>
  /** Label of each option, keyed by the option's value as a string. */
  titleMap?: Record<GroupModelStringified<Model>, string>
  /** Tooltip on each option's box, keyed by the option's value as a string. */
  tooltipTextMap?: Record<GroupModelStringified<Model>, string>
  /** Classes for each option, keyed by the option's value as a string. */
  classMap?: Record<GroupModelStringified<Model>, string>
  /** Classes for every option. */
  optionClass?: string
}

interface CheckboxGroupPropsForModel<Model extends number | string | null | boolean | undefined, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends CheckboxGroupPropsBase<Model> {
  /** Option values. */
  list: Model[] | readonly Model[]
  /** Maps a `list` item to its value. Required when `list` holds objects. */
  valueGetter?: ValueGetter | undefined
  /** Renders an option's label. The `option` slot replaces it. */
  optionComponent?: CheckboxGroupOptionComponent<Model>
}

interface CheckboxGroupPropsForEntity<Model extends number | string | null | boolean | undefined, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends CheckboxGroupPropsBase<Model> {
  /** Option objects, turned into values by `valueGetter`. */
  list: Entity[] | readonly Entity[]
  /** Maps a `list` item to its value. */
  valueGetter: ValueGetter | ((value: Entity) => Model)
  /** Renders an option's label. The `option` slot replaces it. */
  optionComponent?: CheckboxGroupOptionComponent<Entity>
}

export type CheckboxGroupProps<Model extends number | string | null | boolean | undefined, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined> = CheckboxGroupPropsForEntity<Model, Entity, ValueGetter> | CheckboxGroupPropsForModel<Model, Entity, ValueGetter>

/**
 * CheckboxGroupMultiple
 */

interface CheckboxGroupMultiplePropsBase<Model extends number | string | null | boolean>
  extends Omit<CheckboxGroupPropsBase<Model>, 'modelValue' | 'allowClear'> {
  /** Selected values. */
  modelValue: Model[] | undefined
}

interface CheckboxGroupMultiplePropsForModel<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends CheckboxGroupMultiplePropsBase<Model> {
  /** Option values. */
  list: Model[] | readonly Model[]
  /** Maps a `list` item to its value. Required when `list` holds objects. */
  valueGetter?: ValueGetter | undefined
  /** Renders an option's label. The `option` slot replaces it. */
  optionComponent?: CheckboxGroupOptionComponent<Model>
}

interface CheckboxGroupMultiplePropsForEntity<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined>
  extends CheckboxGroupMultiplePropsBase<Model> {
  /** Option objects, turned into values by `valueGetter`. */
  list: Entity[] | readonly Entity[]
  /** Maps a `list` item to its value. */
  valueGetter: ValueGetter | ((value: Entity) => Model)
  /** Renders an option's label. The `option` slot replaces it. */
  optionComponent?: CheckboxGroupOptionComponent<Entity>
}

export type CheckboxGroupMultipleProps<Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined> = CheckboxGroupMultiplePropsForEntity<Model, Entity, ValueGetter> | CheckboxGroupMultiplePropsForModel<Model, Entity, ValueGetter>
