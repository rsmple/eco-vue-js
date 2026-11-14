/** What a headless page has, read by the list to render the page's items itself. */
export interface PageSource<Data> {
  readonly page: number | null
  readonly results: Data[] | undefined
  /** The page shows its error or empty state, which it renders itself, and no items. */
  readonly isState: boolean
  readonly setItem: (item: Data) => void
  readonly removeItem: (id: number | string) => void
  readonly getStateElement: () => HTMLElement | null
}
