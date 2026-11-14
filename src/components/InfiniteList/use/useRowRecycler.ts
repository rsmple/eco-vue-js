import type {PageSource} from '../models/pageSource'
import type {InfiniteListItemScope} from '../types'

import {type Ref, computed, onBeforeUnmount, onMounted, shallowReactive, shallowRef, toRaw, watch} from 'vue'

import {getPosition} from '@/utils/useSelected'

import {INFINITE_LIST_UNMEASURED_ATTRIBUTE, getGridColumnCount, getIsDocumentScroll} from '../models/utils'

type EntryKind = 'skeleton' | 'data' | 'state' | 'group'
type RowKind = 'skeleton' | 'data'
type MeasuredKind = RowKind | 'group'

const ROW_KINDS = ['skeleton', 'data'] as const

export type RecycledScope<Data, Model> = Omit<InfiniteListItemScope<Data, Model>, 'resetting'>

/** What the heading of a group gets: the group's first item, the item before it, and its place in the list. */
export interface GroupScope<Data> {
  item: Data
  previous: Data | undefined
  skeleton: boolean
  page: number
  index: number
  position: number
}

/**
 * The box of a group, from its heading to its last item, which the heading sticks in: a sticky box never leaves its
 * parent, so in the row of the group's first item it would leave the view with that row. Before the pages load, the
 * group of the first item spans their skeletons.
 */
export interface GroupBand<Data> {
  key: string
  top: number
  height: number
  scope: GroupScope<Data>
}

/**
 * An item of the loaded pages in their order, the heading of a group before its first item, or the error or empty
 * state of a page, which the page renders itself.
 */
interface Entry<Data> {
  key: string
  kind: EntryKind
  slotId: number
  page: number
  /** In the page, -1 for a state. */
  index: number
  item: Data | undefined
  results: Data[] | undefined
  group?: GroupScope<Data>
}

/**
 * The entries in one row of the grid: as many items as it has columns, from `column` in the first row of the list, or
 * one heading or state spanning the row. Its kind is `skeleton` when every item in it is one.
 */
interface Line {
  key: string
  kind: EntryKind
  start: number
  end: number
  column: number
}

/** What a row renders. */
export interface RecycledView<Data, Model> {
  cells: RecycledScope<Data, Model>[]
  /** Columns left empty before the first cell. */
  column: number
}

/** A row kept for one kind of line: a skeleton row never shows data nor a data row only skeletons. */
export interface RecycledRow<Data, Model> {
  readonly id: number
  readonly kind: RowKind
  readonly view: RecycledView<Data, Model>
  /** The line the row shows, or showed last while it is parked off screen, so that line back in view takes it and nothing renders. */
  key: string
  parked: boolean
  /** The entries the cells were built from: the same entries and line give the same cells. */
  list: object | null
  y: number
  element: HTMLElement | null
  /** The items of the skeleton cells, the same objects for as long as the row lives, so they render nothing again when it moves. */
  placeholders: Data[]
}

/** What the resize observer measures: a row, the heading of a band, or the state of a page. */
type Measured<Data, Model> = RecycledRow<Data, Model> | {kind: 'group' | 'state', key: string}

/** Rows rendered past each end of the view, so a scroll shows rows already laid out. */
const BUFFER = 600

const PARKED_Y = -100_000

const DEFAULT_ROW_HEIGHT = 48

const DEFAULT_STATE_HEIGHT = 160

const DEFAULT_GROUP_HEIGHT = 40

/** Parked rows kept per kind beyond those in use, the rest are unmounted. */
const MAX_PARKED = 40

interface Options<Model, Data> {
  /** Read on mount: the recycler does nothing when it is off. */
  enabled: () => boolean
  pages: Ref<number[]>
  slotIds: Ref<number[]>
  sources: Map<number, PageSource<Data>>
  isRefetchingAll: Ref<boolean>
  itemsRef: Readonly<Ref<HTMLElement | null>>
  topSpacerHeight: Readonly<Ref<number>>
  pageLength: () => number
  getSkeletonLength: (pagesBefore: number) => number
  valueGetter: (data: Data) => Model
  refetchFrom: (page: number) => void
  getScrollElement: () => Element | null
  /** Whether two items are in the same group, each group then opening with a heading. */
  groupBy: () => ((a: Data, b: Data) => boolean) | undefined
  /** Whether the items fill the columns of a grid, as cards, rather than each spanning the row. */
  keepColumns: () => boolean
}

