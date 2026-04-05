import type {InvalidatePayload, UniformValidate} from '../types'

import {type Ref, computed, nextTick, ref} from 'vue'

import {useFieldMessage} from '@/components/FieldWrapper/use/useFieldSaved'
import {validateRequired} from '@/utils/validate'

import {scrollToValidator} from '../utils/utils'

type ValidateMethod<Model> = (value: Model) => string | undefined

export const useUniformField = <Model>(
  modelValue: Ref<Model>,
  modelValueInit: Ref<Model>,
  fieldGetter: () => string | number | symbol | undefined,
  titleGetter: () => string | undefined,
  required: Ref<boolean>,
  mandatory: Ref<boolean>,
  validateList: ValidateMethod<Model> | ValidateMethod<Model>[] | undefined,
) => {
  const showMessage = useFieldMessage()

  const hasShownError = ref(false)
  const errorMessage = ref<string[]>([])
  const fieldRef = ref<ComponentInstance<unknown> | ComponentInstance<unknown>[] | undefined>()

  const setFieldRef = (value: ComponentInstance<unknown>) => {
    fieldRef.value = value
  }

  const errorMessageString = computed(() => hasShownError.value && errorMessage.value.length ? errorMessage.value.join(', ') : undefined)

  const _hasValueFieldExact = computed<boolean | null>(() => {
    if (!required.value && !mandatory.value) return null

    if (Array.isArray(modelValue.value)) return modelValue.value.length !== 0

    return modelValue.value !== undefined && modelValue.value !== null && modelValue.value !== '' && modelValue.value !== false
  })
  const hasValue = computed<boolean | null>(() => mandatory.value && _hasValueFieldExact.value === false ? null : _hasValueFieldExact.value)

  const hasChanges = computed<boolean>(() => {
    if (modelValueInit.value === undefined) return modelValue.value !== undefined && modelValue.value !== ''

    const oldValue = modelValueInit.value
    const newValue = modelValue.value

    if (Array.isArray(newValue) && Array.isArray(oldValue)) {
      return newValue.length !== oldValue.length || newValue.some(item => !oldValue.includes(item))
    } else if (newValue instanceof Object && oldValue instanceof Object) {
      const keys = Object.keys(newValue)
      return keys.length !== Object.keys(oldValue).length
      || keys.some(key => newValue[key as keyof typeof newValue] !== oldValue[key as keyof typeof oldValue])
    } else {
      return modelValue.value !== modelValueInit.value
    }
  })

  const isValid = computed<boolean>(() => errorMessage.value.length === 0)

  const scrollTo = () => {
    const element = Array.isArray(fieldRef.value) ? fieldRef.value[0]?.$el : fieldRef.value?.$el

    if (element instanceof HTMLElement) scrollToValidator(element)
  }

  const validateFieldValue = (newValue: Model): string[] => {
    const requiredMessage = required.value ? validateRequired(newValue) : undefined
    if (requiredMessage) return [requiredMessage]

    const message: string[] = []

    if (validateList === undefined) return message

    for (const fn of Array.isArray(validateList) ? validateList : [validateList]) {
      const result = (fn as ValidateMethod<Model>)(newValue)
      if (result) message.push(result)
    }

    return message
  }

  const validateFieldOnUpdate = (newValue: Model): void => {
    const message = validateFieldValue(newValue)

    errorMessage.value = message

    if (message.length === 0) nextTick(() => hasShownError.value = false)
  }

  const validate: UniformValidate = (silent?: boolean, includeMessage?: boolean)=> {
    const message = validateFieldValue(modelValue.value)

    errorMessage.value = message

    if (!silent) {
      hasShownError.value = message.length > 0

      if (hasShownError.value) scrollTo()
    }

    if (!includeMessage || !message.length) return undefined

    return {
      title: titleGetter() ?? fieldGetter()?.toString(),
      message,
    }
  }

  const invalidate = (messages: InvalidatePayload): void => {
    const field = fieldGetter()
    if (field !== undefined && messages instanceof Object && field in messages) {
      messages = messages[field as keyof typeof messages] as InvalidatePayload
    }

    if (typeof messages === 'string') errorMessage.value.push(messages)
    else if (Array.isArray(messages)) errorMessage.value.push(...messages)

    hasShownError.value = errorMessage.value.length !== 0
  }

  const showMessageField = (message: string, onlyChanged?: boolean) => {
    if (!onlyChanged || hasChanges.value) showMessage(message)
  }

  return {
    setFieldRef,
    errorMessageString,
    hasValue,
    hasChanges,
    hasShownError,
    isValid,
    validateFieldOnUpdate,
    validate,
    invalidate,
    showMessage: showMessageField,
  }
}
