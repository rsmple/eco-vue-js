import type {LinkProps} from '@/types/types'

export interface NavItemProps extends LinkProps {
  icon?: SVGComponent
  title?: string
  count?: number
  counter?: number
  skeleton?: boolean
  hasActive?: boolean
  expand?: boolean
  indent?: boolean
  queryFields?: string[]
  hovered?: boolean
  even?: boolean
}

export interface NavItemExpandProps extends Partial<LinkProps> {
  icon?: SVGComponent
  title: string
  count?: number
  counter?: number
  skeleton?: boolean
  indent?: boolean
  queryFields?: string[]
  even?: boolean
}
