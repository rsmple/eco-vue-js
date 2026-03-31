import {computed, ref, toRef, watch} from 'vue'

type ModelValue = string | number | null | undefined

interface InputAsyncProps {
  async?: boolean
  modelValue?: ModelValue
  loading?: boolean
  debounce?: number
  textSecure?: boolean
}

interface InputAsyncContext {
  props: InputAsyncProps
  emit: (e: 'update:model-value', value: NonNullable<ModelValue> | undefined) => void
  blur: () => void
}

export const useInputAsync = (context: InputAsyncContext) => {
  const {props, emit} = context

  // const asyncProvided = useProvideAsync()
  const isAsync = computed(() => props.async || false)

  const focused = ref(false)
  const saved = ref(false)
  const value = ref<NonNullable<ModelValue> | undefined>()
  const timeout = ref<NodeJS.Timeout | null>(null)

  const hasChanges = computed(() => isAsync.value && (props.modelValue ?? undefined) !== value.value)

  const doClearTimeout = () => {
    if (timeout.value) {
      clearTimeout(timeout.value)
      timeout.value = null
    }
  }

  const save = () => {
    if (props.loading) return

    doClearTimeout()

    emit('update:model-value', props.textSecure ? value.value || '' : value.value)

    saved.value = true
  }

  const cancel = () => {
    doClearTimeout()
    value.value = props.textSecure && typeof props.modelValue !== 'string' ? undefined : props.modelValue ?? undefined
    focused.value = false
  }

  watch(toRef(props, 'modelValue'), modelValue => {
    doClearTimeout()

    value.value = props.textSecure && typeof modelValue !== 'string' ? undefined : modelValue ?? undefined

    if (saved.value) {
      context.blur()
      saved.value = false
    }
  }, {immediate: true})

  // Debounce
  if (props.debounce) {
    const saveDebounced = () => {
      if (value.value !== (props.modelValue ?? undefined)) emit('update:model-value', value.value)
      timeout.value = null
    }

    watch(value, () => {
      doClearTimeout()

      if (value.value === (props.modelValue ?? undefined)) return

      timeout.value = setTimeout(saveDebounced, props.debounce)
    })
  }

  return {
    isAsync,
    value,
    hasChanges,
    focused,
    timeout,
    save,
    cancel,
    clearTimeout: doClearTimeout,
  }
}
