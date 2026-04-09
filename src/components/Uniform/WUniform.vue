<template>
  <component
    :is="props.tag ?? WEmptyComponent"
    :class="DEBUG ? 'group/uniform' : undefined"
  >
    <div
      v-if="DEBUG"
      class="dark:bg-default-dark bg-default text-2xs absolute z-10 grid -translate-y-5 gap-2 rounded-lg opacity-5 hover:z-20 hover:opacity-100"
    >
      <div class="flex flex-wrap items-center gap-1">
        <div
          v-if="field !== undefined"
          class="text-xs font-semibold"
        >
          {{ field }}
        </div>

        <div
          v-for="(item, key) in scopeForm?.map.value"
          :key="key"
          class="rounded bg-gray-200 px-1 text-xs dark:bg-gray-700"
        >
          {{ item.field }}
        </div>

        <div
          class="text-default rounded px-1 font-semibold"
          :class="scopeField?.hasChanges.value ?? scopeForm?.hasChanges.value ? 'bg-info dark:bg-info-dark' : 'bg-gray-300 dark:bg-gray-700'"
        >
          {{ scopeField?.hasChanges.value ?? scopeForm?.hasChanges.value ? 'Has Changes' : 'No Changes' }}
        </div>

        <div
          class="text-default rounded px-1 font-semibold"
          :class="scopeModel.skeleton?.value ?? skeleton ? 'bg-gray-400 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-700'"
        >
          {{ scopeModel.skeleton ? scopeModel.skeleton ? 'Skeleton Model' : 'No skeleton model' : skeleton ? 'Skeleton' : 'No skeleton' }}
        </div>

        <div
          class="rounded px-1 font-semibold"
          :class="scopeField?.hasShownError.value ?? scopeForm?.hasShownError.value ?? false
            ? 'bg-warning dark:bg-warning-dark'
            : 'text-description bg-gray-100 dark:bg-gray-700'
          "
        >
          {{ scopeField ? scopeField.hasShownError ? 'Shown Field' : 'Hidden Field' : scopeForm ? scopeForm.hasShownError ? 'Shown Form' : 'Hidden Form' : 'No shown' }}
        </div>

        <div
          class="text-default rounded px-1 font-semibold"
          :class="
            scopeField?.isValid.value ?? scopeForm?.isValid.value ?? false
              ? 'bg-positive dark:bg-positive-dark'
              : 'bg-negative dark:bg-negative-dark'
          "
        >
          {{ scopeField ? scopeField.isValid ? 'Valid Field' : 'Invalid Field' : scopeForm ? scopeForm.isValid ? 'Valid Form' : 'Invalid Form' : 'No validation' }}
        </div>

        <div
          class="text-default rounded px-1 font-semibold"
          :class="scopeField?.hasValue.value ?? scopeForm?.hasValue.value ? 'bg-positive dark:bg-positive-dark' : 'bg-gray-200 dark:bg-gray-800'"
        >
          {{ scopeField?.hasValue.value ?? scopeForm?.hasValue.value ? 'Has Value' : scopeField?.hasValue.value ?? scopeForm?.hasValue.value === null ? 'Empty' : 'No Value' }}
        </div>

        <div
          v-if="submitting || scopeSubmit?.submitting.value"
          class="text-default rounded bg-gray-200 px-1 font-semibold dark:bg-gray-800"
        >
          {{ async && scopeField?.hasChanges && (submitting || scopeSubmit?.submitting.value) ? 'Submitting Field' : 'Submitting' }}
        </div>

        <div>
          {{ scopeField?.errorMessageString.value ?? 'No Error' }}
        </div>
      </div>
    </div>

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
        disabled: !async && (submitting || (scopeSubmit?.submitting.value ?? false)),
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
        submit: scopeSubmit?.submit,
        onUnmounted: scopeForm?.removeRef,
        select: scopeModel.select,
        unselect: scopeModel.unselect,
        initModel: (value?: InnerModel) => scopeModel.initModel(value ?? scopeModel.innerModel.value),
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

import {type VNode, computed, inject, onUnmounted, reactive, toRef, useId} from 'vue'

import {useUniformField} from './use/useUniformField'
import {useUniformForm} from './use/useUniformForm'
import {useUniformModel} from './use/useUniformModel'
import {useUniformSubmit} from './use/useUniformSubmit'
import {wUniformUnlistener, wUniformUpdater} from './utils/injection'
import {getChangedPayload} from './utils/utils'

import WEmptyComponent from '../EmptyComponent/WEmptyComponent.vue'

const DEBUG = true

const props = defineProps<{
  id?: string
  modelValue?: Model
  modelValueInit?: Model
  field?: Field
  initData?: (value: InnerModel) => ResultModel
  apiMethod?: (value: Partial<ResultModel>) => Promise<RequestResponse<InnerModel>> | Promise<InnerModel> | InnerModel | undefined | void
  useQueryFn?: UseQueryWithParams<InnerModel, QueryParams>
  queryParams?: QueryParams

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
  confimGetter?: (payload: ResultModel, data: Model) => ConfirmProps | Promise<ConfirmProps | undefined> | undefined
}>()

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
    if (!props.async || !scopeForm || !(scopeModel.modelValue.value instanceof Object) || props.fullPayload) return scopeModel.modelValue.value

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
  toRef(props, 'modelValue'),
  toRef(props, 'modelValueInit'),
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
  hasValue: scopeField?.hasValue ?? scopeForm?.hasValue ?? null,
  hasError: scopeField?.hasShownError ?? scopeForm?.hasShownError ?? false,
}), id)

defineExpose({
  id,
  field: props.field,
  hasChanges: scopeField?.hasChanges ?? scopeForm?.hasChanges ?? false,
  hasValue: scopeField?.hasValue ?? scopeForm?.hasValue ?? false,
  isValid: scopeField?.isValid ?? scopeForm?.isValid ?? false,
  hasShownError: scopeField?.hasShownError ?? scopeForm?.hasShownError ?? false,
  fullPayload: props.fullPayload,
  validate: scopeField?.validate ?? scopeForm?.validate ?? (() => undefined),
  invalidate: scopeField?.invalidate ?? scopeForm?.invalidate ?? (() => void 0),
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