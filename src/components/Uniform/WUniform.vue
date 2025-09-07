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
          v-for="(item, key) in map"
          :key="key"
          class="rounded bg-gray-200 px-1 text-xs dark:bg-gray-700"
        >
          {{ item.field }}
        </div>

        <div
          class="text-default rounded px-1 font-semibold"
          :class="{
            'bg-gray-300 dark:bg-gray-700': !hasChanges,
            'bg-info dark:bg-info-dark': hasChanges,
          }"
        >
          {{ hasChanges ? 'Has Changes' : 'No Changes' }}
        </div>

        <div
          class="text-default rounded px-1 font-semibold"
          :class="{
            'bg-gray-300 dark:bg-gray-700': !skeletonValue,
            'bg-gray-400 dark:bg-gray-600': skeletonValue,
          }"
        >
          {{ skeletonValue ? 'Skeleton' : 'No skeleton' }}
        </div>

        <div
          class="rounded px-1 font-semibold"
          :class="{
            'text-description bg-gray-100 dark:bg-gray-700': !isShownError,
            'bg-warning dark:bg-warning-dark': isShownError,
          }"
        >
          {{ isShownError ? 'Shown' : 'Hidden' }}
        </div>

        <div
          class="text-default rounded px-1 font-semibold"
          :class="{
            'bg-negative dark:bg-negative-dark': !isValid,
            'bg-positive dark:bg-positive-dark': isValid,
          }"
        >
          {{ isValid ? 'Valid' : 'Invalid' }}
        </div>

        <div>
          {{ errorMessage ?? 'No Error' }}
        </div>
      </div>
    </div>

    <slot
      v-bind="{
        ref: addRef,
        parentRef: addRef,
        modelValue: value as InnerModel,
        modelValueList,
        skeleton: skeletonValue,
        removeParentRef: removeRef,
        onUnmouted: removeRef,
        updateModelValue: (field ? updateModelValue : undefined) as Field extends undefined ? undefined : typeof updateModelValue,
        updateModelValueInner: updateModelValueInner as UniformScope<InnerModel, Field>['updateModelValueInner'],
        select,
        unselect,
        'onUpdate:modelValue': updateModelValueInner,
      }"
    />

    <slot
      v-if="field"
      name="field"
      v-bind="{
        ref: fieldRef,
        field,
        title: title as string,
        modelValue: value ?? null as InnerModel,
        hasChanges,
        required,
        errorMessage: isShownError ? errorMessage.join('. ') : undefined,
        skeleton: skeletonValue,
        updateModelValue: (field ? updateModelValue : undefined) as UniformScopeField<InnerModel, Field>['updateModelValue'],
        'onUpdate:modelValue': field ? updateModelValue : undefined,
        'onSelect': select,
        'onUnselect': unselect,
        'onInitModel': initModel,
      }"
    />
  </component>
</template>

<script setup lang="ts" generic="Model, QueryParams, Field extends (Model extends unknown[] ? number : keyof Model) | undefined = undefined, Result = Model">
import {type VNode, computed, isReadonly, nextTick, onBeforeUnmount, ref, toRef, useId, watch} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import {Notify} from '@/utils/Notify'
import {ApiError, ApiErrorCancel} from '@/utils/api'
import {validateRequired} from '@/utils/validate'

import {type InvalidatePayload, type UniformInstance, type UniformScope, type UniformScopeField, isUniformInstance} from './types'
import {scrollToValidator} from './utils/utils'

const DEBUG = true

type InnerModel = Model extends unknown[]
  ? Field extends number
    ? Model[number]
    : Model
  : Field extends keyof Model
  ? Model[Field]
  : Model

type ValidateMethod = (value: InnerModel) => string | undefined

type NoQueryProps = {
  useQueryFn?: never
  queryParams?: never
  getModel?: never
}

type QueryPropsParams = {
  useQueryFn: UseQueryWithParams<Result, QueryParams>
  queryParams: QueryParams
  getModel?: (value: Result | undefined) => Model
}

type QueryPropsNoParams = {
  useQueryFn: UseQueryEmpty<Result>
  queryParams?: never
  getModel?: (value: Result | undefined) => Model
}

