<template>
  <component
    :is="component"
    :error-message="errorMessage"
    :has-changes="hasChanges"
    @update:model-value="validateOnUpdate($event)"
    @select="validateOnSelect"
    @unselect="validateOnUnselect"
  />
</template>

<script lang="ts" setup>
import {computed, ref, useSlots, watch, inject, onBeforeMount, onBeforeUnmount} from 'vue'
import {wFormErrorMessageUpdater, wFormHasChangesUpdater, wFormInitModelUpdater, wFormInvalidateUpdater, wFormTitleUpdater, wFormUnlistener, wFormValidateUpdater} from './models/injection'

const props = defineProps<{
  name?: string
  title?: string
  validate?: ValidateFn | ValidateFn[]
  forbiddenRegexp?: RegExp
}>()

const emit = defineEmits<{
  (e: 'update:has-changes', value: boolean): void
}>()

const titleUpdater = inject(wFormTitleUpdater, undefined)
const errorMessageUpdater = inject(wFormErrorMessageUpdater, undefined)
const hasChangesUpdater = inject(wFormHasChangesUpdater, undefined)
const validateUpdater = inject(wFormValidateUpdater, undefined)
const invalidateUpdater = inject(wFormInvalidateUpdater, undefined)
const initModelUpdater = inject(wFormInitModelUpdater, undefined)
const unlistener = inject(wFormUnlistener, undefined)

const slots = useSlots()
const component = computed(() => slots.default?.()[0])

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

const errorMessage = ref<string | undefined>()

const hasChanges = ref<boolean>(false)
const hasBeenValidated = ref<boolean>(false)

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
  if (required.value && !value) {
    const message = 'A value is required'

    return message
  }

  if (props.forbiddenRegexp && typeof value === 'string') {
    const match = value.match(props.forbiddenRegexp)

    if (match?.length) {
      const message = 'Value contains forbidden chars: ' + match
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

const validateOnSelect = (value: string) => {
  const newValue = modelValue.value instanceof Array ? modelValue.value.slice() : []
  newValue.push(value)
  validateOnUpdate(newValue)
}

const validateOnUnselect = (value: string) => {
  const newValue = modelValue.value instanceof Array ? modelValue.value.slice() : []
  const index = newValue.indexOf(value)
  if (index !== -1) newValue.splice(index, 1)
  validateOnUpdate(newValue)
}

const validate = (silent?: boolean): string | undefined => {
  const message = _validate(modelValue.value)

  if (!silent) {
    errorMessage.value = message
    hasBeenValidated.value = true
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

watch(errorMessage, value => {
  if (props.name) {
    errorMessageUpdater?.(props.name, value)
  }
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
  if (hasBeenValidated.value) validate()
})

onBeforeMount(() => {
  if (props.name) {
    initModel()

    validateUpdater?.(props.name, validate)
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
})

</script>
