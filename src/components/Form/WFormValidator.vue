<template>
  <component
    :is="componentSlot"
    ref="component"
    :error-message="errorMessage"
    :has-changes="noChanges ? undefined : hasChanges"
    :readonly="readonlyInjected"
    @update:model-value="_validateOnUpdate"
    @select="_validateOnSelect"
    @unselect="_validateOnUnselect"
    @init-model="initModel"
  />
</template>

<script lang="ts" setup>
import {type VNode, computed, inject, onBeforeMount, onBeforeUnmount, ref, useSlots, useTemplateRef, watch} from 'vue'

import {useIsInsideTab} from '@/components/Tabs/use/useIsInsideTab'
import {useTabActiveListener} from '@/components/Tabs/use/useTabActiveListener'
import {debounce, wReadonly} from '@/utils/utils'
import {validateRequired} from '@/utils/validate'

import {wFormErrorMessageUpdater, wFormHasChangesUpdater, wFormHasValueUpdater, wFormInitModelUpdater, wFormInvalidateUpdater, wFormTitleUpdater, wFormUnlistener, wFormValidateUpdater} from './models/injection'
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
  (e: 'update:is-valid', value: boolean): void
  (e: 'invalidate', value: Record<string, string | string[] | undefined>): void
}>()

const readonlyInjected = inject(wReadonly, ref(false))

const titleUpdater = inject(wFormTitleUpdater, undefined)
const errorMessageUpdater = inject(wFormErrorMessageUpdater, undefined)
const hasChangesUpdater = inject(wFormHasChangesUpdater, undefined)
const hasValueUpdater = inject(wFormHasValueUpdater, undefined)
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

const initModelValue = ref<Parameters<ValidateFn>[0]>()
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
    if (Array.isArray(modelValue.value) && Array.isArray(initModelValue.value)) {
      const oldValue = initModelValue.value
      const newValue = modelValue.value

      return newValue.length !== oldValue.length || newValue.some(item => !oldValue.includes(item))
    } else {
      return modelValue.value !== initModelValue.value
    }
  }
})

const hasBeenValidated = ref<boolean>(false)

const hasValueExact = computed<boolean | null>(() => {
  if (props.hasValue) return true

  if (!required.value && !mandatory.value) return null

  if (Array.isArray(modelValue.value)) return modelValue.value.length !== 0

  return modelValue.value !== undefined && modelValue.value !== null && modelValue.value !== ''
})

const _hasValue = computed<boolean | null>(() => mandatory.value && hasValueExact.value === false ? null : hasValueExact.value)

const requiredSymbols = computed<string[]>(() => props.requiredSymbols?.split('') ?? [])

const _validate = (value: Parameters<ValidateFn>[0]): string | undefined => {
  const requiredMessage = required.value ? validateRequired(value) : undefined
  if (requiredMessage) return requiredMessage

  if (props.forbiddenRegexp && typeof value === 'string') {
    const match = value.match(props.forbiddenRegexp)

    if (match?.length) {
      const message = 'The following symbols are not allowed: ' + match
        .filter((item, index) => match.indexOf(item) === index)
        .map(item => {
          switch (item) {
            case ' ':
              return 'whitespace'
            case '\n':
              return 'line break'
            default:
              return `" ${ item } "`
          }
        })
        .join(', ')

      return message
    }
  }

  if (props.requiredSymbols && typeof value === 'string') {
    const match = requiredSymbols.value
      .filter(item => !value.includes(item))
      .map(item => {
        switch (item) {
          case ' ':
            return 'whitespace'
          case '\n':
            return 'line break'
          case '\t':
            return 'tabulation'
          default:
            return `${ item }`
        }
      })
      .join(', ')

    if (match.length) return 'Please include the required symbols: ' + match
  }

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
  hasBeenValidated.value = true

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

  const message = _validate(modelValue.value)

  if (!silent) {
    errorMessage.value = message
    hasBeenValidated.value = true

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
}

const initModel = (): void => {
  initModelValue.value = modelValue.value
}

const scrollTo = () => {
  if (!errorMessage.value) return

  const element = componentRef.value.$el

  if (element instanceof HTMLDivElement) scrollToValidator(element)
}

const scrollToDebounced = debounce(scrollTo, 300)

useTabActiveListener(scrollToDebounced)

watch(errorMessage, value => {
  if (value === null) return

  if (props.name) {
    errorMessageUpdater?.(props.name, value)
  }

  emit('update:is-valid', !value)
})

watch(hasChanges, value => {
  if (props.name) {
    hasChangesUpdater?.(props.name, value)
  }

  emit('update:has-changes', value)
})

watch(_hasValue, value => {
  if (props.name) {
    hasValueUpdater?.(props.name, value)
  }

  emit('update:has-value', value)
}, {immediate: true})

watch(title, value => {
  if (props.name) {
    titleUpdater?.(props.name, value)
  }
}, {immediate: true})

watch(required, () => {
  if (hasBeenValidated.value) doValidate()
})

watch(skeleton, value => {
  if (!value) initModel()
})

onBeforeMount(() => {
  if (props.name) {
    initModel()

    validateUpdater?.(props.name, doValidate)
    invalidateUpdater?.(props.name, invalidate)
    initModelUpdater?.(props.name, initModel)
  }
})

onBeforeUnmount(() => {
  if (props.name) {
    unlistener?.(props.name)
  }
})

defineExpose({
  validateOnUpdate() {
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
