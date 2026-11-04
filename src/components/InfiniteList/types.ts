export type InfiniteListHeaderScope = {
  headerTop: number
  headerHeight: number
  stickyTop: number
  updateHeader: () => void
}

export type InfiniteListScope = {
  resetPage: (page?: number) => Promise<void>
  goto: (page?: number, itemIndex?: number) => Promise<void>
  refetchAll: () => void
  isFetching: boolean
  isRefetchingAll: boolean
}

export type InfiniteListItemScope<Data, Model> = {
  item: Data
  setter: (newItem?: Data | undefined) => void
  skeleton: boolean
  refetch: () => void
  previous: Data | undefined
  next: Data | undefined
  first: boolean
  last: boolean
  resetting: boolean
  page: number
  index: number
  position: number
  value: Model
  results: Data[] | undefined
  intersecting: boolean
}
