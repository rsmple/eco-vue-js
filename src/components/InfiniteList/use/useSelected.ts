import {computed, onBeforeUnmount, ref, unref, type Ref} from 'vue'

const isRightOrder = <Value>(value: SelectedRange<Value>): boolean => {
  return value[0].page < value[1].page || (value[0].page === value[1].page && value[0].index <= value[1].index)
}

const isSelectedBetween = <Value>(range: SelectedRange<Value>, page: number, index: number) => {
  if (range[0].page < page && range[1].page > page) return true

  if (range[0].page === range[1].page && range[0].page === page) return range[0].index < index && range[1].index > index

  return (range[0].page === page && range[0].index < index)
    || (range[1].page === page && range[1].index > index)
}

const isWrongId = <Value>(selectionPage: SelectedPage<Value>, id: Value, page: number, index: number): boolean => {
  return selectionPage.id !== id && selectionPage.page === page && selectionPage.index === index
}

const isWrongIdRange = <Value>(range: SelectedRange<Value>, id: Value, page: number, index: number): boolean => {
  return isWrongId(range[0], id, page, index) || isWrongId(range[1], id, page, index)
}

const getCount = <Value>(range: SelectedRange<Value>, pageLength: number) => {
  if (range[1].page === range[0].page) return range[1].index - range[0].index + 1

  return (range[1].page - range[0].page) * pageLength + range[1].index - range[0].index + 1
}

export const useSelected = <Value>(
  count: Ref<number | undefined>,
  pageLength: Ref<number>,
  selected: Ref<Value[]>,
  reverse: Ref<boolean>,
  selectedRange: Ref<SelectedRange<Value> | undefined>,

  select: (value: Value[]) => void,
  selectReverse: (value: Value[]) => void,
  selectRange: (value: SelectedRange<Value>) => void,
) => {
  const isSelecting = ref(false)
  const rangeCursor = ref<SelectedPage<Value> | null>(null)
  const rangeHover = ref<SelectedPage<Value> | null>(null)
  const disabled = ref(false)

  const allowSelectHover = computed(() => rangeCursor.value !== null && isSelecting.value)

  const selectionRangeCount = computed<number | undefined>(() => {
    if (!selectedRange.value) return undefined

    return getCount(selectedRange.value, unref(pageLength))
  })

  const cursorReset = () => {
    rangeCursor.value = null
    rangeHover.value = null
    isSelecting.value = false
  }

  const setSelectedRange = (value: SelectedPage<Value>) => {
    if (!rangeCursor.value) {
      rangeCursor.value = value as typeof rangeHover.value
      rangeHover.value = value as typeof rangeHover.value
      isSelecting.value = true

      select([])
      return
    }

    if (value.id === rangeCursor.value.id) {
      select([value.id])

      cursorReset()
      return
    }

    const result: SelectedRange<Value> = [value, rangeCursor.value as SelectedPage<Value>]

    if (!isRightOrder(result)) result.reverse()

    if (getCount(result, unref(pageLength)) === unref(count)) {
      cursorReset()

      selectReverse([])
      return
    }

    selectRange(result)

    cursorReset()
  }

  const resetSelectionRange = () => {
    rangeCursor.value = null
    rangeHover.value = null

    select([])
  }

  const setRangeHover = (value: SelectedPage<Value>) => {
    rangeHover.value = value as typeof rangeHover.value
  }

  const getIsSelected = (id: Value) => {
    if (selectedRange.value) {
      return selectedRange.value[0].id === id || selectedRange.value[1].id === id
    }

    if (rangeCursor.value && rangeHover.value) {
      return rangeCursor.value.id === id || rangeHover.value.id === id
    }

    return reverse.value ? !selected.value.includes(id) : selected.value.includes(id)
  }

  const getIsSelectedBetween = (id: Value, page: number, index: number) => {
    let is = false

    if (selectedRange.value) {
      is = isSelectedBetween(selectedRange.value, page, index)

      if (!is && isWrongIdRange(selectedRange.value, id, page, index)) resetSelectionRange()
    }

    if (rangeCursor.value && rangeHover.value) {
      const range = [rangeCursor.value, rangeHover.value] as SelectedRange<Value>

      if (!isRightOrder(range)) range.reverse()

      is = isSelectedBetween(range, page, index)

      if (!is && isWrongIdRange(range, id, page, index)) resetSelectionRange()
    }

    return is
  }

  const setSelectedCursor = (value: SelectedPage<Value> | null) => {
    rangeCursor.value = value as typeof rangeCursor.value
  }

  const toggleSelected = (id: Value, value: boolean): void => {
    if (disabled.value) return

    if (reverse.value && count?.value === selected.value.length + 1) {
      select([])
      cursorReset()

      return
    }

    const newSelected = selected.value.slice()

    const index = newSelected.indexOf(id)

    if (index !== -1 && !value) {
      newSelected.splice(index, 1)
    } else if (value) {
      newSelected.push(id)
    }

    if (reverse.value) {
      if ((count?.value !== undefined && count.value <= newSelected.length)) {
        if (newSelected.length === 0) selectReverse([])
        else select([])

        cursorReset()

        return
      }

      selectReverse(newSelected)
    } else {
      select(newSelected)
    }
  }

  const selectedCount = computed(() => {
    if (selectedRange.value) return getCount(selectedRange.value, unref(pageLength))

    const _count = unref(count)

    return reverse.value && _count !== undefined
      ? Math.max(_count - selected.value.length, 0)
      : selected.value.length
  })

  const selectAllValue = computed<boolean | null>(() => {
    if (selectedRange.value) return null

    const _count = unref(count)

    if (_count === 0) return false

    if (reverse.value) {
      return selected.value.length === 0 ? true : null
    } else {
      return _count !== undefined && selected.value.length >= _count ? true : selected.value.length ? null : false
    }
  })

  onBeforeUnmount(() => {
    disabled.value = true
  })

  return {
    setSelectedRange,
    getIsSelected,
    getIsSelectedBetween,
    setRangeHover,
    allowSelectHover,
    selectionRangeCount,
    setSelectedCursor,
    toggleSelected,
    selectedCount,
    selectAllValue,
  }
}
