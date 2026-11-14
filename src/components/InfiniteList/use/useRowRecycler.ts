import type {PageSource} from '../models/pageSource'
import type {InfiniteListItemScope} from '../types'

import {type Ref, computed, onBeforeUnmount, onMounted, shallowReactive, shallowRef, watch} from 'vue'

import {getPosition} from '@/utils/useSelected'

import {INFINITE_LIST_UNMEASURED_ATTRIBUTE} from '../models/utils'

type EntryKind = 'skeleton' | 'data' | 'state' | 'group'
type RowKind = 'skeleton' | 'data'
type MeasuredKind = RowKind | 'group'

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

/** A row kept for one kind of item: a skeleton row never shows data nor a data row a skeleton. */
export interface RecycledView<Data, Model> {
  readonly id: number
  readonly kind: RowKind
  /** The entry the row shows, `null` while it is parked off screen keeping what it showed last. */
  key: string | null
  scope: RecycledScope<Data, Model>
}

/** Rows rendered past each end of the view, so a scroll shows rows already laid out. */
const BUFFER = 600

const PARKED_Y = -100_000

const DEFAULT_ROW_HEIGHT = 48

const DEFAULT_STATE_HEIGHT = 160

const DEFAULT_GROUP_HEIGHT = 40

/** Parked rows kept per kind beyond those in use, the rest are unmounted. */
const MAX_PARKED = 40

interface Options<Model, Data> {
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
}

const getIsDocumentScroll = (element: Element): boolean => element === document.scrollingElement || element === document.body || element === document.documentElement

const isScopeEqual = <Data, Model>(a: RecycledScope<Data, Model> | undefined, b: RecycledScope<Data, Model>): boolean => {
  if (!a) return false

  for (const key in b) if (a[key as keyof typeof b] !== b[key as keyof typeof b]) return false

  return true
}

/**
 * Renders the items of the loaded pages that are in view: each row is
 * placed by `top` at the sum of the heights before it, and a row leaving the view is given to the next item of its
 * kind entering it, so scrolling patches rows instead of mounting them, and a page loading swaps skeleton rows for data
 * rows instead of turning each row from one into the other. The heights are measured as the rows render, the others
 * guessed from them, and the list keeps the item at the top of the view in place as they change.
 */