const isScopeEqual = <Data, Model>(a: RecycledScope<Data, Model> | undefined, b: RecycledScope<Data, Model>): boolean => {
  if (!a) return false

  for (const key in b) if (a[key as keyof typeof b] !== b[key as keyof typeof b]) return false

  return true
}

/**
 * Renders the items of the loaded pages that are in view: the items are
 * laid in rows of as many as the grid has columns, one in a table, each row placed by `top` at the sum of the heights
 * before it, and a row leaving the view is given to the next row of its kind entering it, so scrolling patches rows
 * instead of mounting them, and a page loading swaps skeleton rows for data rows instead of turning each row from one
 * into the other. The heights are measured as the rows render, the others guessed from them, and the list keeps the
 * item at the top of the view in place as they change, or as the columns do.
 */
export const useRowRecycler = <Model extends number | string, Data extends DefaultData>(options: Options<Model, Data>) => {
  const {pages, slotIds, sources, isRefetchingAll, itemsRef, topSpacerHeight, getScrollElement} = options

  const heightVersion = shallowRef(0)
  const heights = new Map<string, number>()

  /** Heights without the opened content of a row, for the guess, and the items in the row. */
  const guessHeights = new Map<string, {height: number, kind: MeasuredKind, items: number}>()
  const guessSums: Record<MeasuredKind, {sum: number, count: number, items: number}> = {
    skeleton: {sum: 0, count: 0, items: 0},
    data: {sum: 0, count: 0, items: 0},
    group: {sum: 0, count: 0, items: 0},
  }

  const forgetGuessHeight = (key: string) => {
    const old = guessHeights.get(key)
    if (!old) return

    const sums = guessSums[old.kind]
    sums.sum -= old.height
    sums.count--
    sums.items -= old.items
    guessHeights.delete(key)
  }

  const setGuessHeight = (key: string, kind: MeasuredKind, height: number, items: number) => {
    forgetGuessHeight(key)

    guessHeights.set(key, {height, kind, items})
    const sums = guessSums[kind]
    sums.sum += height
    sums.count++
    sums.items += items
  }

  /** Per line, or per item when `perItem`; 0 before any is measured. */
  const getAverage = (kind: MeasuredKind, perItem = false): number => {
    const sums = guessSums[kind]
    const count = perItem ? sums.items : sums.count
    return count === 0 ? 0 : sums.sum / count
  }

  const getGuess = (kind: EntryKind): number => {
    if (kind === 'state') return DEFAULT_STATE_HEIGHT
    if (kind === 'group') return getAverage('group') || DEFAULT_GROUP_HEIGHT

    return getAverage(kind) || getAverage(kind === 'data' ? 'skeleton' : 'data') || DEFAULT_ROW_HEIGHT
  }

  const groupPlaceholder = {id: 0} as unknown as Data

  const entries = computed<Entry<Data>[]>(() => {
    const list: Entry<Data>[] = []
    const groupBy = options.groupBy()
    const pageLength = options.pageLength()
    let lastData: Data | undefined

    pages.value.forEach((page, pageIndex) => {
      const slotId = slotIds.value[pageIndex]!
      const source = sources.get(slotId)

      if (source?.isState) {
        list.push({key: `state:${ page }`, kind: 'state', slotId, page, index: -1, item: undefined, results: undefined})
        return
      }

      const results = isRefetchingAll.value ? undefined : source?.results

      if (results) {
        const seen = new Set<Model>()

        results.forEach((item, index) => {
          const value = options.valueGetter(item)
          const key = seen.has(value) ? `${ page }:${ value }#${ index }` : `${ page }:${ value }`
          seen.add(value)

          if (groupBy && (lastData === undefined || !groupBy(item, lastData))) {
            const group = {item, previous: lastData, skeleton: false, page, index, position: getPosition(page, index, pageLength)}
            list.push({key: `group:${ key }`, kind: 'group', slotId, page, index, item, results, group})
          }

          lastData = item
          list.push({key, kind: 'data', slotId, page, index, item, results})
        })

        return
      }

      const length = options.getSkeletonLength(page - 1)

      if (groupBy && list.length === 0 && length !== 0) {
        const group = {item: groupPlaceholder, previous: undefined, skeleton: true, page, index: 0, position: getPosition(page, 0, pageLength)}
        list.push({key: `group:skeleton:${ page }`, kind: 'group', slotId, page, index: 0, item: undefined, results: undefined, group})
      }

      for (let index = 0; index < length; index++) {
        list.push({key: `skeleton:${ page }:${ index }`, kind: 'skeleton', slotId, page, index, item: undefined, results: undefined})
      }
    })

    return list
  })

  const rowGap = shallowRef(0)
  const columnCount = shallowRef(1)

  /** Reads the gap between the rows and the columns of the grid, which change with the width and the breakpoint. */
  const readGrid = () => {
    const itemsEl = itemsRef.value
    if (!itemsEl) return

    const style = getComputedStyle(itemsEl)

    rowGap.value = Number.parseFloat(style.rowGap) || 0
    columnCount.value = options.keepColumns() ? getGridColumnCount(style) : 1
  }

  const grid = computed(() => {
    const list = entries.value
    const columns = columnCount.value
    const pageLength = options.pageLength()
    const lines: Line[] = []
    const lineOf = new Int32Array(list.length)
    /** Indexes of the lines of group headings and of page states. */
    const groups: number[] = []
    const states: number[] = []

    let i = 0

    while (i < list.length) {
      const entry = list[i]!

      if (entry.kind === 'state' || entry.kind === 'group') {
        lineOf[i] = lines.length
        ;(entry.kind === 'group' ? groups : states).push(lines.length)
        lines.push({key: entry.key, kind: entry.kind, start: i, end: i + 1, column: 0})
        i++
        continue
      }

      // Only the first row of the list is known to start past the first column, as the items of the pages before it.
      const column = i === 0 ? getPosition(entry.page, entry.index, pageLength) % columns : 0
      let key = column ? `${ column }+` : ''
      let end = i
      let isData = false

      while (end < list.length && end - i < columns - column) {
        const item = list[end]!
        if (item.kind !== 'data' && item.kind !== 'skeleton') break
        if (item.kind === 'data') isData = true
        key += end === i ? item.key : `,${ item.key }`
        lineOf[end] = lines.length
        end++
      }

      lines.push({key, kind: isData ? 'data' : 'skeleton', start: i, end, column})
      i = end
    }

    return {lines, lineOf, groups, states}
  })

  const layout = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    heightVersion.value

    const {lines} = grid.value
    const gap = rowGap.value
    const offsets = new Float64Array(lines.length + 1)
    let y = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      offsets[i] = y
      y += (heights.get(line.key) ?? getGuess(line.kind)) + gap
    }

    // No gap after the last line.
    const total = lines.length === 0 ? 0 : y - gap
    offsets[lines.length] = total

    return {offsets, total}
  })

  /** Index of the line at `y`, the first or the last when `y` is before or after them. */
  const getLineIndexAt = (y: number): number => {
    const {offsets} = layout.value
    const length = offsets.length - 1
    let low = 0
    let high = length - 1

    while (low < high) {
      const middle = (low + high + 1) >> 1
      if (offsets[middle]! <= y) low = middle
      else high = middle - 1
    }

    return Math.max(0, Math.min(low, length - 1))
  }

  const findEntryIndex = (page: number, index: number | undefined): number => {
    const list = entries.value
    let first = -1

    for (let i = 0; i < list.length; i++) {
      const entry = list[i]!
      if (entry.page !== page || entry.kind === 'group') continue
      if (first === -1) first = i
      if (index === undefined || entry.index === index) return i
    }

    return first
  }

  /** Whether the entry shows its data and its line has its height, so scrolling to it lands where it stays. */
  const isSettled = (entryIndex: number): boolean => {
    const entry = entries.value[entryIndex]
    const {lines, lineOf} = grid.value

    return !!entry && entry.kind !== 'skeleton' && heights.has(lines[lineOf[entryIndex]!]!.key)
  }

  /** The view, from the top of the items. */
  const getViewport = (): {top: number, height: number} | null => {
    const itemsEl = itemsRef.value
    const scrollEl = getScrollElement()
    if (!itemsEl || !scrollEl) return null

    const isDocumentScroll = getIsDocumentScroll(scrollEl)
    const viewTop = isDocumentScroll ? 0 : scrollEl.getBoundingClientRect().top
    const height = isDocumentScroll ? window.innerHeight : scrollEl.clientHeight

    return {top: viewTop - itemsEl.getBoundingClientRect().top, height}
  }

  const scrollBy = (delta: number, behavior: ScrollBehavior = 'instant') => {
    const scrollEl = getScrollElement()
    if (!scrollEl) return

    if (getIsDocumentScroll(scrollEl)) window.scrollBy({top: delta, behavior})
    else scrollEl.scrollBy({top: delta, behavior})
  }

  const rows = shallowReactive<RecycledRow<Data, Model>[]>([])
  /** The same array, read without the proxy. */
  const rawRows = toRaw(rows)
  let rowIdCounter = 0

  /** Setters by slot, then by index in the page, the same function for as long as the slot lives. */
  const setters = new Map<number, Map<number, (newItem?: Data) => void>>()

  // The item is written to every cached scope of the model, so the index only serves to find which item was edited.
  const getSetter = (slotId: number, index: number) => {
    let slotSetters = setters.get(slotId)

    if (!slotSetters) {
      slotSetters = new Map()
      setters.set(slotId, slotSetters)
    }

    let setter = slotSetters.get(index)

    if (!setter) {
      setter = (newItem?: Data) => {
        const source = sources.get(slotId)
        const oldItem = source?.results?.[index]
        if (!source || oldItem === undefined) return

        if (newItem) source.setItem(newItem)
        else source.removeItem(options.valueGetter(oldItem))
      }
      slotSetters.set(index, setter)
    }

    return setter
  }

  const refetchers = new Map<number, () => void>()

  const getRefetch = (page: number) => {
    let refetch = refetchers.get(page)

    if (!refetch) {
      refetch = () => options.refetchFrom(page)
      refetchers.set(page, refetch)
    }

    return refetch
  }

  const intersectingPages = shallowRef(new Set<number>())

  const getScope = (row: RecycledRow<Data, Model>, list: Entry<Data>[], index: number, cell: number): RecycledScope<Data, Model> => {
    const entry = list[index]!
    const isData = entry.kind === 'data'
    const item = isData ? entry.item! : (row.placeholders[cell] ??= {id: -(row.id * 1000 + cell)} as unknown as Data)
    const previous = list[index - 1]?.kind === 'group' ? list[index - 2] : list[index - 1]
    const next = list[index + 1]?.kind === 'group' ? list[index + 2] : list[index + 1]

    return {
      item,
      setter: getSetter(entry.slotId, entry.index),
      refetch: getRefetch(entry.page),
      skeleton: !isData,
      previous: isData && previous?.kind === 'data' ? previous.item : undefined,
      next: isData && next?.kind === 'data' ? next.item : undefined,
      first: index === 0 || (index === 1 && list[0]!.kind === 'group'),
      last: index === list.length - 1,
      page: entry.page,
      index: entry.index,
      position: getPosition(entry.page, entry.index, options.pageLength()),
      value: options.valueGetter(item),
      results: entry.results,
      intersecting: true,
    }
  }

  const writeY = (row: RecycledRow<Data, Model>) => {
    const element = row.element
    if (!element) return

    const top = `${ row.parked ? PARKED_Y : row.y }px`
    const contentVisibility = row.parked ? 'hidden' : ''

    if (element.style.top !== top) element.style.top = top
    if (element.style.contentVisibility !== contentVisibility) element.style.contentVisibility = contentVisibility
  }

  let resizeObserver: ResizeObserver | null = null
  const measured = new Map<Element, Measured<Data, Model>>()

  const onResize = (records: ResizeObserverEntry[]) => {
    let isChanged = false

    for (const record of records) {
      const target = measured.get(record.target)
      if (!target) continue

      let height = record.borderBoxSize?.[0]?.blockSize ?? (record.target as HTMLElement).offsetHeight

      if ('view' in target) {
        if (target.parked) continue

        let unmeasured = 0
        for (const element of record.target.querySelectorAll(`[${ INFINITE_LIST_UNMEASURED_ATTRIBUTE }]`)) unmeasured = Math.max(unmeasured, element.getBoundingClientRect().height)

        setGuessHeight(target.key, target.kind, height - unmeasured, target.view.cells.length)
      } else if (target.kind === 'group') {
        // The heading's margins are its own, as they were in the grid of the items.
        const style = getComputedStyle(record.target)
        height += (Number.parseFloat(style.marginTop) || 0) + (Number.parseFloat(style.marginBottom) || 0)

        setGuessHeight(target.key, 'group', height, 1)
      }

      if (heights.get(target.key) !== height) {
        heights.set(target.key, height)
        isChanged = true
      }
    }

    if (isChanged) heightVersion.value++
  }

  /** Observed anew, which reports the height even when it is the same as the last. */
  const observe = (element: Element, target: Measured<Data, Model>) => {
    measured.set(element, target)
    resizeObserver?.unobserve(element)
    resizeObserver?.observe(element)
  }

  const unobserve = (element: Element) => {
    measured.delete(element)
    resizeObserver?.unobserve(element)
  }

  const setRowElement = (row: RecycledRow<Data, Model>, element: HTMLElement | null) => {
    if (row.element) unobserve(row.element)

    row.element = element
    if (!element) return

    writeY(row)
    observe(element, row)
  }

  const observeStates = () => {
    const list = entries.value
    const {lines, states} = grid.value
    const current = new Map<Element, string>()

    for (const index of states) {
      const entry = list[lines[index]!.start]!
      const element = sources.get(entry.slotId)?.getStateElement()
      if (element) current.set(element, entry.key)
    }

    for (const [element, target] of measured) if (target.kind === 'state' && current.get(element) !== target.key) unobserve(element)

    for (const [element, key] of current) if (!measured.has(element)) observe(element, {kind: 'state', key})
  }

  const groupElements = new Map<string, Element>()

  /** The heading of a band, measured as an entry of the layout. */
  const setGroupElement = (key: string, element: Element | null) => {
    const old = groupElements.get(key)

    if (old) {
      unobserve(old)
      groupElements.delete(key)
    }

    if (!element) return

    groupElements.set(key, element)
    observe(element, {kind: 'group', key})
  }

  const bands = shallowRef<GroupBand<Data>[]>([])

  /** The lines rendered, and the layout they were placed by. */
  let range: {start: number, end: number, layout: object | null} = {start: 0, end: 0, layout: null}

  /** The bands of the groups in the rendered range, the one the range starts in among them. */
  const assignBands = () => {
    const list = entries.value
    const {lines, groups} = grid.value
    const {offsets, total} = layout.value
    const next: GroupBand<Data>[] = []

    let i = 0
    while (i + 1 < groups.length && groups[i + 1]! <= range.start) i++

    for (; i < groups.length && groups[i]! < range.end; i++) {
      const start = groups[i]!
      const end = groups[i + 1]
      const top = offsets[start]!
      const bottom = end === undefined ? total : offsets[end]! - rowGap.value

      const entry = list[lines[start]!.start]!

      next.push({key: entry.key, top, height: Math.max(0, bottom - top), scope: entry.group!})
    }

    const old = bands.value
    const isChanged = next.length !== old.length || next.some((band, index) => {
      const oldBand = old[index]!
      return band.key !== oldBand.key || band.top !== oldBand.top || band.height !== oldBand.height || band.scope !== oldBand.scope
    })

    if (isChanged) bands.value = next
  }

  const stateOffsets = computed(() => {
    const map = new Map<number, number>()
    const list = entries.value
    const {lines, states} = grid.value
    const {offsets} = layout.value

    for (const index of states) map.set(list[lines[index]!.start]!.slotId, offsets[index]!)

    return map
  })

  const createRow = (kind: RowKind): RecycledRow<Data, Model> => {
    const row: RecycledRow<Data, Model> = {
      id: ++rowIdCounter,
      kind,
      view: shallowReactive({cells: [], column: 0}),
      key: '',
      parked: true,
      list: null,
      y: 0,
      element: null,
      placeholders: [],
    }

    rows.push(row)
    return row
  }

  /** Places the row at `y` showing the line, building its cells only when the line or the entries changed. */
  const show = (row: RecycledRow<Data, Model>, list: Entry<Data>[], line: Line, y: number) => {
    if (row.list !== list || row.key !== line.key) {
      const {view} = row
      const oldCells = view.cells
      const cells: RecycledScope<Data, Model>[] = []
      let isSame = view.column === line.column && oldCells.length === line.end - line.start

      for (let i = line.start; i < line.end; i++) {
        const old = oldCells[i - line.start]
        const scope = getScope(row, list, i, i - line.start)
        const cell = isScopeEqual(old, scope) ? old! : scope

        if (cell !== old) isSame = false
        cells.push(cell)
      }

      if (!isSame) {
        view.cells = cells
        view.column = line.column
      }

      row.list = list
      row.key = line.key
    }

    row.parked = false
    row.y = y
    writeY(row)
  }

  const assign = () => {
    const list = entries.value
    const {lines} = grid.value
    const {offsets} = layout.value

    const wanted = new Map<string, number>()
    for (let i = range.start; i < range.end; i++) {
      const line = lines[i]!
      if (line.kind === 'data' || line.kind === 'skeleton') wanted.set(line.key, i)
    }

    const free: Record<RowKind, RecycledRow<Data, Model>[]> = {skeleton: [], data: []}
    const inUse: Record<RowKind, number> = {skeleton: 0, data: 0}

    // A row still showing a wanted line takes it, parked or not, so nothing renders.
    for (const row of rawRows) {
      const index = wanted.get(row.key)

      if (index === undefined) {
        free[row.kind].push(row)
        continue
      }

      wanted.delete(row.key)
      show(row, list, lines[index]!, offsets[index]!)
      inUse[row.kind]++
    }

    for (const index of wanted.values()) {
      const line = lines[index]!
      const kind = line.kind as RowKind
      const row = free[kind].pop() ?? createRow(kind)

      show(row, list, line, offsets[index]!)
      inUse[kind]++
      if (row.element) observe(row.element, row)
    }

    let dropped: Set<RecycledRow<Data, Model>> | undefined

    for (const kind of ROW_KINDS) {
      const parked = free[kind]

      for (const row of parked) {
        if (row.parked) continue
        row.parked = true
        writeY(row)
      }

      const limit = Math.max(MAX_PARKED, inUse[kind])
      for (let i = limit; i < parked.length; i++) (dropped ??= new Set()).add(parked[i]!)
    }

    if (dropped) rows.splice(0, rows.length, ...rawRows.filter(row => !dropped.has(row)))
  }

  /** The entry at the top of the view and where it was, to keep it in place as the heights or the pages change. */
  let anchor: {page: number, index: number, top: number} | null = null

  const keepAnchor = () => {
    if (!anchor) return

    const index = findEntryIndex(anchor.page, anchor.index)
    if (index === -1 || entries.value[index]!.index !== anchor.index) {
      anchor = null
      return
    }

    const top = topSpacerHeight.value + layout.value.offsets[grid.value.lineOf[index]!]!
    const delta = top - anchor.top

    anchor.top = top
    if (delta !== 0) scrollBy(delta)
  }

  const setAnchor = (viewTop: number) => {
    const {lines} = grid.value
    if (lines.length === 0 || viewTop < 0) {
      anchor = null
      return
    }

    let index = getLineIndexAt(viewTop)
    if (lines[index]!.kind === 'group' && index + 1 < lines.length) index++

    const entry = entries.value[lines[index]!.start]!
    anchor = {page: entry.page, index: entry.index, top: topSpacerHeight.value + layout.value.offsets[index]!}
  }

  /** The lines in view the intersecting pages were read from. */
  let intersectingLines: {first: number, last: number, grid: object | null} = {first: -1, last: -1, grid: null}

  const updateIntersecting = (viewport: {top: number, height: number}) => {
    const currentGrid = grid.value
    const {lines} = currentGrid
    const isInView = lines.length !== 0 && viewport.top + viewport.height > 0 && viewport.top < layout.value.total
    const first = isInView ? getLineIndexAt(viewport.top) : -1
    const last = isInView ? getLineIndexAt(viewport.top + viewport.height) : -1

    if (first === intersectingLines.first && last === intersectingLines.last && currentGrid === intersectingLines.grid) return
    intersectingLines = {first, last, grid: currentGrid}

    const list = entries.value
    const set = new Set<number>()

    for (let i = Math.max(first, 0); i <= last; i++) {
      const line = lines[i]!
      for (let j = line.start; j < line.end; j++) set.add(list[j]!.page)
    }

    const old = intersectingPages.value
    let isChanged = set.size !== old.size
    if (!isChanged) for (const page of set) if (!old.has(page)) isChanged = true

    if (isChanged) intersectingPages.value = set
  }

  let pendingScroll: {page: number, index: number | undefined} | null = null

  const scrollToEntry = (entryIndex: number, behavior: ScrollBehavior) => {
    const viewport = getViewport()
    if (entryIndex === -1 || !viewport) return

    const {offsets} = layout.value
    const lineIndex = grid.value.lineOf[entryIndex]!
    const center = (offsets[lineIndex]! + offsets[lineIndex + 1]!) / 2

    scrollBy(center - viewport.top - viewport.height / 2, behavior)
  }

  let isMounted = false

  /**
   * Keeps the anchor in place, then renders the rows in view. Every scroll frame and whenever the layout changes; a
   * scroll frame that brings no line into the rendered range only moves the anchor.
   */
  const update = (fromScroll = false) => {
    if (!isMounted) return

    if (!fromScroll) keepAnchor()

    const viewport = getViewport()
    if (!viewport) return

    const {lines} = grid.value
    const start = lines.length === 0 ? 0 : getLineIndexAt(viewport.top - BUFFER)
    const end = lines.length === 0 ? 0 : getLineIndexAt(viewport.top + viewport.height + BUFFER) + 1

    setAnchor(viewport.top)
    updateIntersecting(viewport)

    if (start !== range.start || end !== range.end || layout.value !== range.layout) {
      range = {start, end, layout: layout.value}
      assign()
      assignBands()
    }

    // A state renders as its page's entries change, which changes the layout too.
    if (!fromScroll) observeStates()

    if (pendingScroll) {
      const entryIndex = findEntryIndex(pendingScroll.page, pendingScroll.index)

      if (isSettled(entryIndex)) {
        scrollToEntry(entryIndex, 'instant')
        pendingScroll = null
      }
    }
  }

  /** Centers the item, again once the page's data replaces the skeletons and the item has its height. */
  const scrollTo = (page: number, index: number | undefined, behavior: ScrollBehavior = 'smooth') => {
    const entryIndex = findEntryIndex(page, index)

    scrollToEntry(entryIndex, behavior)
    pendingScroll = isSettled(entryIndex) ? null : {page, index}
  }

  const onWindowResize = () => update()

  let gridObserver: ResizeObserver | null = null

  onMounted(() => {
    if (!options.enabled()) return

    isMounted = true

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(onResize)

      let itemsWidth = 0

      // The height of the items is the list's own, so only a new width can change the columns.
      gridObserver = new ResizeObserver(records => {
        const width = records[0]?.contentRect.width ?? 0
        if (width === itemsWidth) return

        itemsWidth = width
        readGrid()
      })
    }

    // Not in setup: the spacers are sized by the average this returns.
    watch([layout, topSpacerHeight], () => update(), {flush: 'post'})
    watch(options.keepColumns, readGrid, {flush: 'post'})

    /** Forgets what is kept for slots, pages and lines no longer loaded, as items of other pages or params take their keys. */
    watch(grid, ({lines}) => {
      for (const slotId of setters.keys()) if (!slotIds.value.includes(slotId)) setters.delete(slotId)
      for (const page of refetchers.keys()) if (!pages.value.includes(page)) refetchers.delete(page)

      if (heights.size < lines.length * 4) return

      const keys = new Set(lines.map(line => line.key))

      for (const key of heights.keys()) if (!keys.has(key)) heights.delete(key)
      for (const key of guessHeights.keys()) if (!keys.has(key)) forgetGuessHeight(key)
    })

    readGrid()
    if (itemsRef.value) gridObserver?.observe(itemsRef.value)

    window.addEventListener('resize', onWindowResize, {passive: true})

    update()
  })

  onBeforeUnmount(() => {
    if (!isMounted) return

    isMounted = false
    window.removeEventListener('resize', onWindowResize)
    resizeObserver?.disconnect()
    gridObserver?.disconnect()
  })

  /**
   * Per item, without opened rows, for the space of the pages not loaded; 0 before any row is measured. In a grid it
   * is the row's height shared by its items.
   */
  const averageItemHeight = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    heightVersion.value

    return getAverage('data', true) || getAverage('skeleton', true)
  })

  return {
    rows,
    bands,
    totalHeight: computed(() => layout.value.total),
    stateOffsets,
    intersectingPages,
    averageItemHeight,
    setRowElement,
    setGroupElement,
    update,
    scrollTo,
  }
}

export type RowRecycler<Model extends number | string, Data extends DefaultData> = ReturnType<typeof useRowRecycler<Model, Data>>
