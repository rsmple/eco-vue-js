import type {DropdownProps} from '../Dropdown/types'
import type {HorizontalAlign} from '@/utils/HorizontalAlign'
import type {OverlayAnchor, OverlayDropdownOptions} from '@/utils/Overlay'

export interface DropdownMenuProps extends Omit<DropdownProps, 'parentElement' | 'innerClass'> {
  /** Shows the menu. */
  isOpen: boolean
  /** Element the menu is positioned against. Defaults to the element rendered by the `toggle` slot. */
  parentElement?: DropdownProps['parentElement']
  /** Classes for the menu's content box. Defaults to `w-max`. */
  dropdownClass?: string
}

export interface DropdownAdaptiveProps extends Pick<OverlayDropdownOptions, 'frameClass' | 'closeOnClick'> {
  /** Shows the dropdown. */
  isOpen: boolean
  /** Element the dropdown opens at. Defaults to the element rendered by the `toggle` slot. */
  parentElement?: OverlayAnchor | null
  /** Aligns the dropdown to the parent without a tip, such as a field's menu with `HorizontalAlign.FILL`. Otherwise it is centered on the parent with a tip pointing at it. */
  horizontalAlign?: HorizontalAlign
  /** The content is a small form, such as a filter: the `header` slot is its title on every screen, and the frame pads the content and sizes to it. */
  dialog?: boolean
}
