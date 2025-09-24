import {type MaybeRef, type Ref, computed, onBeforeUnmount, ref, unref, watch} from 'vue'

import {useOptionalRoute, useOptionalRouter} from '@/composables/useOptionalRouter'
import {isIdArray, isIndex} from '@/utils/utils'

const isSelectedRange = (value: unknown): value is [number, number] => {
  return Array.isArray(value) && value.length === 2 && value.every(isIndex) && value[0] <= value[1]
}

const keysLengthSelection: ObjectKeys<Selection<number>>['length'] = 3

const isSelection = (value: unknown): value is Selection<number> => {
  return value instanceof Object && Object.keys(value).length <= keysLengthSelection
    && (
      ('range' in value && isSelectedRange(value.range))
      || ('id__in' in value && isIdArray(value.id__in))
      || ('id__not_in' in value && isIdArray(value.id__not_in))
    )
}

const parseSelection = (value: Partial<Selection<number>>): Selection<number> => {
  return {
    range: isSelectedRange(value.range) ? value.range : undefined,
    id__in: isIdArray(value.id__in) ? value.id__in : undefined,
    id__not_in: isIdArray(value.id__not_in) ? value.id__not_in : undefined,
  }
}

export const getPosition = (page: number, index: number, pageLength: number): number => {
  return ((page - 1) * pageLength) + index
}

export type Selection<Value> = {
  id__in?: Value[]
  id__not_in?: Value[]
  range?: [number, number]
}

export type QueryParamsSelection = {
  slice_indexes?: [number, number]
  id__in?: number[]
  id__not_in?: number[]
}

const isEmpty = <Value>(value: Selection<Value>) => !value.id__in?.length && !value.id__not_in && !value.range

