<template>
  <component
    :is="componentSlot"
    ref="component"
    :error-message="isErrorShown ? errorMessage : undefined"
    :has-changes="noChanges ? undefined : hasChanges"
    @update:model-value="_validateOnUpdate"
    @select="_validateOnSelect"
    @unselect="_validateOnUnselect"
    @init-model="initModel"
    @blur="showError"
  />
</template>

<script lang="ts" setup>
import {type VNode, computed, inject, nextTick, onBeforeMount, onBeforeUnmount, ref, useSlots, useTemplateRef, watch} from 'vue'

import {useIsInsideTab} from '@/components/Tabs/use/useIsInsideTab'
import {useTabActiveListener} from '@/components/Tabs/use/useTabActiveListener'
import {debounce} from '@/utils/utils'
import {validateForbiddenRegexp, validateRequired, validateRequiredSymbols} from '@/utils/validate'

import {wFormErrorMessageUpdater, wFormHasChangesUpdater, wFormHasShownUpdater, wFormHasValueUpdater, wFormInitModelUpdater, wFormInvalidateUpdater, wFormTitleUpdater, wFormUnlistener, wFormValidateUpdater} from './models/injection'
import {type ValidatePath, scrollToValidator} from './models/utils'

const props = defineProps<{
  name?: string
  title?: string
  validate?: ValidateFn | ValidateFn[]
  forbiddenRegexp?: RegExp
  requiredSymbols?: string
  noChanges?: boolean
  hasValue?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:has-changes', value: boolean): void
  (e: 'update:has-value', value: boolean | null): void
  (e: 'update:has-shown', value: boolean): void
  (e: 'update:is-valid', value: boolean): void
  (e: 'invalidate', value: Record<string, string | string[] | undefined>): void
}>()

const titleUpdater = inject(wFormTitleUpdater, undefined)
const errorMessageUpdater = inject(wFormErrorMessageUpdater, undefined)
const hasChangesUpdater = inject(wFormHasChangesUpdater, undefined)
const hasValueUpdater = inject(wFormHasValueUpdater, undefined)
const hasShownUpdater = inject(wFormHasShownUpdater, undefined)
const validateUpdater = inject(wFormValidateUpdater, undefined)
const invalidateUpdater = inject(wFormInvalidateUpdater, undefined)
const initModelUpdater = inject(wFormInitModelUpdater, undefined)
const unlistener = inject(wFormUnlistener, undefined)

const {isInsideTab} = useIsInsideTab()

const slots = useSlots()
const componentSlot = computed<ComponentInstance<ThisType<unknown>>>(() => slots.default?.()[0])
const componentRef = useTemplateRef<ComponentInstance<ThisType<unknown>>>('component')

const modelValue = computed<Parameters<ValidateFn>[0]>(() => {
  const props = componentSlot.value?.props

  if (!props) return undefined

  if ('modelValue' in props) {
    return props.modelValue
  }

  if ('model-value' in props) {
    return props['model-value']
  }

  return undefined
})

const initModelValue = ref<Parameters<ValidateFn>[0]>(modelValue.value)
const isErrorShown = ref(false)
const wasChanged = ref(false)
const required = computed<boolean | undefined>(() => componentSlot.value?.props?.required !== undefined ? componentSlot.value?.props?.required !== false : undefined)
const mandatory = computed<boolean | undefined>(() => componentSlot.value?.props?.mandatory !== undefined ? componentSlot.value?.props?.mandatory !== false : undefined)
const skeleton = computed<boolean | undefined>(() => componentSlot.value?.props?.skeleton !== undefined ? componentSlot.value?.props?.skeleton !== false : undefined)
const title = computed<string | undefined>(() => props.title ?? componentSlot.value?.props?.title)

const errorMessage = ref<string | undefined | null>(null)

const hasChanges = computed<boolean>(() => {
  if (props.noChanges) return false

  if (initModelValue.value === undefined) {
    return modelValue.value !== undefined && modelValue.value !== ''
  } else {
    const oldValue = initModelValue.value
    const newValue = modelValue.value

    if (Array.isArray(newValue) && Array.isArray(oldValue)) {
      return newValue.length !== oldValue.length || newValue.some(item => !oldValue.includes(item))
    } if (newValue instanceof Object && oldValue instanceof Object) {
      const keys = Object.keys(newValue)
      return keys.length !== Object.keys(oldValue).length
        || keys.some(key => newValue[key as keyof typeof newValue] !== oldValue[key as keyof typeof oldValue])
    } else {
      return modelValue.value !== initModelValue.value
    }
  }
})

