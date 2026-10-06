import {type InjectionKey, inject} from 'vue'

import {useOverlayClose} from '@/utils/Overlay'

/** Provided by content that applies a pick at once, such as a filter: an embedded single select inside closes the overlay it is in once an option is picked. */
export const wCloseOverlayOnPick = Symbol('wCloseOverlayOnPick') as InjectionKey<boolean>

/**
 * What a single select does once an option is picked: closes its menu, also a bottom sheet on phones, which stays open when the field loses focus.
 * Embedded, the options are part of the content instead — a form keeps them until it is saved, and a filter closes, as it is applied. Called in setup.
 */
export const useCloseOnPick = (isEmbedded: () => boolean, closeMenu: () => void): () => void => {
  const closeOverlay = inject(wCloseOverlayOnPick, false) ? useOverlayClose() : null

  return () => {
    if (!isEmbedded()) closeMenu()
    else closeOverlay?.()
  }
}