type Props = {
  id?: string
  title?: string
  parentRef?: (item: UniformInstance) => void
  externalRef?: (item: UniformInstance) => void
  removeParentRef?: (id: string) => void
  modelValue?: Model
  field?: Field
  initData?: () => Model
  required?: boolean
  validate?: ValidateMethod | ValidateMethod[]
  mandatory?: boolean
  skeleton?: boolean
  apiMethod?: (data: Partial<Model>) => Promise<RequestResponse<Result>>
  tag?: keyof HTMLElementTagNameMap
}

const props = defineProps<Props & NoQueryProps | Props & QueryPropsParams | Props & QueryPropsNoParams>()

const emit = defineEmits<{
  (e: 'unmouted', id: string): void
  (e: 'update:model-value', value: InnerModel, fields: (string | number)[]): void
  (e: 'success', data: Result): void
}>()

const idValue = props.id ?? useId()

const query = props.modelValue === undefined && props.initData === undefined && 'useQueryFn' in props
  ? props.queryParams !== undefined
    ? (props.useQueryFn as UseQueryWithParams<Result, QueryParams>)(toRef(props, 'queryParams'))
    : (props.useQueryFn as UseQueryEmpty<Result>)()
  : undefined

const data = props.initData
  ? ref(props.initData())
  : query
    ? props.getModel
      ? ref(props.getModel(query.data.value))
      : query.data
    : toRef(props, 'modelValue')

const value = computed<InnerModel>(() => props.field !== undefined
  ? data.value instanceof Object && data.value !== null
    ? data.value[props.field]
    : undefined
  : data.value)

const initModelValue = ref(value.value)

const modelValueList = computed<Record<string, InnerModel extends unknown[] ? InnerModel[number] : never>>(previousValue => {
  const result: Record<string, InnerModel extends unknown[] ? InnerModel[number] : never> = previousValue ?? {}

  const currentValue = value.value

  if (!Array.isArray(currentValue)) return result

  const resultList = Object.values(result)

  for (const item of currentValue) {
    const index = resultList.indexOf(item)

    if (index !== -1) {
      resultList.splice(index, 1)
      continue
    }

    result[useId()] = item
  }

  for (const removedItem in result) {
    if (currentValue.includes(result[removedItem])) continue

    delete result[removedItem]
  }

  return result
})

const map = ref<Record<string, UniformInstance>>({})

const addRef = (item: UniformInstance | unknown) => {
  if (!(isUniformInstance(item))) return

  (item as unknown as Props).externalRef?.(item)

  if (props.field === undefined) props.parentRef?.(item)

  if (item.field === undefined || map.value[item.id] === item) return

  map.value[item.id] = item
}

const removeRef = (id: string) => {
  if (!(id in map.value)) return

  delete map.value[id]
}

const mapValues = computed(() => Object.values(map.value))
const fieldRef = ref<ComponentInstance<unknown> | ComponentInstance<unknown>[] | undefined>()

const isShownError = ref(false)
const errorMessage = ref<string[]>([])
const isSubmitting = ref(false)

const skeletonQuery = computed<boolean>(() => query !== undefined && !query.data.value)
const skeletonValue = computed<boolean>(() => props.skeleton || skeletonQuery.value)

const _hasValueFieldExact = computed<boolean | null>(() => {
  if (!props.required && !props.mandatory) return null

  if (Array.isArray(value.value)) return value.value.length !== 0

  return value.value !== undefined && value.value !== null && value.value !== '' && value.value !== false
})
const _hasValueField = computed<boolean | null>(() => props.mandatory && _hasValueFieldExact.value === false ? null : _hasValueFieldExact.value)
const _hasValue = computed<boolean | null>(() => mapValues.value.length === 0 ? null : mapValues.value.every(value => value.hasValue))
const hasValue = computed<boolean | null>(() => props.field !== undefined ? _hasValue.value || _hasValueField.value : _hasChanges.value)

const _hasShownError = computed<boolean>(() => mapValues.value.some(value => value.hasShownError))
const hasShownError = computed<boolean>(() => props.field !== undefined ? _hasShownError.value || isShownError.value : _hasShownError.value)