const hasValueExact = computed<boolean | null>(() => {
  if (props.hasValue) return true

  if (!required.value && !mandatory.value) return null

  if (Array.isArray(modelValue.value)) return modelValue.value.length !== 0

  return modelValue.value !== undefined && modelValue.value !== null && modelValue.value !== '' && modelValue.value !== false
})

const _hasValue = computed<boolean | null>(() => mandatory.value && hasValueExact.value === false ? null : hasValueExact.value)

const _validate = (value: Parameters<ValidateFn>[0]): string | undefined => {
  const requiredMessage = required.value ? validateRequired(value) : undefined
  if (requiredMessage) return requiredMessage

  if (props.forbiddenRegexp && typeof value === 'string') return validateForbiddenRegexp(props.forbiddenRegexp, value)

  if (props.requiredSymbols && typeof value === 'string') return validateRequiredSymbols(props.requiredSymbols, value)

  let message

  if (props.validate instanceof Array) {
    message = props.validate.map(cb => cb(value)).filter(item => item).join(', ') || undefined
  } else {
    message = props.validate?.(value) || undefined
  }

  return message
}

const validateOnUpdate = (value: Parameters<ValidateFn>[0]) => {
  const message = _validate(value)

  errorMessage.value = message

  if (!message) nextTick(() => isErrorShown.value = false)

  return message
}

const _validateOnUpdate = (value: Parameters<ValidateFn>[0]) => {
  validateOnUpdate(value)
}

const _validateOnSelect = (value: string) => {
  const newValue = modelValue.value instanceof Array ? modelValue.value.slice() : []
  newValue.push(value)
  validateOnUpdate(newValue)
}

const _validateOnUnselect = (value: string) => {
  const newValue = modelValue.value instanceof Array ? modelValue.value.slice() : []
  const index = newValue.indexOf(value)
  if (index !== -1) newValue.splice(index, 1)
  validateOnUpdate(newValue)
}

const doValidate = (silent?: boolean, path?: ValidatePath): string | undefined => {
  if (props.name && path && !path[props.name]) return

  if (errorMessage.value) return errorMessage.value

  const message = _validate(modelValue.value)
  
  errorMessage.value = message

  if (!silent) {
    isErrorShown.value = message !== undefined

    if (!isInsideTab) scrollTo()
  }

  return message
}

const invalidate = (messages: Record<string, string | string[] | undefined>): void => {
  emit('invalidate', messages)

  if (!props.name) return

  const message = messages[props.name]

  if (typeof message === 'string') errorMessage.value = message
  else if (message instanceof Array) errorMessage.value = message.join(', ')

  if (message) isErrorShown.value = true
}

const initModel = (): void => {
  isErrorShown.value = false
  wasChanged.value = false
  initModelValue.value = modelValue.value

  validateOnUpdate(modelValue.value)
}

const scrollTo = () => {
  if (!errorMessage.value) return

  const element = componentRef.value?.$el

  if (element instanceof HTMLDivElement) scrollToValidator(element)
}

const scrollToDebounced = debounce(scrollTo, 300)

useTabActiveListener(scrollToDebounced)

const showError = () => {
  if (!errorMessage.value || !wasChanged.value) return

  isErrorShown.value = true
}

watch(errorMessage, value => {
  if (value === null) return

  if (props.name) errorMessageUpdater?.(value, props.name)

  emit('update:is-valid', !value)
})

watch(hasChanges, value => {
  if (value) wasChanged.value = true

  if (props.name) hasChangesUpdater?.(value, props.name)

  emit('update:has-changes', value)
})

watch(_hasValue, value => {
  if (props.name) hasValueUpdater?.(value, props.name)

  emit('update:has-value', value)
}, {immediate: true})

watch(isErrorShown, value => {
  if (props.name) hasShownUpdater?.(value, props.name)

  emit('update:has-shown', value)
})

watch(title, value => {
  if (props.name) titleUpdater?.(value, props.name)
}, {immediate: true})

watch(required, () => {
  doValidate(true)
})

watch(skeleton, value => {
  if (!value) initModel()
})

onBeforeMount(() => {
  if (props.name) {
    initModel()

    validateUpdater?.(doValidate, props.name)
    invalidateUpdater?.(invalidate, props.name)
    initModelUpdater?.(initModel, props.name)
  }
})

onBeforeUnmount(() => {
  if (props.name) unlistener?.(undefined, props.name)
})

defineExpose({
  validateOnUpdate() {
    isErrorShown.value = true

    return validateOnUpdate(modelValue.value)
  },
  invalidate(message: string) {
    errorMessage.value = message
  },
  initModel,
})

defineSlots<{
  default: () => VNode[]
}>()
</script>
