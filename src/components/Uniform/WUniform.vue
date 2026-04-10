<template>
  <component :is="props.tag ?? WEmptyComponent">
    <slot
      v-if="field !== undefined && $slots.field && scopeField"
      name="field"
      v-bind="{
        ref: scopeField.setFieldRef,
        title,
        modelValue: scopeModel.modelValue.value,
        errorMessage: scopeField.errorMessageString.value,
        hasChanges: scopeField.hasChanges.value,
        hasValue: scopeField.hasValue.value,
        loading: async && scopeField.hasChanges.value && (submitting || (scopeSubmit?.submitting.value ?? false)),
        disabled: disabled || (!async && (submitting || (scopeSubmit?.submitting.value ?? false))),
        readonly,
        skeleton: scopeModel.skeleton ? scopeModel.skeleton.value : skeleton,
        required,
        async,
        onInitModel: () => scopeModel.initModel(),
        onSelect: scopeModel.select,
        onUnselect: scopeModel.unselect,
        updateModelValue: scopeModel.updateModelValue,
        'onUpdate:modelValue': scopeModel.updateModelValue,
      }"
    />

    <slot
      v-bind="{
        ref: scopeForm?.addRef,
        modelValue: scopeModel.modelValue.value,
        modelValueList: scopeModel.modelValueList.value,
        modelValueInit: scopeModel.modelValueInit.value,
        async,
        skeleton: scopeModel.skeleton ? scopeModel.skeleton.value : skeleton,
        hasChanges: scopeField ? scopeField.hasChanges.value : scopeForm ? scopeForm.hasChanges.value : false,
        hasValue: scopeField ? scopeField.hasValue.value : scopeForm ? scopeForm.hasValue.value : false,
        submitting: scopeSubmit ? scopeSubmit.submitting.value : submitting,
        disabled,
        readonly,
        submit: scopeSubmit?.submit,
        onUnmounted: scopeForm?.removeRef,
        select: scopeModel.select,
        unselect: scopeModel.unselect,
        initModel: (value?: InnerModel) => scopeModel.initModel(value ?? scopeModel.innerModel.value),
        doValidate: scopeField?.validate ?? scopeForm?.validate ?? (() => undefined),
        getInvalidatePayload: scopeField?.getInvalidatePayload ?? scopeForm?.getInvalidatePayload ?? (() => undefined),
        onInitModel: () => scopeModel.initModel(),
        updateModelValue: scopeModel.updateModelValue,
        updateModelValueInner: scopeModel.updateModelValueInner as UniformScope<ResultModel>['updateModelValueInner'],
        'onUpdate:modelValue': scopeModel.updateModelValueInner,
      }"
    />
  </component>
</template>

<script setup lang="ts" generic="
  Model,
  QueryParams,
  Field extends keyof NonNullable<Model> | undefined = undefined,
  InnerModel = Model extends unknown[]
    ? Field extends number ? Model[number] : Model
    : Field extends keyof Model ? Model[Field]
    : Model,
  ResultModel = InnerModel
"
>
import type {InnerInstanceExpose, UniformScope, UniformScopeField} from './types'

import {type Ref, type VNode, computed, inject, onUnmounted, reactive, toRef, useId} from 'vue'

import {useUniformField} from './use/useUniformField'
import {useUniformForm} from './use/useUniformForm'
import {useUniformModel} from './use/useUniformModel'
import {useUniformSubmit} from './use/useUniformSubmit'
import {wUniformUnlistener, wUniformUpdater} from './utils/injection'
import {getChangedPayload} from './utils/utils'

import WEmptyComponent from '../EmptyComponent/WEmptyComponent.vue'

const props = withDefaults(defineProps<{
  id?: string
  modelValue?: Model
  modelValueInit?: Model
  field?: Field
  initData?: (value: InnerModel) => ResultModel
  apiMethod?: (value: Partial<ResultModel>) => Promise<RequestResponse<InnerModel>> | Promise<InnerModel> | InnerModel | undefined | void
  useQueryFn?: UseQueryWithParams<InnerModel, QueryParams>
  queryParams?: QueryParams
  readonly?: boolean
  disabled?: boolean

  tag?: string
  title?: string
  required?: boolean
  mandatory?: boolean
  skeleton?: boolean
  async?: boolean
  validate?: ValidateFn | ValidateFn[]
  submitting?: boolean
  noInit?: boolean
  fullPayload?: boolean
  initHasValue?: boolean | null
  initHasError?: boolean
  confimGetter?: (payload: ResultModel, data: Model) => ConfirmProps | Promise<ConfirmProps | undefined> | undefined
}>(), {
  id: undefined,
  modelValue: undefined,
  modelValueInit: undefined,
  field: undefined,
  initData: undefined,
  apiMethod: undefined,
  useQueryFn: undefined,
  queryParams: undefined,

  tag: undefined,
  title: undefined,
  validate: undefined,
  initHasValue: undefined,
  initHasError: undefined,
  confimGetter: undefined,
})

