import {type InjectionKey, type Reactive, type Ref, computed, provide, ref} from 'vue'

type UniformState = {hasChanges: boolean, hasValue: boolean | null, hasError: boolean}

export const wUniformUpdater = Symbol('wUniformUpdater') as InjectionKey<(value: Reactive<UniformState>, key: string) => void>

export const wUniformUnlistener = Symbol('wUniformUnlistener') as InjectionKey<(key: string) => void>

export type WUniformStepperController = {
  submitting: Ref<boolean>
  hasChanges: Ref<boolean>
  submit: () => Promise<boolean>
  setPayloadScope: (fields: string[] | undefined) => void
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
  const hasValue = computed(() => values.value.some(item => item.hasValue))
  const hasError = computed(() => values.value.some(item => item.hasError))

  return {
    hasChanges,
    hasValue,
    hasError,
  }
}