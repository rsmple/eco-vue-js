import type {DropdownProps} from '../Dropdown/types'

export interface DropdownMenuProps extends Omit<DropdownProps, 'parentElement'> {
  isOpen: boolean
  parentElement?: DropdownProps['parentElement']
}
