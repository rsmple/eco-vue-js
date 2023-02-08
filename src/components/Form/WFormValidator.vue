<template>
  <component
    :is="component"
    :error-message="errorMessage"
    @update:model-value="validateOnUpdate"
    @select="validateOnUpdate"
    @unselect="validateOnUpdate"
  />
</template>

<script lang="ts" setup>
import {computed, ref, useSlots, watch, inject, onBeforeMount, onBeforeUnmount, nextTick} from 'vue'
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

const validateOnUpdate = async () => {
  await nextTick()

  validate()
  updateHasChanges()
}

const updateHasChanges = (): void => {
  if (initModelValue.value === undefined) {
    hasChanges.value = modelValue.value !== undefined && modelValue.value !== ''
  } else {
    if (modelValue.value instanceof Array && initModelValue.value instanceof Array) {
      const oldValue = initModelValue.value
      const newValue = modelValue.value

      hasChanges.value = newValue.length !== oldValue.length || newValue.some(item => !oldValue.includes(item))
    } else {
      hasChanges.value = modelValue.value !== initModelValue.value
    }
  }
}

const validate = (silent?: boolean): string | undefined => {
  if (required.value && !modelValue.value) {
    const message = 'A value is required'

    if (!silent) errorMessage.value = message

    return message
  }

  if (props.forbiddenRegexp && typeof modelValue.value === 'string') {
    const match = modelValue.value.match(props.forbiddenRegexp)

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

      if (!silent) errorMessage.value = message

      return message
    }
  }

  let message

  if (props.validate instanceof Array) {
    message = props.validate.map(cb => cb(modelValue.value)).filter(item => item).join(', ') || undefined
  } else {
    message = props.validate?.(modelValue.value) || undefined
  }

  if (!silent) errorMessage.value = message

  return message
}

const invalidate = (messages: Record<string, string>): void => {
  if (!props.name) return

  errorMessage.value = messages[props.name]
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
  validateOnUpdate,
})

</script>
