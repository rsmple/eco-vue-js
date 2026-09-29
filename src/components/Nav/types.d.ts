import type {LinkProps} from '@/types/types'

export interface NavItemProps extends LinkProps {
  /** Icon before the title. Defaults to the route's `meta.icon`. */
  icon?: SVGComponent
  /** Title of the item. Defaults to the route's `meta.titleShort`, then `meta.title`. */
  title?: string
  /** Number after the title in brackets, such as the number of items on the page it opens. */
  count?: number
  /** Number in a badge over the end of the title, such as unread items. Hidden at 0. */
  counter?: number
  /** Shows a placeholder for `count` and hides `counter`, while they load. */
  skeleton?: boolean
  /** Marks the item as the parent of the active item. Set by WNavItemExpand. */
  hasActive?: boolean
  /** Marks the item as the toggle of a group without a route of its own. Set by WNavItemExpand. */
  expand?: boolean
  /** Indents the item as a child of a group. Set by WNavItemExpand. */
  indent?: boolean
  /** Query params that must match the current route's for the item to be active, besides its route name. Other params, such as filters, are ignored. */
  queryFields?: string[]
  /** Highlights the item as hovered. Set by WNavItemExpand while its menu is open. */
  hovered?: boolean
  /** Lays the item out without the indent of a group. Set by WNavItemExpand. */
  even?: boolean
}

export interface NavItemExpandProps extends Partial<LinkProps> {
  /** Icon before the title. */
  icon?: SVGComponent
  /** Title of the group. */
  title: string
  /** Number after the title in brackets. */
  count?: number
  /** Number in a badge over the end of the title. Hidden at 0. */
  counter?: number
  /** Shows a placeholder for `count` and hides `counter`, while they load. */
  skeleton?: boolean
  /** Indents the group as a child of another group. */
  indent?: boolean
  /** Query params that must match the current route's for the group's own route to be active. */
  queryFields?: string[]
  /** Keeps the items always shown, without indent and without the menu on hover, e.g. for a nav inside a page. */
  even?: boolean
}
