import {type Ref, computed, inject, nextTick, provide, ref, useId, watch} from 'vue'

import {Modal} from '@/utils/Modal'

import {wUniformReset} from '../utils/injection'

const copyItem = <Value>(value: Value): Value => Array.isArray(value)
  ? value.map(copyItem) as Value
  : value instanceof Date
    ? new Date(value) as Value
    : value instanceof Object
      ? Object.keys(value).reduce<Value>((result, key) => {
        result[key as keyof Value] = copyItem(value[key as keyof Value])
        return result
      }, {} as Value)
      : value

const isPlainObject = (value: unknown): value is Record<string, unknown> => value instanceof Object && !Array.isArray(value) && !(value instanceof Date)

const isSame = (value: unknown, other: unknown): boolean => {
  if (value instanceof Date && other instanceof Date) return value.getTime() === other.getTime()
  if (Array.isArray(value) && Array.isArray(other)) return value.length === other.length && value.every((item, index) => isSame(item, other[index]))
  if (isPlainObject(value) && isPlainObject(other)) {
    const keys = Object.keys(value)

    return keys.length === Object.keys(other).length && keys.every(key => isSame(value[key], other[key]))
  }

  return value === other
}

/**
 * Takes `next` as the new model, keeping the parts of `current` that differ from `init` — the changes not saved yet.
 * Objects are merged key by key; a changed array or value is kept whole.
 */
const keepChanges = <Value>(next: Value, current: Value, init: Value): Value => {
  if (isSame(current, init)) return next

  if (isPlainObject(next) && isPlainObject(current) && isPlainObject(init)) {
    const result: Record<string, unknown> = {...next}

    for (const key of Object.keys(current)) {
      result[key] = keepChanges(next[key], current[key], init[key])
    }

    return result as Value
  }

  return current
}

