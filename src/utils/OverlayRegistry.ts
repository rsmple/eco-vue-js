/**
 * Internal to the ui-kit: the list of open overlay layers that WModal renders. Open layers with `useOverlay` or `Modal` instead.
 */
import type {OverlayAnchor, OverlayDropdownOptions, OverlayFrame, OverlayOpenOptions, OverlayPresentation} from './Overlay'
import type {ConfirmModalProps} from '@/components/Modal/types'

import {type Component, type ComponentInternalInstance, type InjectionKey, type Ref, defineAsyncComponent, markRaw, nextTick, shallowRef} from 'vue'

import {HorizontalAlign} from './HorizontalAlign'

const ConfirmModal = defineAsyncComponent(() => import('@/components/Modal/modals/Confirm/ConfirmModal.vue'))
const ConfirmAnchored = defineAsyncComponent(() => import('@/components/Modal/modals/Confirm/ConfirmAnchored.vue'))

/**
 * How a layer shares its parent with other layers:
 * - `replace` — one at a time per parent, like a menu or an anchored confirm. Opening one closes the other.
 * - `push` — stacks over the others, like a modal.
 */
export type OverlayPolicy = 'push' | 'replace'

export type OverlayLayer = {
  readonly id: number
  readonly present: OverlayPresentation
  readonly policy: OverlayPolicy
  /** Layer it was opened from, closed together with it. `null` for the page. */
  readonly parent: number | null
  /** What the layer is for, such as a list row, to mark it while the layer is open. */
  readonly owner: unknown
  readonly anchor: OverlayAnchor | undefined
  /** Rendered by the host inside the frame `present` calls for, emitting `close:modal` to close the layer. */
  readonly content: Component
  readonly props: object | undefined
  readonly dropdown: OverlayDropdownOptions
  /** Injections of the component that opened the layer, which the content sees instead of the host's. */
  readonly provides: Record<string | symbol, unknown> | undefined
  /** Closed with the modal's close button without asking about unsaved changes. */
  readonly autoclose: boolean
  /** Closes on Escape while top-most. */
  readonly escape: boolean
}

export type OverlayOptions = OverlayOpenOptions & {
  /** Layer it is opened from. */
  parent?: number | null
  /** Injections the content sees. */
  provides?: Record<string | symbol, unknown>
}

type LayerEntry = OverlayLayer & {onClose: (() => void) | undefined}

/** Injections of a component instance. Internal to Vue, but stable — it is what `provide` and `inject` read. */
type InstanceProvides = {provides: Record<string | symbol, unknown>}

export const getInstanceProvides = (instance: ComponentInternalInstance | null) => (instance as unknown as InstanceProvides | null)?.provides

export const setInstanceProvides = (instance: ComponentInternalInstance | null, provides: Record<string | symbol, unknown>) => {
  if (instance) (instance as unknown as InstanceProvides).provides = provides
}

/** Getter of the layer the content belongs to, `null` on the page. */
export const wOverlayLayer = Symbol('wOverlayLayer') as InjectionKey<() => number | null>

/** Frame of the layer the content belongs to, `null` on the page. */
export const wOverlayFrame = Symbol('wOverlayFrame') as InjectionKey<OverlayFrame | null>

let isHosted = false

/** Called by the host, WModal, as it mounts and unmounts. Nothing opens without it, as nothing would render. */
export const setOverlayHost = (value: boolean): void => {
  isHosted = value
}

const layers = shallowRef<LayerEntry[]>([])

/** Open layers, bottom to top, for the host to render. */
export const useOverlayLayers = (): Readonly<Ref<readonly OverlayLayer[]>> => layers

let nextId = 0

const findLayer = (id: number | null): LayerEntry | undefined => {
  return id === null ? undefined : layers.value.find(item => item.id === id)
}

export const getLayer = (id: number | null): OverlayLayer | undefined => findLayer(id)

/**
 * Closes the layer and everything opened from it, the top-most first.
 */
export const closeLayer = (id: number): void => {
  const entry = findLayer(id)

  if (!entry) return

  layers.value
    .filter(item => item.parent === id)
    .reverse()
    .forEach(item => closeLayer(item.id))

  layers.value = layers.value.filter(item => item !== entry)

  setLayerBusy(id, false)

  entry.onClose?.()
}

/** Whether opening from `parent` hands off: a menu closes on the click that opens something from it, taking the clicked item with it. */
export const isHandoff = (parent: number | null): boolean => findLayer(parent)?.policy === 'replace'

/** The anchor a layer opened from `parent` takes over, so a layer opened from a menu sticks to the menu's anchor. */
export const getHandoffAnchor = (parent: number | null): OverlayAnchor | undefined => {
  return isHandoff(parent) ? findLayer(parent)?.anchor : undefined
}

