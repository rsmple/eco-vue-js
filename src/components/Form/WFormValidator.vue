<template>
  <component
    :is="component"
    ref="componentRef"
    :error-message="errorMessage"
    :has-changes="noChanges ? undefined : hasChanges"
    @update:model-value="_validateOnUpdate"
    @select="_validateOnSelect"
    @unselect="_validateOnUnselect"
    @init-model="initModel"
  />
</template>

<script lang="ts" setup>
import {computed, ref, useSlots, watch, inject, onBeforeMount, onBeforeUnmount} from 'vue'
import {wFormErrorMessageUpdater, wFormHasChangesUpdater, wFormInitModelUpdater, wFormInvalidateUpdater, wFormTitleUpdater, wFormUnlistener, wFormValidateUpdater} from './models/injection'
import type {ValidatePath} from './use/useFormValidateMap'
import {useTabActiveListener} from '@/components/Tabs/use/useTabActiveListener'
import {scrollToValidator} from './models/utils'
import {useIsInsideTab} from '@/components/Tabs/use/useIsInsideTab'
import {validateRequired} from '@/utils/validate'

const props = defineProps<{
  name?: string
  title?: string
  validate?: ValidateFn | ValidateFn[]
  forbiddenRegexp?: RegExp
  requiredSymbols?: string
  noChanges?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:has-changes', value: boolean): void
  (e: 'update:is-valid', value: boolean): void
}>()

const titleUpdater = inject(wFormTitleUpdater, undefined)
const errorMessageUpdater = inject(wFormErrorMessageUpdater, undefined)
const hasChangesUpdater = inject(wFormHasChangesUpdater, undefined)
const validateUpdater = inject(wFormValidateUpdater, undefined)
const invalidateUpdater = inject(wFormInvalidateUpdater, undefined)
const initModelUpdater = inject(wFormInitModelUpdater, undefined)
const unlistener = inject(wFormUnlistener, undefined)

const {isInsideTab} = useIsInsideTab()

const slots = useSlots()
const component = computed<ComponentInstance<ThisType<unknown>>>(() => slots.default?.()[0])
const componentRef = ref<ComponentInstance<ThisType<unknown>> | undefined>()

const modelValue = computed<Parameters<ValidateFn>[0]>(() => {
  const props = component.value?.props

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
const required = computed<boolean | undefined>(() => component.value?.props?.required !== undefined ? component.value?.props?.required !== false : undefined)
const title = computed<string | undefined>(() => props.title ?? component.value?.props?.title)

const errorMessage = ref<string | undefined | null>(null)

const hasChanges = ref<boolean>(false)
const hasBeenValidated = ref<boolean>(false)

const requiredSymbols = computed<string[]>(() => props.requiredSymbols?.split('') ?? [])

const _updateHasChanges = (value: Parameters<ValidateFn>[0]): void => {
  if (initModelValue.value === undefined) {
    hasChanges.value = value !== undefined && value !== ''
  } else {
    if (value instanceof Array && initModelValue.value instanceof Array) {
      const oldValue = initModelValue.value
      const newValue = value

      hasChanges.value = newValue.length !== oldValue.length || newValue.some(item => !oldValue.includes(item))
    } else {
      hasChanges.value = value !== initModelValue.value
    }
  }
}

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
              return `" ${item} "`
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
            return `${item}`
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
  _updateHasChanges(value)

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

const invalidate = (messages: Record<string, string | string[]>): void => {
  if (!props.name) return

  const message = messages[props.name]

  if (typeof message === 'string') errorMessage.value = message
  else if (message instanceof Array) errorMessage.value = message.join(', ')
}

const initModel = (): void => {
  initModelValue.value = modelValue.value
  hasChanges.value = false
}

const scrollTo = () => {
  if (!errorMessage.value) return

  const element = componentRef.value.$el

  if (element instanceof HTMLDivElement) scrollToValidator(element)
}

useTabActiveListener(scrollTo)

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

watch(title, value => {
  if (props.name) {
    titleUpdater?.(props.name, value)
  }
}, {immediate: true})

watch(required, () => {
  if (hasBeenValidated.value) doValidate()
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
  default: () => void
}>()

</script>
