import type {InfiniteListHeaderScope} from '@/components/InfiniteList/types'
import type {InjectionKey, Ref} from 'vue'

/**
 * A page list's frame drawn around content that holds page lists, such as the tabs of WTabs `section`: a page list in
 * it joins the frame instead of drawing its own section, puts its header in the frame's stuck header and renders only
 * its rows. The frame keeps its box, its head and the stuck state while the list in it changes.
 */
export type ListPageFrame = {
  /** Whether the content is shown, such as the open tab. Only a shown list joins and puts its header in the frame. */
  shown: Readonly<Ref<boolean>>
  /** Where a joined list puts its header: in the frame's stuck header, after its head. */
  target: Readonly<Ref<HTMLElement | null>>
  /** The frame's stuck header, for the rows of the list in it. */
  scope: Readonly<InfiniteListHeaderScope>
  /** A list joins while shown, a table (`table`) or cards. */
  join: (owner: symbol, table: boolean) => void
  leave: (owner: symbol) => void
  /** Repaints what paints the fixed backdrop: see WList. */
  repaint: () => void
}

export const wListPageFrame = Symbol('wListPageFrame') as InjectionKey<ListPageFrame | null>

/** Given by a page list joined to a frame to its own list's header wrapper: where the header goes, and the frame's header for the rows. */
export type ListPageFrameHeader = {
  target: Readonly<Ref<HTMLElement | null>>
  scope: Readonly<InfiniteListHeaderScope>
}

export const wListPageFrameHeader = Symbol('wListPageFrameHeader') as InjectionKey<ListPageFrameHeader | null>
