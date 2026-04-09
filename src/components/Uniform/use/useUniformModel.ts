import {type Ref, computed, nextTick, ref, useId, watch} from 'vue'

import {Modal} from '@/utils/Modal'

const copyItem = <Value>(value: Value): Value => Array.isArray(value)
  ? value.map(copyItem) as Value
  : value instanceof Object
    ? Object.keys(value).reduce<Value>((result, key) => {
      result[key as keyof Value] = copyItem(value[key as keyof Value])
      return result
    }, {} as Value)
    : value

export const useUniformModel = <ParentModel, Field extends keyof NonNullable<ParentModel>, InnerModel, QueryParams, ResultModel>(
  parentModel: Ref<ParentModel>,
  parentModelInit: Ref<ParentModel>,
  field: Ref<Field | undefined>,
  useQueryFn: UseQueryWithParams<InnerModel, QueryParams> | undefined,
  queryParams: Ref<QueryParams | undefined>,
  initFn: ((value: InnerModel) => ResultModel) | undefined,
  confimGetter: ((payload: ResultModel, data: ParentModel) => ConfirmProps | Promise<ConfirmProps | undefined> | undefined) | undefined,
  asyncGetter: () => boolean,
  emitModelValue: (value: ResultModel, fields: (string | number)[]) => void,
  submit: () => void,
  emitInitModel: () => void,
  validateOnUpdate: ((newValue: ResultModel) => void) | undefined,
) => {
  const query = parentModel.value === undefined && useQueryFn
    ? queryParams.value !== undefined
      ? (useQueryFn as UseQueryWithParams<InnerModel, QueryParams>)(queryParams as Ref<QueryParams>)
      : (useQueryFn as UseQueryEmpty<InnerModel>)()
    : undefined

  const innerModel = query
    ? computed<InnerModel>(() => query.data.value as InnerModel)
    : computed<InnerModel>(() => field.value !== undefined ? parentModel.value?.[field.value] as InnerModel : parentModel.value as unknown as InnerModel)

  const skeleton = query ? computed(() => !query.data.value) : undefined
  const data = initFn || query ? ref<ResultModel>((initFn ?? copyItem)((innerModel.value ?? {}) as ResultModel & InnerModel)) : undefined
  const modelValueInitRef = initFn || query ? ref<ResultModel>((initFn ?? copyItem)((innerModel.value ?? {}) as ResultModel & InnerModel)) : undefined
  const modelValueInit = modelValueInitRef ?? (field.value !== undefined ? computed(() => parentModelInit.value?.[field.value as keyof ParentModel]) : parentModelInit)
  const modelValue: Ref<ResultModel> = data ?? innerModel as unknown as Ref<ResultModel>

  if (data && modelValueInitRef) {
    watch(innerModel, value => {
      data.value = (initFn ?? copyItem)(value ?? {} as InnerModel)
      modelValueInitRef.value = (initFn ?? copyItem)(value ?? {} as InnerModel)
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
      } else {
        modelValueInitRef.value = copyItem(data.value)
      }
    } else {
      emitInitModel()
    }
  }
  
  const emitValue = (value: ResultModel) => {
    validateOnUpdate?.(value)

    if (data) data.value = value
    else emitModelValue(value, field.value !== undefined ? [field.value as string | number] : [])
  
    if (asyncGetter() && data) nextTick(submit)
  }
  
  let closeModal: (() => void) | null = null
  
  const showModal = async (value: ResultModel) => {
    closeModal?.()
  
    let confirmProps = confimGetter?.(value, parentModel.value)
  
    if (confirmProps instanceof Promise) {
      confirmProps = await confirmProps
    }

    if (!confirmProps) return emitValue(value)
  
    closeModal = Modal.addConfirm({
      ...confirmProps,
      onAccept: () => emitValue(value),
    }, () => closeModal = null)
  }

  const select = (newValue: ResultModel extends unknown[] ? ResultModel[number] : never): void => {
    if (field.value === undefined) return

    const newList = [...(modelValue.value as unknown[]) ?? [], newValue] as ResultModel

    showModal(newList)
  }

  const unselect = (newValue: ResultModel extends unknown[] ? ResultModel[number] : never): void => {
    if (field.value === undefined) return

    const newList = (modelValue.value as unknown[])?.slice() ?? []
    const index = newList.indexOf(newValue)
    if (index !== -1) newList.splice(index, 1)
  
    showModal(newList as ResultModel)
  }
  
  const updateModelValue = (newValue: ResultModel | undefined): void => {
    showModal(newValue!)
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
    select,
    unselect,
    updateModelValue,
    updateModelValueInner,
  }
}