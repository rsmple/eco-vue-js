import type {VNode} from 'vue'

export interface TabsProps {
  name?: string
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
  wrap?: boolean
}

export type TabsItemScopedProps = {
  hasError: boolean
  hasChanges: boolean
  hasValue: boolean
}

export type TabsItemProps = {
  title?: string
  name: string
  icon?: SVGComponent
  disabled?: boolean
  removable?: boolean
  divided?: boolean
  init?: boolean
}
