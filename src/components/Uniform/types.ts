import type {Component} from 'vue'

export interface UniformInstance {
  id: string
  field: string
  hasValue: boolean | null
  hasShownError: boolean
  hasChanges: boolean
  isValid: boolean
  skeleton?: boolean
  initModel: () => void
  validate: (silent?: boolean, withMessage?: boolean) => string | undefined | void
  invalidate: (messages: InvalidatePayload) => void
  submit: () => Promise<void>
  getErrorMessage: () => string | undefined
}

export type UniformScope<InnerModel, Field = undefined> = {
  ref: (item: UniformInstance | unknown) => void
  parentRef: (item: UniformInstance | unknown) => void
  skeleton: boolean
  modelValue: InnerModel
  modelValueList: Record<string, InnerModel extends unknown[] ? InnerModel[number] : never>
  removeParentRef: (id: string) => void
  onUnmouted: (id: string) => void
  updateModelValue: Field extends undefined ? undefined : (newValue: InnerModel) => void
  updateModelValueInner: <Key extends keyof InnerModel>(newValue: InnerModel[Key], field: [Key]) => void
  select: (newValue: InnerModel extends unknown[] ? InnerModel[number] : never) => void
  unselect: (newValue: InnerModel extends unknown[] ? InnerModel[number] : never) => void
  'onUpdate:modelValue': (newValue: InnerModel, fields: (string | number)[]) => void
}

export type UniformScopeField<InnerModel, Field = undefined> = {
  ref: (component: ComponentInstance<Component>) => void
  field: NonNullable<Field>
  title: string
  modelValue: InnerModel
  hasChanges: boolean
  required: boolean | undefined
  errorMessage: string | undefined
  skeleton: boolean
  updateModelValue: Field extends undefined ? undefined : ((newValue: InnerModel | undefined) => void)
  'onUpdate:modelValue': ((newValue: InnerModel | undefined) => void) | undefined
  onSelect: (newValue: InnerModel extends unknown[] ? InnerModel[number] : never) => void
  onUnselect: (newValue: InnerModel extends unknown[] ? InnerModel[number] : never) => void
}

export type InvalidatePayload = {
  [Key in 'detail' | 'non_field_errors' | string | number]?: InvalidatePayload
} | string[] | string

export const isUniformInstance = (item: UniformInstance | unknown): item is UniformInstance => {
  return item instanceof Object && 'field' in item && item.field !== undefined
}
