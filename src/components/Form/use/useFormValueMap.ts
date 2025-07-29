import {type InjectionKey, type Ref, inject, isRef, onBeforeMount, provide, ref, watch} from 'vue'

export const useFormValueMap = <Value, ValueGetter extends Ref<Value> | ((map: Ref<Record<string, Value>>) => Value) | ((map: Ref<Record<string, Value>>) => Ref<Value>)>(
  injectionKey: InjectionKey<(value: Value, key: string) => void>,
  name: Ref<string | undefined>,
  valueGetter: ValueGetter,
  immediate = true,
): {
  unlistener(key: string): void
  map: Ref<Record<string, Value>>
  value: ValueGetter extends () => unknown ? ReturnType<ValueGetter> : Ref<Value>
} => {
  const map = ref<Record<string, Value>>({})

  const updater = (value: Value, key: string): void => {
    if (value === null || value === undefined) unlistener(key)
    else map.value[key] = value

    if (!name.value) updaterInjected?.(value, key)
  }

  const unlistener = (key: string) => {
    if (key in map.value) delete map.value[key]
  }

  provide(injectionKey, updater)

  const updaterInjected = inject(injectionKey, undefined)

  const value = isRef(valueGetter) ? valueGetter : valueGetter(map)

  if (isRef(value)) {
    watch(value, value => {
      if (name.value) updaterInjected?.(value as Value, name.value)
    }, {immediate})
  } else {
    onBeforeMount(() => {
      if (name.value) updaterInjected?.(value, name.value)
    })
  }

  return {
    unlistener,
    map,
    value: value as ValueGetter extends () => unknown ? ReturnType<ValueGetter> : Ref<Value>,
  }
}