/**
 * Opens a layer. Opened from a `replace` layer — a menu — it takes the menu's place: the menu closes,
 * and the new layer belongs to the menu's parent. A `replace` layer also inherits the menu's anchor and owner,
 * so it stays where the menu was and keeps its row marked.
 *
 * Returns `null` when nothing opened: without the host, or when `toggle` closed a layer instead.
 */
export const openLayer = (options: OverlayOptions): OverlayLayer | null => {
  if (!isHosted) return null

  const policy: OverlayPolicy = options.present === 'dropdown' ? 'replace' : 'push'

  let parent = findLayer(options.parent ?? null) ? options.parent ?? null : null
  let owner = options.owner
  let anchor = options.anchor

  const parentEntry = findLayer(parent)

  if (parentEntry?.policy === 'replace') {
    parent = parentEntry.parent

    if (policy === 'replace') {
      owner ??= parentEntry.owner
      anchor = parentEntry.anchor ?? anchor
    }

    closeLayer(parentEntry.id)
  }

  if (policy === 'replace') {
    const siblings = layers.value.filter(item => item.policy === 'replace' && item.parent === parent)

    siblings.reverse().forEach(item => closeLayer(item.id))

    if (options.toggle && anchor && siblings.some(item => item.anchor === anchor)) return null
  }

  const entry: LayerEntry = {
    id: nextId++,
    present: options.present,
    policy,
    parent,
    owner,
    anchor,
    content: markRaw(options.content),
    props: options.props,
    dropdown: options.dropdown ?? {},
    provides: options.provides,
    autoclose: options.autoclose ?? false,
    escape: options.escape ?? options.present === 'dropdown',
    onClose: options.onClose,
  }

  layers.value = [...layers.value, entry]

  return entry
}

/** Whether the layer is the top-most, the one Escape and outside clicks belong to. */
export const isTopLayer = (id: number | null): boolean => {
  return id !== null && layers.value[layers.value.length - 1]?.id === id
}

/** Closes the layers opened from the given one. Returns whether there were any. */
export const closeChildLayers = (id: number): boolean => {
  const children = layers.value.filter(item => item.parent === id)

  children.reverse().forEach(item => closeLayer(item.id))

  return children.length > 0
}

/** Whether a layer is open for the owner. */
export const hasOwnerLayer = (owner: unknown): boolean => layers.value.some(item => item.owner === owner)

const busyLayers = shallowRef<ReadonlySet<number>>(new Set())

/** Marks a layer busy, such as a confirm running its action. A busy layer stays open on Escape, outside clicks, swipes and a detached anchor. */
export const setLayerBusy = (id: number, value: boolean): void => {
  if (value === busyLayers.value.has(id) || (value && !findLayer(id))) return

  const next = new Set(busyLayers.value)

  if (value) next.add(id)
  else next.delete(id)

  busyLayers.value = next
}

export const isLayerBusy = (id: number): boolean => busyLayers.value.has(id)

/** Whether the anchor is still on the page. A detached anchor has nothing to stick to. */
export const isAnchorConnected = (anchor: OverlayAnchor): boolean => {
  const element = anchor instanceof Element
    ? anchor
    : anchor instanceof Range
      ? anchor.commonAncestorContainer
      : anchor.contextElement

  return !element || element.isConnected
}

type OpenContext = {
  parent: number | null
  provides?: Record<string | symbol, unknown>
}

/** Opens a layer for `Modal` and `useOverlay`, returning its close function. `cb` runs after it closes. */
export const openWithCallback = (options: OverlayOpenOptions, cb: (() => void) | undefined, context: OpenContext): OverlayLayer | null => {
  return openLayer({
    ...options,
    ...context,
    onClose: () => {
      options.onClose?.()

      if (cb) nextTick(cb)
    },
  })
}

export const openModal = (component: Component, props: unknown, cb: (() => void) | undefined, autoclose: boolean, context: OpenContext): OverlayLayer | null => {
  return openWithCallback({present: 'modal', content: component, props: props as object | undefined, autoclose}, cb, context)
}

/** A confirm at its anchor — or the anchor of the menu it is opened from — if it is on the page, otherwise a modal. */
export const openConfirm = (props: ConfirmModalProps, cb: (() => void) | undefined, context: OpenContext): OverlayLayer | null => {
  const anchor = getHandoffAnchor(context.parent) ?? props.anchor

  if (anchor && isAnchorConnected(anchor)) {
    return openWithCallback({
      present: 'dropdown',
      anchor,
      content: ConfirmAnchored,
      props: {...props, anchor},
      dropdown: {tip: true, align: HorizontalAlign.CENTER},
      autoclose: true,
      // Opening it again from the same anchor closes it, like a second click on a toggle.
      toggle: true,
    }, cb, context)
  }

  return openModal(ConfirmModal, props, cb, true, context)
}

/** Close function of an opened layer, for the public API. */
export const toClose = (layer: OverlayLayer | null): (() => void) | null => {
  return layer ? () => closeLayer(layer.id) : null
}
