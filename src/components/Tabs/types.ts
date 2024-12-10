import type {VNode} from 'vue'

export interface TabsProps {
  customSlots?: VNode[]
  lessTransitions?: boolean
  initTab?: string
  initTabIndex?: number
  side?: boolean
  disableMinHeight?: boolean
  noHeader?: boolean
  switchToNew?: boolean
  stepper?: boolean
  showHasValue?: boolean
  noSwitchOnInvalid?: boolean
}

export type TabsItemScopedProps = {
  hasError: boolean
  hasChanges: boolean
  hasValue: boolean
}
