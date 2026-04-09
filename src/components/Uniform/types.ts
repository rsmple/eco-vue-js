import type {MaybeRef} from 'vue'

export type ValidateResponse = {
  title: string | undefined
  message: (string | ValidateResponse)[]
} | undefined

export type UniformValidate = (silent?: boolean, includeMessage?: boolean) => ValidateResponse | undefined

export type UniformInstance = {
  id: string
  field: string | number | symbol | undefined
  hasChanges: boolean
  hasValue: boolean | null
  isValid: boolean
  hasShownError: boolean
  fullPayload: boolean
  validate: UniformValidate
  invalidate: (payload: InvalidatePayload) => void
  getInvalidatePayload: () => InvalidatePayload | undefined
  showMessage: (message: string, onlyChanged?: boolean) => void
  getFieldChanged: (field: string) => boolean
}

type ToRefs<Value> = {
  [Key in keyof Value]: MaybeRef<Value[Key]>
} 

export type UniformInstanceExpose<InnerModel, ModelValue> = UniformInstance & {
  modelValue: ModelValue
  updateModelValue: (newValue: ModelValue) => void
  updateModelValueInner: <Fields extends unknown[] | readonly unknown[]>(newValue: Get<ModelValue, Fields>, field: Fields) => void
  submit: (() => Promise<void> | undefined) | undefined
  submitting: boolean
  skeleton: boolean
  initModel: (value?: InnerModel) => void
}

export type InnerInstanceExpose<InnerModel, ModelValue> = ToRefs<UniformInstanceExpose<InnerModel, ModelValue>>

export const isInnerInstance = (value: unknown): value is UniformInstance => value instanceof Object && 'id' in value && 'validate' in value

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UniformScope<ModelValue, InitModel = any> = {
  ref: ((item: UniformInstance | unknown) => void) | undefined
  modelValue: ModelValue
  modelValueList: Record<string, ModelValue extends unknown[] ? ModelValue[number] : never>
  modelValueInit: ModelValue
  async: boolean | undefined
  skeleton: boolean | undefined
  readonly: boolean | undefined
  disabled: boolean | undefined
  submitting: boolean | undefined
  hasChanges: boolean
  select: (newValue: ModelValue extends unknown[] ? ModelValue[number] : never) => void
  unselect: (newValue: ModelValue extends unknown[] ? ModelValue[number] : never) => void
  submit: (() => Promise<void> | undefined) | undefined
  initModel: (value?: InitModel) => void
  onInitModel: () => void
  doValidate: () => void
  getInvalidatePayload: () => InvalidatePayload | undefined
  onUnmounted: ((id: string) => void) | undefined
  updateModelValue: (newValue: ModelValue) => void
  updateModelValueInner: <Fields extends unknown[] | readonly unknown[]>(newValue: Get<ModelValue, Fields>, field: Fields) => void
  'onUpdate:modelValue': (newValue: ModelValue, fields: (string | number)[]) => void
}

export type UniformScopeField<ModelValue> = {
  ref: ((item: UniformInstance | unknown) => void) | undefined
  title: string | undefined
  modelValue: ModelValue
  hasChanges: boolean
  hasValue: boolean | null
  required: boolean | undefined
  errorMessage: string | undefined
  skeleton: boolean | undefined
  loading: boolean | undefined
  readonly: boolean | undefined
  disabled: boolean | undefined
  async: boolean | undefined
  onInitModel: () => void
  onSelect: (value: ModelValue extends unknown[] ? ModelValue[number] : never) => void
  onUnselect: (value: ModelValue extends unknown[] ? ModelValue[number] : never) => void
  updateModelValue: (newValue: ModelValue) => void
  'onUpdate:modelValue': (newValue: ModelValue) => void
}

export type InvalidatePayload = {
  [Key in 'detail' | 'non_field_errors' | string | number]?: InvalidatePayload
} | string[] | string