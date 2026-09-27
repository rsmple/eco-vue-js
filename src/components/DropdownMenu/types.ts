import type {DropdownProps} from '../Dropdown/types'

export interface DropdownMenuProps extends Omit<DropdownProps, 'parentElement'> {
  isOpen: boolean
  /** Element the menu is positioned against. Defaults to the element rendered by the `toggle` slot. */
  parentElement?: DropdownProps['parentElement']
  /** Classes for the menu's content box. */
  dropdownClass?: string
}

export interface DropdownAdaptiveProps extends DropdownMenuProps {
  closeOnClickOutside?: boolean
}
