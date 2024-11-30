export interface FieldWrapperProps {
  modelValue?: string | number | boolean | null
  title?: string
  description?: string
  errorMessage?: string
  tooltipText?: string
  maxLength?: number
  mono?: boolean
  hasChanges?: boolean
  skeleton?: boolean
  disabled?: boolean
  required?: boolean
  noMargin?: boolean
  allowCopy?: boolean
}
