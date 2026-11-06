import type {LinkProps} from '@/types/types'

export interface NavItemProps extends LinkProps {
  /** Icon before the title. Defaults to the route's `meta.icon`. Without an icon the title takes its place. */
  icon?: SVGComponent
  /** Title of the item. Defaults to the title the route's page registers with `useRouteTitle` while it is open, then the route's `meta.titleShort`, then `meta.title`. */
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
  /** How many groups the item is nested in, which sets its indent. Set by WNavItemExpand. */
  indent?: number
  /** Query params that must match the current route's for the item to be active, besides its route name. Other params, such as filters, are ignored. */
  queryFields?: string[]
  /** Route params that must match the current route's for the item to be active, besides its route name. Other route params are ignored. */
  paramFields?: string[]
  /** Highlights the item as hovered. Set by WNavItemExpand while its menu is open. */
  hovered?: boolean
  /** Lays the item out without the indent of a group. Set by WNavItemExpand. */
  even?: boolean
}

export interface NavItemExpandProps extends Partial<LinkProps> {
  /** Icon before the title. Without an icon the title takes its place. */
  icon?: SVGComponent
  /** Title of the group. */
  title: string
  /** Number after the title in brackets. */
  count?: number
  /** Number in a badge over the end of the title. Hidden at 0. */
  counter?: number
  /** Shows a placeholder for `count` and hides `counter`, while they load. */
  skeleton?: boolean
  /** How many groups the group is nested in, which sets its indent. Set by a parent WNavItemExpand. */
  indent?: number
  /** Query params that must match the current route's for the group's own route to be active. */
  queryFields?: string[]
  /** Route params that must match the current route's for the group's own route to be active. */
  paramFields?: string[]
  /** Keeps the items always shown, without indent and without the menu on hover, e.g. for a nav inside a page. */
  even?: boolean
}
