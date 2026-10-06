import type {ModalComponent} from './Modal'
import type {DropdownProps} from '@/components/Dropdown/types'
import type {ConfirmModalProps} from '@/components/Modal/types'
import type {HorizontalAlign} from '@/utils/HorizontalAlign'

import {type Component, getCurrentInstance, inject, onScopeDispose, watch} from 'vue'

import {
  type OpenContext,
  type OverlayFrameOptions,
  type OverlayLayer,
  closeLayer,
  getInstanceProvides,
  isHandoff,
  openConfirm,
  openModal,
  openWithCallback,
  setLayerBusy,
  setLayerChanges,
  toClose,
  wOverlayFrame,
  wOverlayLayer,
  wOverlayRegions,
} from '@/components/Modal/models/overlayRegistry'

export type {OverlayFrameOptions}

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
  /**
   * Opens at the anchor as at a point, such as where a row was right-clicked, squaring off the corner that touches it.
   * Otherwise the dropdown is centered on the anchor with a tip pointing at it, and shifts aside near the edge of the screen while the tip stays.
   */
  cornered?: boolean
  /**
   * Aligns the dropdown to the anchor without a tip, such as a field's menu with `HorizontalAlign.FILL`.
   * `LEFT_CENTER` and `RIGHT_CENTER` open it beside the anchor with a tip pointing at it, such as from a button in a side rail; near the top or bottom of the screen the box shifts while the tip stays.
   */
  align?: HorizontalAlign
  /** Classes of the dropdown's box, replacing the default frame. */
  frameClass?: string
  /** A click on the content closes the layer, as in a menu. What is opened from it takes its place; from a dropdown without it, such as a filter, it stays over it. */
  closeOnClick?: boolean
  /** Called with whether the dropdown opened above its anchor, as it is placed. Not called in a bottom sheet. */
  onTop?: (value: boolean) => void
}

type OverlayContentOptions = {
  /** Rendered inside the frame, with `props`. It may emit `close:modal` to close the layer. */
  content: Component
  props?: object
  /** Runs once the layer is closed — by its close function, its content, the user, a sibling taking its place, or the layer it was opened from closing. */
  onClose?: () => void
  /** Takes the place of the dropdown it is opened from, as from a menu, such as the next step of a small form. A dropdown sticks to that dropdown's anchor, and that dropdown's `onClose` runs once this one closes, so its opener stays marked. */
  replace?: boolean
}

export type OverlayOpenOptions = OverlayContentOptions & (
  | {
    present: 'modal'
    anchor?: undefined
    dropdown?: undefined
    /** Closed with the modal's close button without asking about unsaved changes. */
    autoclose?: boolean
  }
  | {present: 'dropdown', anchor: OverlayAnchor, dropdown?: OverlayDropdownOptions, autoclose?: undefined}
)

/**
 * Opens overlays from a component, called in setup. Every method returns a function that closes what it opened, or `null` if nothing opened —
 * without WModal on the page, or when `toggle` closed a dropdown instead.
 *
 * What it opens belongs to the overlay the component is in, and its content sees the component's injections, though WModal renders it:
 * - From a modal, it closes together with the modal.
 * - From a menu — a dropdown with `closeOnClick`, such as WButtonMore — it takes the menu's place, since the menu closes on the click.
 *   A dropdown, such as a confirm, sticks to the menu's anchor and keeps the menu's row marked.
 * - From any other dropdown, such as a filter, it stays over it, like the menu of a select inside — or takes its place the same way with `replace`.
 *
 * A dropdown closes when the component unmounts, unless it took a menu's place. A modal stays.
 */
export const useOverlay = () => {
  const instance = getCurrentInstance()
  const getParent = inject(wOverlayLayer, () => null)

  // Dropdowns stick to the component's elements, so they go with it — unless they took a menu's place.
  const dropdowns = new Set<number>()

  onScopeDispose(() => {
    dropdowns.forEach(closeLayer)
  })

  const getContext = (): OpenContext => ({parent: getParent(), provides: getInstanceProvides(instance)})

  // `open` gets a callback to run once the layer closes, which forgets it.
  const track = (open: (context: OpenContext, untrack: () => void) => OverlayLayer | null, replace?: boolean) => {
    const context = getContext()
    const handoff = isHandoff(context.parent, replace)

    const layer: OverlayLayer | null = open(context, () => {
      if (layer) dropdowns.delete(layer.id)
    })

    if (layer?.present === 'dropdown' && !handoff) dropdowns.add(layer.id)

    return toClose(layer)
  }

  return {
    /** Opens `content` the way `present` says. WModal picks the frame, such as a dropdown that is a bottom sheet on phones. */
    open(options: OverlayOpenOptions): (() => void) | null {
      return track((context, untrack) => openWithCallback(options, untrack, context), options.replace)
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
      return track((context, untrack) => openConfirm(props, () => {
        untrack()
        cb?.()
      }, context))
    },
  }
}

/** Keeps the layer the component is in open on Escape, outside clicks, swipes and a detached anchor while `source` is `true` — such as while an action runs. Called in setup. */
export const useLayerBusy = (source: () => boolean): void => {
  useLayerFlag(setLayerBusy, source)
}

/**
 * Asks before the modal the component is in closes with its close button while `source` is `true`, such as while a form has unsaved changes.
 * A dropdown is dismissed without asking, as a menu is. A form with `api-method` does it on its own. Called in setup.
 */
export const useLayerChanges = (source: () => boolean): void => {
  useLayerFlag(setLayerChanges, source)
}

/**
 * Asks the frame the component is in — a modal, a dropdown or a bottom sheet — to look a certain way while it is mounted, such as to pad the content like its title and buttons.
 * The frame takes what applies to it; the latest component to ask counts. Outside a frame it does nothing. WModalWrapper does it on its own. Called in setup.
 */
export const useOverlayFrameOptions = (getOptions: () => OverlayFrameOptions): void => {
  const regions = inject(wOverlayRegions, null)

  if (!regions) return

  const source = Symbol('options')

  regions.setOptions(source, getOptions)

  onScopeDispose(() => regions.setOptions(source, null))
}

const useLayerFlag = (set: (id: number, source: symbol, value: boolean) => void, source: () => boolean): void => {
  const getLayer = inject(wOverlayLayer, () => null)
  const key = Symbol('source')

  watch(source, value => {
    const id = getLayer()

    if (id !== null) set(id, key, value)
  }, {immediate: true})

  onScopeDispose(() => {
    const id = getLayer()

    if (id !== null) set(id, key, false)
  })
}

/**
 * Closes the layer the component is in, as its content emitting `close:modal` does — without asking about unsaved changes, such as from its own Cancel button
 * or once a filter is applied. `null` outside overlays. Called in setup.
 */
export const useOverlayClose = (): (() => void) | null => {
  const id = inject(wOverlayLayer, () => null)()

  return id === null ? null : () => closeLayer(id)
}

/** Frame the component is shown in, `null` outside overlays. Called in setup. */
export const useOverlayFrame = (): OverlayFrame | null => inject(wOverlayFrame, null)

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