const _hasChanges = computed<boolean>(() => mapValues.value.some(value => value.hasChanges))
const _hasChangesField = computed<boolean>(() => {
  if (props.field === undefined) return false

  if (initModelValue.value === undefined) {
    return value.value !== undefined && value.value !== ''
  } else {
    const oldValue = initModelValue.value
    const newValue = value.value

    if (Array.isArray(newValue) && Array.isArray(oldValue)) {
      return newValue.length !== oldValue.length || (!(newValue[0] instanceof Object) && newValue.some(item => !oldValue.includes(item)))
    } else if (newValue instanceof Object && oldValue instanceof Object) {
      const keys = Object.keys(newValue)
      return keys.length !== Object.keys(oldValue).length
        || keys.some(key => newValue[key as keyof typeof newValue] !== oldValue[key as keyof typeof oldValue])
    } else {
      return value.value !== initModelValue.value
    }
  }
})
const hasChanges = computed<boolean>(() => props.field !== undefined ? _hasChanges.value || _hasChangesField.value : _hasChanges.value)

const _isValidField = computed<boolean>(() => errorMessage.value.length === 0)
const _isValid = computed<boolean>(() => mapValues.value.every(item => item.isValid))
const isValid = computed<boolean>(() => _isValidField.value && _isValid.value)

const initModel = (): void => {
  if (skeletonValue.value) return

  if (props.getModel && query) data.value = props.getModel(query.data.value)

  isShownError.value = false
  initModelValue.value = value.value

  validateField(true)

  for (const item of mapValues.value) {
    item.initModel()
  }
}

const updateModelValue = (newValue: InnerModel | undefined): void => {
  if (props.field === undefined) return

  emit('update:model-value', newValue!, [props.field as string | number])

  _validateFieldAndUpdateMessage(newValue!)
}

const select = (newValue: InnerModel extends unknown[] ? InnerModel[number] : never): void => {
  if (props.field === undefined || !Array.isArray(value.value)) return

  const newList = [...value.value, newValue] as InnerModel

  emit('update:model-value', newList, [props.field as string | number])

  _validateFieldAndUpdateMessage(newList)
}

const unselect = (newValue: InnerModel extends unknown[] ? InnerModel[number] : never): void => {
  if (props.field === undefined || !Array.isArray(value.value)) return

  const newList = value.value.slice()
  const index = newList.indexOf(newValue)
  if (index !== -1) newList.splice(index, 1)

  emit('update:model-value', newList as InnerModel, [props.field as string | number])

  _validateFieldAndUpdateMessage(newList as InnerModel)
}

const updateModelValueInner = (newValue: InnerModel, fields: (string | number)[]) => {
  if (!isReadonly(data.value) && (props.initData || props.getModel)) {
    let current = data.value

    for (const field of fields) {
      if (fields.indexOf(field) !== fields.length - 1) current = current[field]
      else {
        current[field] = newValue

        validateField(true)
        break
      }
    }
  }

  emit('update:model-value', newValue, props.field !== undefined ? [props.field as string | number, ...fields] : fields)
}

const _validateField = (newValue: InnerModel): string[] => {
  const requiredMessage = props.required ? validateRequired(newValue) : undefined
  if (requiredMessage) return [requiredMessage]

  const message: string[] = []

  if (props.validate === undefined) return message

  for (const fn of Array.isArray(props.validate) ? props.validate : [props.validate]) {
    const result = (fn as ValidateMethod)(newValue)
    if (result) message.push(result)
  }

  return message
}

const _validateFieldAndUpdateMessage = (newValue: InnerModel) => {
  const message = _validateField(newValue)

  errorMessage.value = message

  if (message.length === 0) nextTick(() => isShownError.value = false)
}

const validateField = (silent?: boolean): string[] => {
  const message = _validateField(value.value)

  errorMessage.value = message

  if (!silent) {
    isShownError.value = message.length > 0

    if (isShownError.value) scrollTo()
  }

  return message
}

const validateForm = (silent?: boolean, withMessage?: boolean) => {
  const messages: string[] = []

  for (const item of mapValues.value) {
    const result = item.validate(silent, withMessage)

    if (result) messages.push(result)
  }

  const message = validateField(silent)

  if (!withMessage) return

  if (mapValues.value.length === 0 && props.field !== undefined) return message.length !== 0
    ? ` - ${ props.title ?? props.field.toString() }: ${ message.join('. ') }`
    : undefined

  const text = messages.join('\n') || undefined

  return text && props.title ? `${ props.title }\n${ text }` : text
}

