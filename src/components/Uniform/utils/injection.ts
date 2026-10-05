import type {UniformValidate, ValidateResponse} from '../types'

import {type InjectionKey, type Reactive, type Ref, computed, provide, ref} from 'vue'

type UniformState = {
  hasChanges: boolean
  fullPayload: boolean
  hasValue: boolean | null
  hasError: boolean
  /** Set by fields only, so a group of fields is not checked twice. */
  validate: UniformValidate | undefined
}

export const wUniformUpdater = Symbol('wUniformUpdater') as InjectionKey<(value: Reactive<UniformState>, key: string) => void>

export const wUniformUnlistener = Symbol('wUniformUnlistener') as InjectionKey<(key: string) => void>

/** How many times the nearest form with its own model replaced it with a new one, dropping the changes. */
export const wUniformReset = Symbol('wUniformReset') as InjectionKey<Ref<number>>

export type WUniformStepperController = {
  submitting: () => boolean
  hasChanges: () => boolean
  fullPayload: () => boolean
  submit: () => Promise<boolean>
}

export const wUniformStepperController = Symbol('wUniformStepperController') as InjectionKey<WUniformStepperController>

export const useUniformState = () => {
  const stateMap = ref<Record<string, UniformState>>({})

  provide(wUniformUpdater, (value, key) => {
    stateMap.value[key] = value
  })

  provide(wUniformUnlistener, key => {
    delete stateMap.value[key]
  })

  const values = computed(() => Object.values(stateMap.value))

  const hasChanges = computed(() => values.value.some(item => item.hasChanges))
  const fullPayload = computed(() => values.value.some(item => item.fullPayload))
  const hasValue = computed(() => values.value.some(item => item.hasValue))
  const hasError = computed(() => values.value.some(item => item.hasError))

  /** Checks every field inside, showing their errors, and returns the messages. */
  const validate = (): ValidateResponse => {
    const message = values.value
      .map(item => item.validate?.(false, true))
      .filter(item => item !== undefined)

    return message.length ? {title: undefined, message} : undefined
  }

  return {
    hasChanges,
    fullPayload,
    hasValue,
    hasError,
    validate,
  }
}