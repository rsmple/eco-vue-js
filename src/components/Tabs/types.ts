import type {VNode} from 'vue'

export interface TabsProps {
  customSlots?: VNode[]
  lessTransitions?: boolean
  initTab?: string
  initTabIndex?: number
  side?: boolean
  disableMinHeight?: boolean
  noHeader?: boolean
  headerClass?: string
  switchToNew?: boolean
  stepper?: boolean
  showHasValue?: boolean
  noSwitchOnInvalid?: boolean
  wrap?: boolean
  statusIcon?: boolean
}

export type TabsItemProps = {
  title?: string
  name: string
  icon?: SVGComponent
  disabled?: boolean
  removable?: boolean
  divided?: boolean
  init?: boolean
  hasValue?: boolean | null
  hasError?: boolean
  hasChanges?: boolean
  validate?: () => string | undefined
}
