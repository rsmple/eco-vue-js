import {QueryClient, type QueryFilters, useQueryClient} from '@tanstack/vue-query'

export const paginatedResponseUpdater = <Data extends DefaultData>(oldData: PaginatedResponse<Data> | undefined, newValues: Data[], selected: number[], reverseSelection = false): PaginatedResponse<Data> | undefined => {
  if (!oldData) return undefined

  const included = reverseSelection
    ? oldData.results.filter(item => !selected.includes((item as unknown as {id: number}).id))
    : oldData.results.filter(item => selected.includes((item as unknown as {id: number}).id))

  if (!included.length) return oldData

  const newData: PaginatedResponse<Data> = {...oldData, results: oldData.results.slice()}

  included.forEach(oldItem => {
    const index = newData.results.indexOf(oldItem)

    if (index === -1) return

    const finding = newValues.find(item => (item as unknown as {id: number}).id === (oldItem as unknown as {id: number}).id)

    if (finding) newData.results.splice(index, 1, finding)
    else newData.results.splice(index, 1)
  })

  return newData
}

export const useQueryUpdater = () => {
  const queryClient = useQueryClient()

  const update = <Model extends DefaultData>(data: Model, options: {listQueryFilter?: QueryFilters, paginatedQueryFilter?: QueryFilters}) => {
    if (options.listQueryFilter) {
      queryClient.setQueriesData<Model[]>(options.listQueryFilter as Parameters<QueryClient['setQueriesData']>[0], value => {
        if (!value) return

        const index = value.findIndex(item => (item as unknown as {id: number}).id === (data as unknown as {id: number}).id)

        if (index === -1) return

        const newList = value.slice()

        newList.splice(index, 1, data)

        return newList
      })
    }

    if (options.paginatedQueryFilter) {
      queryClient.setQueriesData<PaginatedResponse<Model>>(
        options.paginatedQueryFilter as Parameters<QueryClient['setQueriesData']>[0],
        oldData => paginatedResponseUpdater(oldData, [data], [(data as unknown as {id: number}).id]))
    }
  }

  const updateBulk = <Model extends DefaultData>(data: Model[], filter: QueryFilters) => {
    queryClient.setQueriesData<PaginatedResponse<Model>>(
      filter as Parameters<QueryClient['setQueriesData']>[0],
      oldData => paginatedResponseUpdater(oldData, data, data.map(item => (item as unknown as {id: number}).id)))
  }

  const deleteItems = <Model extends DefaultData>(filter: QueryFilters, selected: number[], reverse = false) => {
    queryClient.setQueriesData<PaginatedResponse<Model>>(
      filter as Parameters<QueryClient['setQueriesData']>[0],
      oldData => paginatedResponseUpdater(oldData, [], selected, reverse),
    )
  }

  return {
    update,
    updateBulk,
    delete: deleteItems,
  }
}
