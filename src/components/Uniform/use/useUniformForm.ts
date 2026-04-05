import {type Ref, computed, ref} from 'vue'

import {type InvalidatePayload, type UniformInstance, type UniformValidate, isInnerInstance} from '../types'

export const useUniformForm = (
  field: Ref<string | number | symbol | undefined>,
  title: Ref<string | undefined>,
) => {
  const map = ref<Record<string, UniformInstance>>({})

  const addRef = (item: UniformInstance | unknown) => {
    if (!(isInnerInstance(item))) return

    if (map.value[item.id] === item) return

    map.value[item.id] = item
  }

  const removeRef = (id: string) => {
    if (!(id in map.value)) return

    delete map.value[id]
  }

  const mapValues = computed(() => Object.values(map.value))

  const hasValue = computed<boolean | null>(() => mapValues.value.length === 0 ? null : mapValues.value.some(value => value.hasValue) && mapValues.value.every(value => value.hasValue !== false))

  const hasShownError = computed<boolean>(() => mapValues.value.some(value => value.hasShownError))

  const hasChanges = computed<boolean>(() => mapValues.value.some(value => value.hasChanges))

  const isValid = computed<boolean>(() => mapValues.value.every(item => item.isValid))

  const validate: UniformValidate = (silent?: boolean, includeMessage?: boolean) => {
    if (includeMessage) {
      const result = []

      for (const item of mapValues.value) {
        const message = item.validate(silent, includeMessage)
        if (message) result.push(message)
      }

      if (!result.length) return undefined

      return {title: title.value, message: result}
    }

    for (const item of mapValues.value) {
      item.validate(silent, includeMessage)
    }

    return undefined
  }

  const invalidate = (messages: InvalidatePayload): void => {
    const message = field.value !== undefined && messages instanceof Object && field.value in messages
      ? messages[field.value as keyof InvalidatePayload] as InvalidatePayload | undefined
      : messages

    if (!message) return

    for (const item of mapValues.value) {
      item.invalidate(message)
    }
  }

  const showMessage = (message: string, onlyChanged?: boolean): void => {
    for (const item of mapValues.value) {
      item.showMessage(message, onlyChanged)
    }
  }

  return {
    addRef,
    removeRef,
    map,
    hasValue,
    hasShownError,
    hasChanges,
    isValid,
    validate,
    invalidate,
    showMessage,
  }
}
