import {computed, ref} from 'vue'

import {type InvalidatePayload, type UniformInstance, type UniformValidate, isInnerInstance} from '../types'

export const useUniformForm = (
  fieldGetter: () => string | number | symbol | undefined,
  titleGetter: () => string | undefined,
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

  const hasValue = computed<boolean | null>(() => mapValues.value.length === 0 || mapValues.value.every(value => value.hasValue === null) ? null : mapValues.value.some(value => value.hasValue) && mapValues.value.every(value => value.hasValue !== false))

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

      return {title: titleGetter(), message: result}
    }

    for (const item of mapValues.value) {
      item.validate(silent, includeMessage)
    }

    return undefined
  }

  const invalidate = (messages: InvalidatePayload): void => {
    const field = fieldGetter()
    const message = field !== undefined && messages instanceof Object && field in messages
      ? messages[field as keyof InvalidatePayload] as InvalidatePayload | undefined
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

  const getFieldChanged = (field: string): boolean => {
    if (fieldGetter() === field) return hasChanges.value

    for (const item of mapValues.value) {
      const result = item.getFieldChanged(field)
      if (result) return true
    }

    return false
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
    getFieldChanged,
  }
}
