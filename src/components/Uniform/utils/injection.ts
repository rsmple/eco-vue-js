import {type InjectionKey, type Reactive, type Ref, computed, provide, ref} from 'vue'

type UniformState = {hasChanges: boolean, fullPayload: boolean, hasValue: boolean | null, hasError: boolean}

export const wUniformUpdater = Symbol('wUniformUpdater') as InjectionKey<(value: Reactive<UniformState>, key: string) => void>

export const wUniformUnlistener = Symbol('wUniformUnlistener') as InjectionKey<(key: string) => void>

export type WUniformStepperController = {
  submitting: Ref<boolean>
  hasChanges: Ref<boolean>
  fullPayload: Ref<boolean>
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

  return {
    hasChanges,
    fullPayload,
    hasValue,
    hasError,
  }
}