import type {FieldWrapperProps} from '@/components/FieldWrapper/types'

import {computed, nextTick, ref, toRaw} from 'vue'

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

type DeferredProps = Omit<FieldWrapperProps, 'modelValue'> & {
  modelValue: unknown
  deferred?: boolean
  useQueryFnDefault?: unknown
  useFirstDefault?: boolean
}

/**
 * The props of the field around a deferred select — only those that are set, in one object.
 * Spreading every prop of the select into the stand-in costs more than the stand-in itself.
 */
const getDeferredField = (props: DeferredProps): FieldWrapperProps => {
  const result: Record<string, unknown> = {}

  for (const key of fieldKeys) {
    if (props[key] !== undefined) result[key] = props[key]
  }

  if (props.filterField && props.filterValue === undefined) result.filterValue = props.modelValue

  return result as FieldWrapperProps
}

/**
 * The props that are set, for a select that forwards its props to the one it wraps in render.
 * The wrapped select then normalizes only these, rather than every prop it declares.
 * They are read untracked: a component re-renders whenever its parent changes its props anyway.
 */
export const getDefinedProps = <T extends object>(props: T): T => {
  const raw = toRaw(props)
  const result: Partial<T> = {}

  for (const key in raw) {
    if (raw[key] !== undefined) result[key] = raw[key]
  }

  return result as T
}

/** Renders a `deferred` select as `SelectDeferred` until it is activated, then focuses the mounted select with `focusSelect`. */
export const useDeferred = (props: DeferredProps, focusSelect: () => void) => {
  // A default option is selected on mount, so a select with one mounts at once.
  const isActive = ref(!props.deferred || !props.seamless || !!props.useQueryFnDefault || !!props.useFirstDefault)

  const isDeferred = computed(() => !isActive.value && !!props.deferred)

  const deferredField = computed(() => getDeferredField(props))

  const activate = async () => {
    if (isActive.value) return

    isActive.value = true

    await nextTick()

    focusSelect()
  }

  const focus = () => {
    if (isActive.value) focusSelect()
    else activate()
  }

  return {
    isDeferred,
    deferredField,
    activate,
    focus,
  }
}