export const useSelected = <Value extends number>(count: MaybeRef<number | undefined>, disabled: Ref<boolean>) => {
  const route = useOptionalRoute()
  const router = useOptionalRouter()

  const selection = computed<Selection<Value>>(() => {
    if (!route.hash) return {}

    try {
      const parsed = JSON.parse(route.hash.substring(1))

      if (!(parsed instanceof Object)) return {}
      
      const value = parseSelection(parsed)

      if (isSelection(value)) return value as Selection<Value>
    } catch {
    }

    return {}
  })

  const resetSelection = (): void => {
    hoverValue.value = null
    preselectValue.value = null

    router.replace({query: route.query, hash: '#'})
  }

  const updateSelection = (value: Selection<Value>) => {
    if (isEmpty(value)) {
      resetSelection()

      return
    }

    router.replace({query: route.query, hash: `#${ JSON.stringify(value) }`})
  }
  
  const selectAll = () => {
    updateSelection({id__not_in: []})
  }

  const isShift = ref(false)
  const hoverValue = ref<number | null>(null)
  const preselectValue = ref<number | null>(null)
  const unmounted = ref(false)

  const allowSelectHover = computed<boolean>(() => !disabled.value && isShift.value)
  const hoverAllowed = computed<number | null>(() => allowSelectHover.value ? hoverValue.value : null)

  const upValue = computed<number | null>(() => {
    if (selection.value.range) {
      return Math.min(
        hoverAllowed.value ?? selection.value.range[0],
        preselectValue.value ?? selection.value.range[0],
      )
    } else if (hoverAllowed.value !== null && preselectValue.value !== null) {
      return Math.min(
        hoverAllowed.value,
        preselectValue.value,
      )
    }

    return null
  })

  const downValue = computed<number | null>(() => {
    if (selection.value.range) {
      if (hoverAllowed.value !== null && hoverAllowed.value < selection.value.range[0]) return selection.value.range[1]

      return Math.max(
        hoverAllowed.value ?? selection.value.range[1],
        preselectValue.value ?? selection.value.range[0],
      )
    } else if (hoverAllowed.value !== null && preselectValue.value !== null) {
      return Math.max(
        hoverAllowed.value,
        preselectValue.value,
      )
    }

    return null
  })

  const getIsSelected = (id: Value, position: number): boolean => {
    if (hoverAllowed.value === position) return true

    if (upValue.value !== null && downValue.value !== null) {
      if (upValue.value <= position && downValue.value >= position) return true

      if (allowSelectHover.value) return false
    }

    if (selection.value.id__in) {
      if (selection.value.id__in.includes(id)) return true
    }

    if (selection.value.id__not_in) {
      if (!selection.value.id__not_in.includes(id)) return true
    }

    return false
  }

  const hoverSelected = (position: number) => {
    if (unmounted.value || disabled.value || (!preselectValue.value && !selection.value.range)) return

    hoverValue.value = position
  }

  const toggleSelected = (id: Value, position: number): void => {
    if (unmounted.value || disabled.value) return

    if (upValue.value !== null && downValue.value !== null) {
      let range: [number, number] | undefined

      if (allowSelectHover.value) {
        range = [Math.min(position, upValue.value), Math.max(position, downValue.value)]

        if (preselectValue.value === null) resetIsSelecting()
        else preselectValue.value = null
      } else if (downValue.value === position && upValue.value === position) {
        return resetSelection()
      } else if (upValue.value === position) {
        range = [position + 1, downValue.value]
      } else if (downValue.value === position) {
        range = [upValue.value, position - 1]
      } else if (upValue.value - 1 === position) {
        range = [position, downValue.value]
      } else if (downValue.value + 1 === position) {
        range = [upValue.value, position]
      }

      if (range) {
        updateSelection({range})

        hoverValue.value = null
        preselectValue.value = null

        return
      }
    }

    preselectValue.value = position

    const key: keyof Selection<Value> = selection.value.id__not_in ? 'id__not_in' : 'id__in'
    const newValue = selection.value[key]?.slice() ?? []
    const index = newValue.indexOf(id)

    if (index === -1) newValue.push(id)
    else newValue.splice(index, 1)

    updateSelection({[key]: newValue})

    if (selection.value.id__in) {
      if (index === -1) preselectValue.value = position
      else if (preselectValue.value === position) preselectValue.value = null
    } else if (selection.value.id__not_in) {
      if (index !== -1) preselectValue.value = position
      else if (preselectValue.value === position) preselectValue.value = null
    }
  }

  const selectionCount = computed(() => {
    if (selection.value.range) return selection.value.range[1] - selection.value.range[0] + 1

    const _count = unref(count)

    return selection.value.id__not_in && _count !== undefined
      ? Math.max(_count - selection.value.id__not_in.length, 0)
      : selection.value.id__in?.length ?? 0
  })

  const selectAllValue = computed<boolean | null>(() => {
    if (selection.value.range) return null

    const _count = unref(count)

    if (_count === 0) return false

    if (selection.value.id__not_in) {
      return selection.value.id__not_in.length === 0 ? true : null
    } else {
      return selection.value.id__in?.length ? null : false
    }
  })

  const applySelect = (event: MouseEvent): void => {
    if (hoverValue.value === null) return

    event.stopPropagation()
    event.preventDefault()

    toggleSelected(0 as never, hoverValue.value)
  }

  const setIsSelecting = (event: KeyboardEvent) => {
    if (!event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      resetIsSelecting()

      return
    }

    isShift.value = true

    window.addEventListener('click', applySelect)
  }

  const resetIsSelecting = () => {
    isShift.value = false

    window.removeEventListener('click', applySelect)
  }

  const getQueryParams = (): QueryParamsSelection | undefined => {
    if (isEmpty(selection.value)) return undefined

    const result: QueryParamsSelection = {}

    if (selection.value.range) result.slice_indexes = selection.value.range.slice() as [number, number]
    if (selection.value.id__not_in) result.id__not_in = selection.value.id__not_in.slice()
    if (selection.value.id__in) result.id__in = selection.value.id__in.slice()

    return result
  }

  watch(disabled, value => {
    if (value) {
      window.removeEventListener('keydown', setIsSelecting)
      window.removeEventListener('keyup', resetIsSelecting)
      window.removeEventListener('click', applySelect)
    } else {
      window.addEventListener('keydown', setIsSelecting)
      window.addEventListener('keyup', resetIsSelecting)
    }
  }, {immediate: true})

  onBeforeUnmount(() => {
    unmounted.value = true

    window.removeEventListener('keydown', setIsSelecting)
    window.removeEventListener('keyup', resetIsSelecting)
    window.removeEventListener('click', applySelect)
  })

  return {
    allowSelectHover,
    selectionCount,
    selectAllValue,
    getIsSelected,
    hoverSelected,
    toggleSelected,
    selectAll,
    resetSelection,
    getQueryParams,
  }
}
