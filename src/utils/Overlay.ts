import type {HorizontalAlign} from './HorizontalAlign'
import type {ModalComponent} from './Modal'
import type {DropdownProps} from '@/components/Dropdown/types'
import type {ConfirmModalProps} from '@/components/Modal/types'

import {type Component, type ComputedRef, computed, getCurrentInstance, inject, onScopeDispose, watch} from 'vue'

import {
  type OverlayLayer,
  closeLayer,
  getInstanceProvides,
  hasOwnerLayer,
  isHandoff,
  openConfirm,
  openModal,
  openWithCallback,
  setLayerBusy,
  toClose,
  wOverlayFrame,
  wOverlayLayer,
} from './OverlayRegistry'

/** Element, range or virtual element — such as one made with `createPointAnchor` — a dropdown opens at. */
export type OverlayAnchor = DropdownProps['parentElement']

/**
 * How WModal shows a layer's content:
 * - `modal` — centered over a backdrop, stacked. The content brings its own frame, such as WModalWrapper.
 * - `dropdown` — beside the page at its anchor, one at a time. On phones it is a bottom sheet instead.
 */
export type OverlayPresentation = 'modal' | 'dropdown'

/** Frame the content is shown in — a `dropdown` layer is a `sheet` on phones. */
export type OverlayFrame = 'modal' | 'dropdown' | 'sheet'

/** How a `dropdown` layer is framed. */
export type OverlayDropdownOptions = {
  /** Side of the anchor the dropdown lines up with. Defaults to its left edge. */
  align?: HorizontalAlign
  /** Centers the dropdown on the anchor with an arrow pointing at it, like a popover. */
  tip?: boolean
  /** Squares off the corner that touches the anchor, for a dropdown opened at a point. Otherwise it is offset to clear a `⋯` button. */
  cornered?: boolean
  /** Classes of the dropdown's box, replacing the default frame. */
  frameClass?: string
  /** Classes added to the content's box in the bottom sheet on phones. */
  sheetClass?: string
  /** A click on the content closes the layer, as in a menu. */
  closeOnClick?: boolean
}

type OverlayContentOptions = {
  /** Rendered inside the frame, with `props`. It may emit `close:modal` to close the layer. */
  content: Component
  props?: object
  /** What the layer is for, such as a list row, to mark it with `useOwnerActive` while the layer — or one it hands off to — is open. */
  owner?: unknown
  /** Closed with the modal's close button without asking about unsaved changes. */
  autoclose?: boolean
  /** Closes on Escape while top-most. Defaults to `true` for a dropdown. */
  escape?: boolean
  /** Closes a dropdown with the same anchor instead of opening, like a second click on a toggle. */
  toggle?: boolean
  /** Runs once the layer is closed — by its close function, its content, the user, a sibling taking its place, or the layer it was opened from closing. */
  onClose?: () => void
}

export type OverlayOpenOptions = OverlayContentOptions & (
  | {present: 'modal', anchor?: undefined, dropdown?: undefined}
  | {present: 'dropdown', anchor: OverlayAnchor, dropdown?: OverlayDropdownOptions}
)

/**
 * Opens overlays from a component, called in setup. Every method returns a function that closes what it opened, or `null` if nothing opened —
 * without WModal on the page, or when `toggle` closed a dropdown instead.
 *
 * What it opens belongs to the overlay the component is in, and its content sees the component's injections, though WModal renders it:
 * - From a modal, it closes together with the modal.
 * - From a menu — WButtonMore or the More menu of a selection bar — it takes the menu's place, since the menu closes on the click.
 *   A dropdown, such as a confirm, sticks to the menu's anchor and keeps the menu's row marked.
 *
 * A dropdown closes when the component unmounts, unless it took a menu's place. A modal stays.
 */
export const useOverlay = () => {
  const instance = getCurrentInstance()
  const getParent = inject(wOverlayLayer, () => null)

  // Dropdowns stick to the component's elements, so they go with it.
  const dropdowns = new Set<OverlayLayer>()

  onScopeDispose(() => {
    dropdowns.forEach(layer => closeLayer(layer.id))
  })

  const getContext = () => ({parent: getParent(), provides: getInstanceProvides(instance)})

  const track = (layer: OverlayLayer | null, handoff: boolean) => {
    if (layer?.present === 'dropdown' && !handoff) dropdowns.add(layer)

    return toClose(layer)
  }

  const untrack = (getLayer: () => OverlayLayer | null) => () => {
    const layer = getLayer()

    if (layer) dropdowns.delete(layer)
  }

  return {
    /** Opens `content` the way `present` says. WModal picks the frame, such as a dropdown that is a bottom sheet on phones. */
    open(options: OverlayOpenOptions): (() => void) | null {
      const context = getContext()
      const handoff = isHandoff(context.parent)

      const layer: OverlayLayer | null = openWithCallback(options, untrack(() => layer), context)

      return track(layer, handoff)
    },

    /** Opens a modal. `cb` runs after it closes. */
    add<Props>(component: ModalComponent<Props>, props?: Props, cb?: () => void): (() => void) | null {
      return toClose(openModal(component, props, cb, false, getContext()))
    },

    /** Opens a modal that closes with the backdrop's close button without asking about unsaved changes. */
    addAutoclosable<Props>(component: ModalComponent<Props>, props?: Props, cb?: () => void): (() => void) | null {
      return toClose(openModal(component, props, cb, true, getContext()))
    },

    /** Opens a confirm at `anchor`, or at the anchor of the menu it is opened from, as a dropdown — a bottom sheet on phones. Without one, a modal. */
    addConfirm(props: ConfirmModalProps, cb?: () => void): (() => void) | null {
      const context = getContext()
      const handoff = isHandoff(context.parent)

      const layer: OverlayLayer | null = openConfirm(props, () => {
        untrack(() => layer)()
        cb?.()
      }, context)

      return track(layer, handoff)
    },
  }
}

/** Keeps the layer the component is in open on Escape, outside clicks, swipes and a detached anchor while `source` is `true` — such as while an action runs. Called in setup. */
export const useLayerBusy = (source: () => boolean): void => {
  const getLayer = inject(wOverlayLayer, () => null)

  watch(source, value => {
    const id = getLayer()

    if (id !== null) setLayerBusy(id, value)
  }, {immediate: true})

  onScopeDispose(() => {
    const id = getLayer()

    if (id !== null) setLayerBusy(id, false)
  })
}

/** Frame the component is shown in, `null` outside overlays. Called in setup. */
export const useOverlayFrame = (): OverlayFrame | null => inject(wOverlayFrame, null)

/** Whether a layer is open for the owner — the `owner` of `open`, such as a row's menu, or a confirm it handed off to. */
export const useOwnerActive = (owner: unknown): ComputedRef<boolean> => {
  return computed(() => hasOwnerLayer(owner))
}

/**
 * An anchor at a point inside an element, such as where a row was right-clicked. It follows the element as it scrolls,
 * and lives as long as the element does — unlike an element made for the point, it outlives the menu that opened at it.
 */
export const createPointAnchor = (element: Element, clientX: number, clientY: number): OverlayAnchor => {
  const rect = element.getBoundingClientRect()
  const x = clientX - rect.x
  const y = clientY - rect.y

  return {
    contextElement: element,
    getBoundingClientRect: () => {
      const current = element.getBoundingClientRect()

      return new DOMRect(current.x + x, current.y + y, 0, 0)
    },
  }
}
