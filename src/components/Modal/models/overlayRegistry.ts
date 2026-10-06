/**
 * Internal to the ui-kit: the list of open overlay layers that WModal renders. Open layers with `useOverlay` or `Modal` instead.
 */
import type {ConfirmModalProps} from '../types'
import type {OverlayAnchor, OverlayDropdownOptions, OverlayFrame, OverlayOpenOptions, OverlayPresentation} from '@/utils/Overlay'

import {type Component, type ComponentInternalInstance, type InjectionKey, type Ref, defineAsyncComponent, markRaw, nextTick, shallowReactive, shallowRef} from 'vue'

import {isAnchorConnected} from '@/utils/utils'

const ConfirmModal = defineAsyncComponent(() => import('../modals/Confirm/ConfirmModal.vue'))
const ConfirmAnchored = defineAsyncComponent(() => import('../modals/Confirm/ConfirmAnchored.vue'))

/**
 * A layer is presented as:
 * - `dropdown` — one at a time per parent, like a menu or an anchored confirm. Opening one closes the other. Closes on Escape while top-most.
 * - `modal` — stacks over the others.
 */
export type OverlayLayer = {
  readonly id: number
  readonly present: OverlayPresentation
  /** Layer it was opened from, closed together with it. `null` for the page. */
  readonly parent: number | null
  readonly anchor: OverlayAnchor | undefined
  /** Rendered by the host inside the frame `present` calls for, emitting `close:modal` to close the layer. */
  readonly content: Component
  readonly props: object | undefined
  readonly dropdown: OverlayDropdownOptions
  /** Injections of the component that opened the layer, which the content sees instead of the host's. */
  readonly provides: Record<string | symbol, unknown> | undefined
  /** Modal closed with its close button without asking about unsaved changes. */
  readonly autoclose: boolean
}

export type OverlayOptions = OverlayOpenOptions & {
  /** Layer it is opened from. */
  parent?: number | null
  /** Injections the content sees. */
  provides?: Record<string | symbol, unknown>
  /** Closes a dropdown with the same anchor instead of opening, like a second click on a toggle. */
  toggle?: boolean
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

/**
 * Areas of a frame the content hands parts of itself to, so the frame places them where its layout needs:
 * - `title` and `subtitle` — the heading, and what is pinned under it, such as a progress line.
 * - `header` — pinned above the content that scrolls, such as the field of an embedded select.
 * - `actions` — the buttons, pinned at the bottom.
 */
export type OverlayRegion = 'title' | 'subtitle' | 'header' | 'actions'

/** A part handed to a frame: its render, and the injections of the component it came from, which it renders with. */
export type OverlayPart = {
  readonly render: Component
  readonly provides: Record<string | symbol, unknown> | undefined
  /** Shown only while no other part is in the area, such as a stepper's step title under a form's own title. */
  readonly fallback: boolean
}

/** How the content asks its frame to look, such as WModalWrapper's props and classes. A frame takes what applies to it. */
export type OverlayFrameOptions = {
  /** Pads the content like the frame's title and buttons, by `--w-frame-padding`, such as a form's body. Content that reaches the edges, such as a list, takes `w-frame-bleed`. */
  padded?: boolean
  /** Classes of the frame's box, such as a modal's width. */
  class?: unknown
  /** Fills the whole screen on small screens, as a modal. */
  maximized?: boolean
  /** Stacks the buttons vertically on every screen size. */
  actionsCol?: boolean
  /** A dropdown with a title sizes to the content, from 18rem up to the width it keeps otherwise (24rem), such as a filter's list of options. */
  fitContent?: boolean
}

/**
 * Areas of the frame the content belongs to, which OverlayRegionPart renders its slot into. `add` returns `false` for an area the frame does not have, and the part renders in place.
 * `setOptions` asks the frame to look a certain way while `getOptions` is set — the latest one counts — and `null` takes it back.
 * `claim` lets one owner take a role in the frame, such as the stepper whose steps the frame shows: it returns `true` for the first owner, until it calls `release`.
 */
export const wOverlayRegions = Symbol('wOverlayRegions') as InjectionKey<{
  add: (region: OverlayRegion, part: OverlayPart) => boolean
  remove: (region: OverlayRegion, part: OverlayPart) => void
  setOptions: (source: symbol, getOptions: (() => OverlayFrameOptions) | null) => void
  claim: (role: string, owner: symbol) => boolean
  release: (role: string, owner: symbol) => void
} | null>

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

  busyLayers.clear(id)
  changedLayers.clear(id)

  entry.onClose?.()
}

/** Whether the layer was opened from `ancestor`, or from a layer opened from it. */
export const isLayerWithin = (id: number, ancestor: number): boolean => {
  const parent = findLayer(id)?.parent ?? null

  return parent !== null && (parent === ancestor || isLayerWithin(parent, ancestor))
}