const emit = defineEmits<{
  (e: 'update:model-value', value: ResultModel, fields: (string | number)[]): void
  (e: 'success', value: InnerModel): void
  (e: 'unmounted', id: string): void
  (e: 'init-model'): void
}>()

const id = props.id ?? useId()

const slots = defineSlots<{
  field?: (props: UniformScopeField<ResultModel>) => VNode[]
  default?: (props: UniformScope<ResultModel, InnerModel>) => VNode[]
}>()

const scopeSubmit = props.apiMethod ? useUniformSubmit<ResultModel, InnerModel>(
  () => {
    if (!scopeForm || !(scopeModel.modelValue.value instanceof Object) || props.fullPayload) return scopeModel.modelValue.value

    return getChangedPayload<ResultModel>(scopeModel.modelValue.value, scopeModel.modelValueInit.value, Object.values(scopeForm.map.value))
  },
  props.apiMethod,
  (silent?: boolean | undefined, includeMessage?: boolean | undefined) => scopeField?.validate(silent, includeMessage) ?? scopeForm?.validate(silent, includeMessage),
  payload => scopeField?.invalidate(payload) ?? scopeForm?.invalidate(payload),
  result => emit('success', result),
  result => scopeModel.initModel(result),
  (message, onlyChanged) => scopeField?.showMessage(message, onlyChanged) ?? scopeForm?.showMessage(message, onlyChanged),
  () => props.noInit,
) : undefined

const scopeModel = useUniformModel(
  toRef(props, 'modelValue') as Ref<Model>,
  toRef(props, 'modelValueInit') as Ref<Model>,
  computed(() => props.field),
  props.useQueryFn,
  toRef(props, 'queryParams'),
  props.initData,
  props.confimGetter,
  () => props.async,
  (value, fields) => emit('update:model-value', value, fields),
  (): void => void scopeSubmit?.submit(),
  () => emit('init-model'),
  slots.field ? value => scopeField?.validateFieldOnUpdate(value) : undefined,
)

const scopeField = slots.field ? useUniformField(
  scopeModel.modelValue,
  scopeModel.modelValueInit,
  () => props.field,
  () => props.title,
  toRef(props, 'required'),
  toRef(props, 'mandatory'),
  props.validate,
) : undefined

const scopeForm = slots.default ? useUniformForm(
  () => props.field,
  () => props.title,
) : undefined

const updaterInjected = inject(wUniformUpdater, undefined)
const unlistenerInjected = inject(wUniformUnlistener, undefined)

updaterInjected?.(reactive({
  hasChanges: scopeField?.hasChanges ?? scopeForm?.hasChanges ?? false,
  hasValue: scopeField?.hasValue ?? scopeForm?.hasValue ?? (props.initHasValue !== undefined ? toRef(props, 'initHasValue') as Ref<boolean | null> : null),
  hasError: scopeField?.hasShownError ?? scopeForm?.hasShownError ?? (props.initHasError !== undefined ? toRef(props, 'initHasError') as Ref<boolean> : false),
}), id)

defineExpose({
  id,
  field: props.field,
  hasChanges: scopeField?.hasChanges ?? scopeForm?.hasChanges ?? false,
  hasValue: scopeField?.hasValue ?? scopeForm?.hasValue ?? (props.initHasValue !== undefined ? toRef(props, 'initHasValue') as Ref<boolean | null> : null),
  isValid: scopeField?.isValid ?? scopeForm?.isValid ?? false,
  hasShownError: scopeField?.hasShownError ?? scopeForm?.hasShownError ?? (props.initHasError !== undefined ? toRef(props, 'initHasError') as Ref<boolean> : false),
  fullPayload: props.fullPayload,
  validate: scopeField?.validate ?? scopeForm?.validate ?? (() => undefined),
  invalidate: scopeField?.invalidate ?? scopeForm?.invalidate ?? (() => void 0),
  getInvalidatePayload: scopeField?.getInvalidatePayload ?? scopeForm?.getInvalidatePayload ?? (() => undefined),
  showMessage: scopeField?.showMessage ?? scopeForm?.showMessage ?? (() => void 0),
  getFieldChanged: scopeField?.getFieldChanged ?? scopeForm?.getFieldChanged ?? (() => false),

  modelValue: scopeModel.modelValue,
  updateModelValue: scopeModel.updateModelValue,
  updateModelValueInner: scopeModel.updateModelValueInner as InnerInstanceExpose<InnerModel, ResultModel>['updateModelValueInner'],
  skeleton: scopeModel.skeleton ?? toRef(props, 'skeleton'),
  submit: scopeSubmit?.submit,
  submitting: scopeSubmit?.submitting ?? toRef(props, 'submitting'),
  initModel: scopeModel.initModel,
} satisfies InnerInstanceExpose<InnerModel, ResultModel>)

onUnmounted(() => {
  unlistenerInjected?.(id)
  emit('unmounted', id)
})
</script>