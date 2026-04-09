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
    const message = field !== undefined && messages instanceof Object
      ? messages[field as keyof InvalidatePayload] as InvalidatePayload | undefined
      : messages

    if (!message) return

    for (const item of mapValues.value) {
      item.invalidate(message)
    }
  }

  const getInvalidatePayload = (): InvalidatePayload | undefined => {
    const merged: Record<string | number | symbol, InvalidatePayload> = {}
    let hasContent = false

    for (const item of mapValues.value) {
      const payload = item.getInvalidatePayload()
      if (payload === undefined) continue

      if (item.field) {
        merged[item.field] = payload
        hasContent = true
      } else if (payload instanceof Object && !Array.isArray(payload)) {
        Object.assign(merged, payload)
        hasContent = true
      }
    }

    if (!hasContent) return undefined

    return merged
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
    getInvalidatePayload,
    showMessage,
    getFieldChanged,
  }
}
