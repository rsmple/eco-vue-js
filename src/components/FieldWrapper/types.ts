export interface FieldWrapperProps {
  modelValue?: string | number | boolean | null
  title?: string
  titleIcon?: SVGComponent
  description?: string
  errorMessage?: string
  tooltipText?: string
  maxLength?: number
  mono?: boolean
  hasChanges?: boolean
  skeleton?: boolean
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  mandatory?: boolean
  noMargin?: boolean
  allowCopy?: boolean
  emptyValue?: string
  leftError?: boolean
  filterField?: string
  filterValue?: unknown
  subgrid?: boolean
}
