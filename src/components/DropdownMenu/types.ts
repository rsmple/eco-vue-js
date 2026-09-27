import type {DropdownProps} from '../Dropdown/types'

export interface DropdownMenuProps extends Omit<DropdownProps, 'parentElement' | 'innerClass'> {
  /** Shows the menu. */
  isOpen: boolean
  /** Element the menu is positioned against. Defaults to the element rendered by the `toggle` slot. */
  parentElement?: DropdownProps['parentElement']
  /** Classes for the menu's content box. Defaults to `w-max`. */
  dropdownClass?: string
}

export interface DropdownAdaptiveProps extends DropdownMenuProps {
  /** Emits `close` on a click outside the menu. On mobile the bottom sheet emits `close` on its own. */
  closeOnClickOutside?: boolean
}
