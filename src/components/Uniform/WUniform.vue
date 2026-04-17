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
        hasChanges: scopeField.hasChanges?.value,
        hasValue: scopeField.hasValue.value,
        loading: async && scopeField.hasChanges?.value && (submitting || (scopeSubmit?.submitting.value ?? false)),
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
        hasChanges: noChanges ? undefined : scope?.hasChanges?.value ,
        hasValue: scope?.hasValue.value ?? false,
        submitting: scopeSubmit ? scopeSubmit.submitting.value : submitting,
        disabled,
        readonly,
        submit: scopeSubmit?.submit,
        onUnmounted: scopeForm?.removeRef,
        select: scopeModel.select,
        unselect: scopeModel.unselect,
        initModel: (value?: InnerModel) => scopeModel.initModel(value ?? scopeModel.innerModel.value),
        doValidate: scope?.validate ?? (() => undefined),
        getInvalidatePayload: scope?.getInvalidatePayload ?? (() => undefined),
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

type PropsBase = {
  id?: string
  modelValue?: Model
  modelValueInit?: Model
  field?: Field
  initData?: (value: InnerModel) => ResultModel
  apiMethod?: (value: Partial<ResultModel>) => Promise<RequestResponse<InnerModel>> | Promise<InnerModel> | InnerModel | undefined | void
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
  noChanges?: boolean
  confimGetter?: (payload: ResultModel, data: Model) => ConfirmProps | Promise<ConfirmProps | undefined> | undefined
}

type PropsNoQuery = {
  useQueryFn?: never
  queryParams?: never
  noParams?: never
}

type PropsQueryWithParams = {
  // eslint-disable-next-line vue/no-required-prop-with-default
  useQueryFn: UseQueryWithParams<InnerModel, QueryParams>
  // eslint-disable-next-line vue/no-required-prop-with-default
  queryParams: QueryParams
  noParams?: never
}

type PropsQueryWithNoParams = {
  // eslint-disable-next-line vue/no-required-prop-with-default
  useQueryFn: UseQueryEmpty<InnerModel>
  queryParams?: never
  // eslint-disable-next-line vue/no-required-prop-with-default
  noParams: true
}

const props = withDefaults(defineProps<PropsBase & (PropsNoQuery | PropsQueryWithParams | PropsQueryWithNoParams)>(), {
  id: undefined,
  modelValue: undefined,
  modelValueInit: undefined,
  field: undefined,
  initData: undefined,
  apiMethod: undefined,
  useQueryFn: undefined,
  queryParams: undefined,
  noParams: undefined,

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
  (silent?: boolean | undefined, includeMessage?: boolean | undefined) => scope?.validate(silent, includeMessage),
  payload => scope?.invalidate(payload),
  result => emit('success', result),
  result => scopeModel.initModel(result),
  (message, onlyChanged) => scope?.showMessage(message, onlyChanged),
  () => props.noInit,
) : undefined

const scopeModel = useUniformModel(
  toRef(props, 'modelValue') as Ref<Model>,
  toRef(props, 'modelValueInit') as Ref<Model>,
  computed(() => props.field),
  props.useQueryFn as UseQueryWithParams<InnerModel, QueryParams>,
  props.noParams ? undefined : toRef(props, 'queryParams'),
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
  props.noChanges,
) : undefined

const scopeForm = slots.default ? useUniformForm(
  () => props.field,
  () => props.title,
) : undefined

const scope = scopeField ?? scopeForm

const updaterInjected = inject(wUniformUpdater, undefined)
const unlistenerInjected = inject(wUniformUnlistener, undefined)

updaterInjected?.(reactive({
  hasChanges: scope?.hasChanges ?? false,
  hasValue: (props.initHasValue !== undefined ? toRef(props, 'initHasValue') : scope?.hasValue ?? null) as Ref<boolean | null>,
  hasError: (props.initHasError !== undefined ? toRef(props, 'initHasError') : scope?.hasShownError ?? null) as Ref<boolean>,
}), id)

defineExpose({
  id,
  field: props.field,
  hasChanges: props.noChanges ? false : (scope?.hasChanges ?? false),
  hasValue: (props.initHasValue !== undefined ? toRef(props, 'initHasValue') : scope?.hasValue ?? null) as Ref<boolean | null>,
  isValid: scope?.isValid ?? false,
  hasShownError: (props.initHasError !== undefined ? toRef(props, 'initHasError') : scope?.hasShownError ?? null) as Ref<boolean>,
  fullPayload: props.fullPayload,
  validate: scope?.validate ?? (() => undefined),
  invalidate: scope?.invalidate ?? (() => void 0),
  getInvalidatePayload: scope?.getInvalidatePayload ?? (() => undefined),
  showMessage: scope?.showMessage ?? (() => void 0),
  getFieldChanged: scope?.getFieldChanged ?? (() => false),

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