const invalidate = (messages: InvalidatePayload): void => {
  const message = props.field !== undefined && messages instanceof Object && props.field in messages
    ? messages[props.field as keyof InvalidatePayload] as InvalidatePayload | undefined
    : messages

  if (message === undefined) return

  if (typeof message === 'string') {
    errorMessage.value.push(message)
    isShownError.value = true
    return
  }

  if (Array.isArray(message) && message.every(item => typeof item === 'string')) {
    if (message.length) {
      errorMessage.value.push(...message)
      isShownError.value = true
    }
    return
  }

  if (Object.keys(message).length === 0) return

  for (const item of mapValues.value) {
    item.invalidate(message)
  }
}

const getErrorMessage = (): string | undefined => {
  if (mapValues.value.length === 0 && props.field !== undefined) return errorMessage.value.length !== 0
    ? ` - ${ props.title ?? props.field.toString() }: ${ errorMessage.value.join('. ') }`
    : undefined

  const messages = mapValues.value.map(item => item.getErrorMessage()).filter(Boolean).join('\n') || undefined

  if (!messages && errorMessage.value.length === 0) return undefined

  const prefix = props.title
    ? `${ props.title }${ errorMessage.value.length !== 0 ? ': ' + errorMessage.value.join('. ') : '' }`
    : errorMessage.value.length !== 0 ? errorMessage.value.join('. ') : ''

  if (!messages) return prefix

  return `${ prefix }\n${ messages }`
}

const submit = () => {
  if (!hasChanges.value) {
    Notify.warn({title: 'No changes'})

    return
  }

  const message = validateForm(false, true)

  if (message) {
    Notify.warn({
      title: 'Form contains invalid data',
      caption: message && message.length < 200 ? message : undefined,
    })

    return
  }

  if (isSubmitting.value) return

  if (!props.apiMethod) {
    emit('success', data.value)
    return
  }

  isSubmitting.value = true

  return props.apiMethod(data.value)
    .then(response => {
      query?.setData(response.data)

      initModel()

      emit('success', response.data)
    })
    .catch(error => {
      if (error instanceof ApiError && !(error instanceof ApiErrorCancel)) {
        const messages = error.response?.data as InvalidatePayload | undefined

        const caption = !messages || typeof messages === 'string' || Array.isArray(messages)
          ? messages
          : messages.detail ??
            messages.non_field_errors ??
            (props.field !== undefined ? messages?.[props.field] : messages)

        const text = typeof caption === 'string' ? caption : Array.isArray(caption) && caption.every(item => typeof item === 'string') ? caption.join('. ') : undefined

        Notify.error({
          title: 'Error',
          caption: text && text.length < 200 ? text : undefined,
        })

        if (messages) invalidate(messages)
      }

      // return Promise.reject(error)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const scrollTo = () => {
  const element = Array.isArray(fieldRef.value) ? fieldRef.value[0]?.$el : fieldRef.value?.$el

  if (element instanceof HTMLElement) scrollToValidator(element)
}

watch(() => props.required, () => void validateField())
watch(skeletonValue, () => void initModel(), {immediate: true})

onBeforeUnmount(() => {
  if (props.field !== undefined) {
    emit('unmouted', idValue)
    props.removeParentRef?.(idValue)
  }
})

defineExpose({
  id: idValue,
  title: toRef(props, 'title'),
  field: toRef(props, 'field'),
  hasValue,
  hasShown: hasShownError,
  hasChanges,
  isValid,
  isSubmitting,
  skeleton: skeletonValue,
  modelValue: value,
  initModel,
  validate: validateForm,
  invalidate,
  submit,
  getErrorMessage,
  externalRef: props.externalRef,
  updateModelValue,
  updateModelValueInner: updateModelValueInner as UniformScope<InnerModel, Field>['updateModelValueInner'],
})

defineSlots<{
  default: (props: UniformScope<InnerModel, Field>) => VNode[]
  field: (props: UniformScopeField<InnerModel, Field>) => VNode[]
}>()
</script>