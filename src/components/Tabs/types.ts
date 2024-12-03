import type {VNode} from 'vue'

export interface TabsProps {
  customSlots?: VNode[]
  lessTransitions?: boolean
  initTab?: number
  side?: boolean
  disableMinHeight?: boolean
  noHeader?: boolean
  switchToNew?: boolean
}

export type TabsStepperProps = Omit<TabsProps, 'switchToNew' | 'noHeader' | 'side'>
