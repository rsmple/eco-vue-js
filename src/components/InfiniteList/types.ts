export type InfiniteListHeaderScope = {
  headerTop: number
  headerHeight: number
  updateHeader: () => void
}

export type InfiniteListScope = {
  resetPage: (page?: number) => Promise<void>
  goto: (page?: number, itemIndex?: number) => Promise<void>
  refetchAll: () => void
  isFetching: boolean
  isRefetchingAll: boolean
}