export const useRowRecycler = <Model extends number | string, Data extends DefaultData>(options: Options<Model, Data>) => {
  const {pages, slotIds, sources, isRefetchingAll, itemsRef, topSpacerHeight} = options

  const heightVersion = shallowRef(0)
  const heights = new Map<string, number>()

  /** Heights without the opened content of a row, for the guess. */
  const guessHeights = new Map<string, number>()
  const guessSums: Record<MeasuredKind, {sum: number, count: number}> = {skeleton: {sum: 0, count: 0}, data: {sum: 0, count: 0}, group: {sum: 0, count: 0}}

  const setGuessHeight = (key: string, kind: MeasuredKind, height: number) => {
    const old = guessHeights.get(key)
    const sums = guessSums[kind]

    if (old !== undefined) {
      sums.sum -= old
      sums.count--
    }

    guessHeights.set(key, height)
    sums.sum += height
    sums.count++
  }

  const getAverage = (kind: MeasuredKind): number => {
    const sums = guessSums[kind]
    return sums.count === 0 ? 0 : sums.sum / sums.count
  }

  const getGuess = (kind: EntryKind): number => {
    if (kind === 'state') return DEFAULT_STATE_HEIGHT
    if (kind === 'group') return getAverage('group') || DEFAULT_GROUP_HEIGHT

    const other: RowKind = kind === 'data' ? 'skeleton' : 'data'

    return getAverage(kind) || getAverage(other) || DEFAULT_ROW_HEIGHT
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

  const layout = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    heightVersion.value

    const list = entries.value
    const offsets = new Float64Array(list.length + 1)
    let y = 0

    for (let i = 0; i < list.length; i++) {
      const entry = list[i]!
      offsets[i] = y
      y += (heights.get(entry.key) ?? getGuess(entry.kind)) + (i === list.length - 1 ? 0 : rowGap.value)
    }

    offsets[list.length] = y

    return {offsets, total: y}
  })

  /** Index of the entry at `y`, the first or the last when `y` is before or after them. */
  const getEntryIndexAt = (y: number): number => {
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

  const getScrollElement = (): Element | null => options.getScrollElement()

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

  const views = shallowReactive<RecycledView<Data, Model>[]>([])
  let viewIdCounter = 0

  const rowElements = new Map<number, HTMLElement>()
  const viewsByElement = new Map<Element, RecycledView<Data, Model>>()
  const rowY = new Map<number, number>()

  /** The entry each row showed last, so an entry back in view takes the row that still shows it and nothing renders. */
  const lastKeys = new Map<number, string>()

  const placeholders = new Map<number, Data>()

  /** The item of a skeleton row, the same object for as long as the row lives, so it renders nothing again when it moves. */
  const getPlaceholder = (viewId: number): Data => {
    let placeholder = placeholders.get(viewId)

    if (!placeholder) {
      placeholder = {id: -viewId} as unknown as Data
      placeholders.set(viewId, placeholder)
    }

    return placeholder
  }

  const setters = new Map<string, (newItem?: Data) => void>()

  // The item is written to every cached scope of the model, so the index only serves to find which item was edited.
  const getSetter = (slotId: number, index: number) => {
    const key = `${ slotId }:${ index }`
    let setter = setters.get(key)

    if (!setter) {
      setter = (newItem?: Data) => {
        const source = sources.get(slotId)
        const oldItem = source?.results?.[index]
        if (!source || oldItem === undefined) return

        if (newItem) source.setItem(newItem)
        else source.removeItem(options.valueGetter(oldItem))
      }
      setters.set(key, setter)
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

  const getScope = (view: RecycledView<Data, Model>, list: Entry<Data>[], index: number): RecycledScope<Data, Model> => {
    const entry = list[index]!
    const isData = entry.kind === 'data'
    const item = isData ? entry.item! : getPlaceholder(view.id)
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

  const writeY = (view: RecycledView<Data, Model>) => {
    const element = rowElements.get(view.id)
    const y = rowY.get(view.id)
    if (!element || y === undefined) return

    const parked = view.key === null
    const top = `${ parked ? PARKED_Y : y }px`
    const contentVisibility = parked ? 'hidden' : ''

    if (element.style.top !== top) element.style.top = top
    if (element.style.contentVisibility !== contentVisibility) element.style.contentVisibility = contentVisibility
  }

  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(records => {
    let isChanged = false

    for (const record of records) {
      const view = viewsByElement.get(record.target)
      const groupKey = view ? undefined : groupKeysByElement.get(record.target)
      const key = view ? view.key : groupKey ?? stateKeysByElement.get(record.target)
      if (key === null || key === undefined) continue

      let height = record.borderBoxSize?.[0]?.blockSize ?? (record.target as HTMLElement).offsetHeight

      // The heading's margins are its own, as they were in the grid of the items.
      if (groupKey !== undefined) {
        const style = getComputedStyle(record.target)
        height += (Number.parseFloat(style.marginTop) || 0) + (Number.parseFloat(style.marginBottom) || 0)
      }

      if (heights.get(key) !== height) {
        heights.set(key, height)
        isChanged = true
      }

      if (groupKey !== undefined) setGuessHeight(key, 'group', height)

      if (!view) continue

      let unmeasured = 0
      for (const element of record.target.querySelectorAll(`[${ INFINITE_LIST_UNMEASURED_ATTRIBUTE }]`)) unmeasured += element.getBoundingClientRect().height

      setGuessHeight(key, view.kind, height - unmeasured)
    }

    if (isChanged) heightVersion.value++
  })

  /** Observed anew when the row shows another item, which reports its height even when it is the same as the last. */
  const measure = (view: RecycledView<Data, Model>) => {
    const element = rowElements.get(view.id)
    if (!element || !resizeObserver) return

    resizeObserver.unobserve(element)
    resizeObserver.observe(element)
  }

  const setRowElement = (view: RecycledView<Data, Model>, element: HTMLElement | null) => {
    const old = rowElements.get(view.id)

    if (old) {
      resizeObserver?.unobserve(old)
      viewsByElement.delete(old)
      rowElements.delete(view.id)
    }

    if (!element) return

    rowElements.set(view.id, element)
    viewsByElement.set(element, view)
    writeY(view)
    resizeObserver?.observe(element)
  }

  const stateKeysByElement = new Map<Element, string>()

  const observeStates = () => {
    const current = new Map<Element, string>()

    for (const entry of entries.value) {
      if (entry.kind !== 'state') continue

      const element = sources.get(entry.slotId)?.getStateElement()
      if (element) current.set(element, entry.key)
    }

    for (const element of stateKeysByElement.keys()) {
      if (current.has(element)) continue

      resizeObserver?.unobserve(element)
      stateKeysByElement.delete(element)
    }

    for (const [element, key] of current) {
      if (stateKeysByElement.get(element) === key) continue

      stateKeysByElement.set(element, key)
      resizeObserver?.unobserve(element)
      resizeObserver?.observe(element)
    }
  }

  const groupKeysByElement = new Map<Element, string>()
  const groupElements = new Map<string, Element>()

  /** The heading of a band, measured as an entry of the layout. */
  const setGroupElement = (key: string, element: Element | null) => {
    const old = groupElements.get(key)

    if (old) {
      resizeObserver?.unobserve(old)
      groupKeysByElement.delete(old)
      groupElements.delete(key)
    }

    if (!element) return

    groupElements.set(key, element)
    groupKeysByElement.set(element, key)
    resizeObserver?.observe(element)
  }

  const bands = shallowRef<GroupBand<Data>[]>([])

  const groupStarts = computed(() => {
    const starts: number[] = []
    entries.value.forEach((entry, index) => {
      if (entry.kind === 'group') starts.push(index)
    })
    return starts
  })

  /** The bands of the groups in the rendered range, the one the range starts in among them. */
  const assignBands = () => {
    const list = entries.value
    const {offsets, total} = layout.value
    const starts = groupStarts.value
    const next: GroupBand<Data>[] = []

    let i = 0
    while (i + 1 < starts.length && starts[i + 1]! <= range.start) i++

    for (; i < starts.length && starts[i]! < range.end; i++) {
      const start = starts[i]!
      const end = starts[i + 1]
      const top = offsets[start]!
      const bottom = end === undefined ? total : offsets[end]! - rowGap.value

      next.push({key: list[start]!.key, top, height: Math.max(0, bottom - top), scope: list[start]!.group!})
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

    list.forEach((entry, index) => {
      if (entry.kind === 'state') map.set(entry.slotId, layout.value.offsets[index]!)
    })

    return map
  })

  const createView = (kind: RowKind): RecycledView<Data, Model> => {
    const view = shallowReactive({id: ++viewIdCounter, kind, key: null, scope: undefined}) as unknown as RecycledView<Data, Model>
    views.push(view)
    return view
  }

  let range = {start: 0, end: 0}

  const assign = () => {
    const list = entries.value
    const {offsets} = layout.value

    const wanted = new Map<string, number>()
    for (let i = range.start; i < range.end; i++) {
      const entry = list[i]
      if (entry && (entry.kind === 'data' || entry.kind === 'skeleton')) wanted.set(entry.key, i)
    }

    const free: Record<RowKind, RecycledView<Data, Model>[]> = {skeleton: [], data: []}
    const inUse: Record<RowKind, number> = {skeleton: 0, data: 0}

    const show = (view: RecycledView<Data, Model>, index: number) => {
      const scope = getScope(view, list, index)
      if (!isScopeEqual(view.scope, scope)) view.scope = scope

      rowY.set(view.id, offsets[index]!)
      writeY(view)
      inUse[view.kind]++
    }

    for (const view of views) {
      const index = view.key === null ? undefined : wanted.get(view.key)

      if (index === undefined) {
        free[view.kind].push(view)
        continue
      }

      wanted.delete(view.key!)
      show(view, index)
    }

    const freeByLastKey = new Map<string, RecycledView<Data, Model>>()
    for (const kind of ['skeleton', 'data'] as const) {
      for (const view of free[kind]) {
        const lastKey = lastKeys.get(view.id)
        if (lastKey !== undefined) freeByLastKey.set(lastKey, view)
      }
    }

    const taken = new Set<RecycledView<Data, Model>>()

    for (const [key, index] of wanted) {
      const view = freeByLastKey.get(key)
      if (!view || view.kind !== list[index]!.kind) continue

      taken.add(view)
      wanted.delete(key)
      view.key = key
      show(view, index)
    }

    for (const kind of ['skeleton', 'data'] as const) free[kind] = free[kind].filter(view => !taken.has(view))

    for (const [key, index] of wanted) {
      const kind = list[index]!.kind as RowKind
      const view = free[kind].pop() ?? createView(kind)

      view.key = key
      lastKeys.set(view.id, key)
      show(view, index)
      measure(view)
    }

    for (const kind of ['skeleton', 'data'] as const) {
      const parked = free[kind]

      for (const view of parked) {
        if (view.key === null) continue
        view.key = null
        writeY(view)
      }

      if (parked.length <= Math.max(MAX_PARKED, inUse[kind])) continue

      const dropped = new Set(parked.slice(Math.max(MAX_PARKED, inUse[kind])))

      for (let i = views.length - 1; i >= 0; i--) {
        const view = views[i]!
        if (!dropped.has(view)) continue

        views.splice(i, 1)
        placeholders.delete(view.id)
        lastKeys.delete(view.id)
        rowY.delete(view.id)
      }
    }
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

    const top = topSpacerHeight.value + layout.value.offsets[index]!
    const delta = top - anchor.top

    anchor.top = top
    if (delta !== 0) scrollBy(delta)
  }

  const setAnchor = (viewTop: number) => {
    const list = entries.value
    if (list.length === 0 || viewTop < 0) {
      anchor = null
      return
    }

    let index = getEntryIndexAt(viewTop)
    if (list[index]!.kind === 'group' && index + 1 < list.length) index++

    const entry = list[index]!
    anchor = {page: entry.page, index: entry.index, top: topSpacerHeight.value + layout.value.offsets[index]!}
  }

  const updateIntersecting = (viewport: {top: number, height: number}) => {
    const list = entries.value
    const set = new Set<number>()

    if (list.length !== 0 && viewport.top + viewport.height > 0 && viewport.top < layout.value.total) {
      const last = getEntryIndexAt(viewport.top + viewport.height)
      for (let i = getEntryIndexAt(viewport.top); i <= last; i++) set.add(list[i]!.page)
    }

    const old = intersectingPages.value
    if (set.size !== old.size || [...set].some(page => !old.has(page))) intersectingPages.value = set
  }

  let pendingScroll: {page: number, index: number | undefined} | null = null

  const scrollToEntry = (page: number, index: number | undefined, behavior: ScrollBehavior): boolean => {
    const entryIndex = findEntryIndex(page, index)
    const viewport = getViewport()
    if (entryIndex === -1 || !viewport) return false

    const {offsets} = layout.value
    const center = (offsets[entryIndex]! + offsets[entryIndex + 1]!) / 2

    scrollBy(center - viewport.top - viewport.height / 2, behavior)

    return true
  }

  let isMounted = false

  /** Keeps the anchor in place, then renders the rows in view. Every scroll frame and whenever the layout changes. */
  const update = (fromScroll = false) => {
    if (!isMounted) return

    if (!fromScroll) keepAnchor()

    const viewport = getViewport()
    if (!viewport) return

    const list = entries.value
    const start = list.length === 0 ? 0 : getEntryIndexAt(viewport.top - BUFFER)
    const end = list.length === 0 ? 0 : getEntryIndexAt(viewport.top + viewport.height + BUFFER) + 1

    range = {start, end}

    setAnchor(viewport.top)
    updateIntersecting(viewport)
    assign()
    assignBands()
    observeStates()

    if (pendingScroll) {
      const entryIndex = findEntryIndex(pendingScroll.page, pendingScroll.index)
      const entry = entries.value[entryIndex]

      if (entry && entry.kind !== 'skeleton' && heights.has(entry.key)) {
        scrollToEntry(pendingScroll.page, pendingScroll.index, 'instant')
        pendingScroll = null
      }
    }
  }

  /** Centers the item, again once the page's data replaces the skeletons and the item has its height. */
  const scrollTo = (page: number, index: number | undefined, behavior: ScrollBehavior = 'smooth') => {
    scrollToEntry(page, index, behavior)

    const entry = entries.value[findEntryIndex(page, index)]
    pendingScroll = entry && entry.kind !== 'skeleton' && heights.has(entry.key) ? null : {page, index}
  }

  const onWindowResize = () => update()

  onMounted(() => {
    isMounted = true

    // Not in setup: the spacers are sized by the average this returns.
    watch([layout, topSpacerHeight], () => update(), {flush: 'post'})

    if (itemsRef.value) rowGap.value = Number.parseFloat(getComputedStyle(itemsRef.value).rowGap) || 0

    window.addEventListener('resize', onWindowResize, {passive: true})

    update()
  })

  onBeforeUnmount(() => {
    isMounted = false
    window.removeEventListener('resize', onWindowResize)
    resizeObserver?.disconnect()
  })

  /** Per item, without opened rows, for the space of the pages not loaded; 0 before any row is measured. */
  const averageItemHeight = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    heightVersion.value

    return getAverage('data') || getAverage('skeleton')
  })

  /** Forgets the heights of items no longer loaded, as items of other pages or other params take their keys. */
  watch(entries, list => {
    if (heights.size < list.length * 4) return

    const keys = new Set(list.map(entry => entry.key))

    for (const key of heights.keys()) if (!keys.has(key)) heights.delete(key)

    for (const [key, height] of guessHeights) {
      if (keys.has(key)) continue

      const sums = guessSums[key.startsWith('group:') ? 'group' : key.startsWith('skeleton:') ? 'skeleton' : 'data']
      sums.sum -= height
      sums.count--
      guessHeights.delete(key)
    }
  })

  return {
    views,
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
