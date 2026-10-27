import type {FieldWrapperProps} from '@/components/FieldWrapper/types'

const fieldKeys = [
  'title',
  'titleIcon',
  'description',
  'errorMessage',
  'tooltipText',
  'mono',
  'hasChanges',
  'skeleton',
  'disabled',
  'readonly',
  'required',
  'noMargin',
  'leftError',
  'filterField',
  'filterValue',
  'subgrid',
  'seamless',
  'topText',
  'hideTitle',
  'embedded',
] as const satisfies (keyof Omit<FieldWrapperProps, 'modelValue'>)[]

/**
 * The props of the field around a deferred select — only those that are set, in one object.
 * Spreading every prop of the select into the stand-in costs more than the stand-in itself.
 */
export const getDeferredField = (props: Omit<FieldWrapperProps, 'modelValue'>): FieldWrapperProps => {
  const result: Record<string, unknown> = {}

  for (const key of fieldKeys) {
    if (props[key] !== undefined) result[key] = props[key]
  }

  return result as FieldWrapperProps
}
