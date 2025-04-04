import type {DropdownProps} from '../Dropdown/types'

export interface DropdownMenuProps extends Omit<DropdownProps, 'parentElement'> {
  isOpen: boolean
  teleport?: boolean
  parentElement?: DropdownProps['parentElement']
}