/** Attribute a dropdown layer's frame marks its element on the page with, holding the layer's id. */
export const LAYER_ATTRIBUTE = 'data-w-layer'

/** Whether an event's path goes through a layer opened from `ancestor`, such as a click in a select's menu inside a filter. */
export const isInLayerWithin = (path: EventTarget[], ancestor: number): boolean => {
  return path.some(target => {
    const id = target instanceof Element ? target.getAttribute(LAYER_ATTRIBUTE) : null

    return id !== null && isLayerWithin(Number(id), ancestor)
  })
}

/** The menu opening from `parent` hands off from: a dropdown with `closeOnClick` closes on the click that opens something from it, taking the clicked item with it. */
const findHandoff = (parent: number | null): LayerEntry | undefined => {
  const entry = findLayer(parent)

  return entry?.present === 'dropdown' && entry.dropdown.closeOnClick ? entry : undefined
}

/** Whether opening from `parent` hands off, taking the place of the menu it is opened from. */
export const isHandoff = (parent: number | null): boolean => findHandoff(parent) !== undefined

/** The anchor a layer opened from `parent` takes over, so a layer opened from a menu sticks to the menu's anchor. */
export const getHandoffAnchor = (parent: number | null): OverlayAnchor | undefined => findHandoff(parent)?.anchor

/**
 * Opens a layer. Opened from a menu — a dropdown with `closeOnClick` — it takes the menu's place: the menu closes,
 * and the new layer belongs to the menu's parent. A dropdown also inherits the menu's anchor, so it stays where the menu was,
 * and the menu's opener still sees it with `hasAnchorLayer`. Opened from any other dropdown, such as a filter, it stays over it.
 *
 * Returns `null` when nothing opened: without the host, or when `toggle` closed a layer instead.
 */
export const openLayer = (options: OverlayOptions): OverlayLayer | null => {
  if (!isHosted) return null

  const isDropdown = options.present === 'dropdown'

  let parent = findLayer(options.parent ?? null) ? options.parent ?? null : null
  let anchor = options.anchor

  const handoff = findHandoff(parent)

  if (handoff) {
    parent = handoff.parent

    if (isDropdown) anchor = handoff.anchor ?? anchor

    closeLayer(handoff.id)
  }

  if (isDropdown) {
    const siblings = layers.value.filter(item => item.present === 'dropdown' && item.parent === parent)

    siblings.reverse().forEach(item => closeLayer(item.id))

    if (options.toggle && anchor && siblings.some(item => item.anchor === anchor)) return null
  }

  const entry: LayerEntry = {
    id: nextId++,
    present: options.present,
    parent,
    anchor,
    content: markRaw(options.content),
    props: options.props,
    dropdown: options.dropdown ?? {},
    provides: options.provides,
    autoclose: options.autoclose ?? false,
    onClose: options.onClose,
  }

  layers.value = [...layers.value, entry]

  return entry
}

/** Closes the layers opened from the given one. Returns whether there were any. */
export const closeChildLayers = (id: number): boolean => {
  const children = layers.value.filter(item => item.parent === id)

  children.reverse().forEach(item => closeLayer(item.id))

  return children.length > 0
}

/** Whether a layer is open at the anchor — a menu, or a confirm it handed off to. */
export const hasAnchorLayer = (anchor: OverlayAnchor): boolean => layers.value.some(item => item.anchor === anchor)

/** A flag of a layer that several components inside set on their own, such as two forms: it is on while any of them sets it. */
const createLayerFlag = () => {
  const sources = shallowReactive(new Map<number, ReadonlySet<symbol>>())

  return {
    set(id: number, source: symbol, value: boolean): void {
      const current = sources.get(id)

      if (value === (current?.has(source) ?? false)) return
      if (value && !findLayer(id)) return

      const next = new Set(current)

      if (value) next.add(source)
      else next.delete(source)

      if (next.size) sources.set(id, next)
      else sources.delete(id)
    },
    has: (id: number): boolean => sources.has(id),
    clear: (id: number): void => {
      sources.delete(id)
    },
  }
}

const busyLayers = createLayerFlag()

/** Marks a layer busy for `source`, such as a confirm running its action. A busy layer stays open on Escape, outside clicks, swipes and a detached anchor. */
export const setLayerBusy = busyLayers.set

export const isLayerBusy = busyLayers.has

const changedLayers = createLayerFlag()

/** Marks a layer as holding unsaved changes for `source`, such as a form. Closing it without the content's say asks first. */
export const setLayerChanges = changedLayers.set

export const hasLayerChanges = changedLayers.has

export type OpenContext = {
  parent: number | null
  provides?: Record<string | symbol, unknown>
}

/** Opens a layer for `Modal` and `useOverlay`, returning its close function. `cb` runs after it closes. */
export const openWithCallback = (options: OverlayOpenOptions & Pick<OverlayOptions, 'toggle'>, cb: (() => void) | undefined, context: OpenContext): OverlayLayer | null => {
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
