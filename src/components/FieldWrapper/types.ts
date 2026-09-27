export interface FieldWrapperProps {
  /** Field value. */
  modelValue?: string | number | boolean | null
  /** Label above the field; the `title` slot replaces it. */
  title?: string
  /** Icon before the title text. */
  titleIcon?: SVGComponent
  /** Secondary text under the field. */
  description?: string
  /** Validation message under the field, which also colors the changes marker. */
  errorMessage?: string
  /** Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. */
  tooltipText?: string
  /** Shows a `length / maxLength` counter under the field while it is focused. */
  maxLength?: number
  /** Monospace font for the value. */
  mono?: boolean
  /** Shows a dot in the field's corner, marking an unsaved change. */
  hasChanges?: boolean
  /** Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. */
  skeleton?: boolean
  /** Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. */
  disabled?: boolean
  /** Shows the value without allowing changes. When unset, inherits the readonly state provided by a parent. */
  readonly?: boolean
  /** Adds an asterisk to the title. */
  required?: boolean
  /** Drops the default bottom margin. */
  noMargin?: boolean
  /** Adds a button that copies the value. */
  allowCopy?: boolean
  /** Aligns the error message to the left instead of the right. */
  leftError?: boolean
  /** Route query key for a filter button next to the title — clicking it toggles `filterField=<value>` in the URL. */
  filterField?: string
  /** Value the filter button puts in the query. Defaults to `modelValue`. */
  filterValue?: unknown
  /** Lays the field out on the parent grid's columns, with the title in the first column, so titles and fields line up across rows. */
  subgrid?: boolean
  /** Hides the title and drops the field's own chrome until it is hovered or focused, for inline editing. */
  seamless?: boolean
  /** Moves the counter and messages above the field instead of below it. */
  topText?: boolean
  /** Accepts files dropped onto the field. */
  allowDropFile?: boolean
  /** Hides the title while keeping the rest of the layout. */
  hideTitle?: boolean
  /** For a field placed inside another component, such as a dropdown: no title, no margin, and horizontal padding. */
  embedded?: boolean
}