export const useUniformModel = <ParentModel, Field extends keyof NonNullable<ParentModel>, InnerModel, QueryParams, ResultModel>(
  parentModel: Ref<ParentModel>,
  parentModelInit: Ref<ParentModel>,
  field: Ref<Field | undefined>,
  useQueryFn: UseQueryDefault<InnerModel, QueryParams> | undefined,
  queryParams: Ref<QueryParams | undefined> | undefined,
  initFn: ((value: InnerModel) => ResultModel) | undefined,
  confimGetter: ((payload: ResultModel, data: ParentModel) => ConfirmProps | Promise<ConfirmProps | undefined> | undefined) | undefined,
  asyncGetter: () => boolean,
  emitModelValue: (value: ResultModel, fields: (string | number)[]) => void,
  submit: () => void,
  emitInitModel: () => void,
  validateOnUpdate: ((newValue: ResultModel) => void) | undefined,
) => {
  const query = useQueryFn
    ? useQueryFn(queryParams as Ref<QueryParams>, {enabled: computed(() => !parentModel.value)})
    : undefined

  const getParentValue = () => field.value !== undefined ? parentModel.value?.[field.value] as InnerModel : parentModel.value as unknown as InnerModel

  const innerModel = query
    ? computed<InnerModel>(() => getParentValue() ?? query.data.value as InnerModel)
    : computed<InnerModel>(getParentValue)

  const skeleton = query ? computed(() => !query.data.value && query.isEnabled.value) : undefined
  const data = initFn || query ? ref<ResultModel>((initFn ?? copyItem)((innerModel.value ?? {}) as ResultModel & InnerModel)) : undefined
  const modelValueInitRef = initFn || query ? ref<ResultModel>((initFn ?? copyItem)((innerModel.value ?? {}) as ResultModel & InnerModel)) : undefined
  const modelValueInit = modelValueInitRef ?? (field.value !== undefined ? computed(() => parentModelInit.value?.[field.value as keyof ParentModel]) : parentModelInit)
  const modelValue: Ref<ResultModel> = data ?? innerModel as unknown as Ref<ResultModel>

  // Counts the times this form dropped its changes for a new model, so the forms inside it with their own copy drop theirs too.
  const parentReset = inject(wUniformReset, undefined)
  const reset = ref(0)

  if (data && modelValueInitRef) {
    provide(wUniformReset, reset)

    // A new value from the parent or the query — e.g. a save that updated the cache — keeps the changes not saved yet,
    // unless the query now loads another item or the parent form was reset.
    watch([innerModel, () => queryParams?.value, () => parentReset?.value], ([value, params, parentResetValue], [, paramsOld, parentResetOld]) => {
      const next = (initFn ?? copyItem)(value ?? {} as InnerModel)
      const isReset = !isSame(params, paramsOld) || parentResetValue !== parentResetOld

      data.value = isReset ? next : keepChanges(next, data.value, modelValueInitRef.value)
      modelValueInitRef.value = (initFn ?? copyItem)(value ?? {} as InnerModel)

      if (isReset) reset.value++
    })
  }

  const modelValueList = computed<Record<string, ResultModel extends unknown[] ? ResultModel[number] : never>>(previousValue => {
    const result: Record<string, ResultModel extends unknown[] ? ResultModel[number] : never> = previousValue ? {...previousValue} : {}

    const currentValue = modelValue.value

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

  const initModel = (value?: InnerModel) => {
    if (query && value) {
      query.setData(value)
    }
    
    if (data && modelValueInitRef) {
      if (value) {
        data.value = (initFn ?? copyItem)(value)
        modelValueInitRef.value = (initFn ?? copyItem)(value)
        reset.value++
      } else {
        modelValueInitRef.value = copyItem(data.value)
      }
    } else {
      emitInitModel()
    }
  }
  
  /**
   * Takes the saved `payload` as the initial value of its fields, leaving the rest of the model as it is: other fields
   * may hold changes that were not sent. With the saved `value`, its fields are taken from it, in the model too.
   */
  const initFields = (value: InnerModel | undefined, payload: Partial<ResultModel>) => {
    if (!data || !modelValueInitRef || !(data.value instanceof Object) || !(modelValueInitRef.value instanceof Object)) return initModel(value)

    if (query && value) query.setData(value)

    const source = (value !== undefined ? (initFn ?? copyItem)(value) : payload) as Partial<ResultModel>

    for (const key of Object.keys(payload) as (keyof ResultModel)[]) {
      modelValueInitRef.value[key] = copyItem(source[key]) as ResultModel[keyof ResultModel]

      if (value !== undefined) data.value[key] = copyItem(source[key]) as ResultModel[keyof ResultModel]
    }
  }

  const emitValue = (value: ResultModel) => {
    validateOnUpdate?.(value)

    if (data) data.value = value
    else emitModelValue(value, field.value !== undefined ? [field.value as string | number] : [])
  
    if (asyncGetter() && data) return nextTick(submit)
  }
  
  let closeModal: (() => void) | null = null
  
  const showModal = async (value: ResultModel): Promise<void> => {
    closeModal?.()
  
    let confirmProps = confimGetter?.(value, parentModel.value)
  
    if (confirmProps instanceof Promise) {
      confirmProps = await confirmProps
    }

    if (!confirmProps) return emitValue(value)

    return new Promise((resolve, reject) => {
      closeModal = Modal.addConfirm({
        ...confirmProps,
        onCancel: reject,
        onAccept: () => resolve(emitValue(value)),
      }, () => closeModal = null)
    })
  }

  const select = (newValue: ResultModel extends unknown[] ? ResultModel[number] : never): void => {
    const newList = [...(modelValue.value as unknown[]) ?? [], newValue] as ResultModel

    showModal(newList)
  }

  const unselect = (newValue: ResultModel extends unknown[] ? ResultModel[number] : never): void => {
    const newList = (modelValue.value as unknown[])?.slice() ?? []
    const index = newList.indexOf(newValue)
    if (index !== -1) newList.splice(index, 1)
  
    showModal(newList as ResultModel)
  }
  
  const updateModelValue = (newValue: ResultModel | undefined): Promise<void> => {
    return showModal(newValue!)
  }
  
  const updateModelValueInner = (newValue: ResultModel, fields: (string | number)[]) => {
    if (!data) {
      emitModelValue(newValue, field.value !== undefined ? [field.value as string | number, ...fields] : fields)
      return
    }
  
    if (fields.length) {
      let current = data.value as NonNullable<unknown>
  
      for (let fieldIndex = 0; fieldIndex <= fields.length - 2; fieldIndex++) {
        const field = fields[fieldIndex] as keyof typeof current
        if (!current[field]) {
          current[field] = typeof fields[fieldIndex] === 'number' ? [] as never : {} as never
        }
        current = current[field]
      }
  
      current[fields[fields.length - 1] as keyof typeof current] = newValue as never
    } else {
      data.value = newValue
    }
  
    if (asyncGetter()) nextTick(submit)
  }

  return {
    modelValue,
    modelValueInit,
    modelValueList,
    innerModel,
    skeleton,
    initModel,
    initFields,
    select,
    unselect,
    updateModelValue,
    updateModelValueInner,
  }
}