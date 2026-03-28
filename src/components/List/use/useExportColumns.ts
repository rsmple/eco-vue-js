import type {ListFields} from '../types'

type ColumnGroupDef<Data, QueryParams> = {
  headers: string[]
  getRows: (item: Data, queryParams: QueryParams) => Promise<string[][]>
}

const getTitle = <QueryParams>(title: string | ((params: QueryParams) => string), queryParams: QueryParams): string => {
  return typeof title === 'function' ? title(queryParams) : title
}

const mergeGroupRows = (allGroupRows: string[][][]): string[][] => {
  return allGroupRows.reduce<string[][]>(
    (acc, groupRows) => acc.flatMap(accRow => groupRows.map((row, index) => [...(index === 0 ? accRow : Array(accRow.length).fill('')), ...row])),
    [[]],
  )
}

const collectGroups = <Data, QueryParams>(fields: ListFields<Data, QueryParams>, queryParams: QueryParams): ColumnGroupDef<Data, QueryParams>[] => {
  const groups: ColumnGroupDef<Data, QueryParams>[] = []

  for (const field of fields) {
    const meta = field.meta

    if ('keyArray' in meta || 'getterArray' in meta) {
      const getItems = 'keyArray' in meta ? (item: Data) => (item[meta.keyArray] as unknown[]) ?? [] : (item: Data) => meta.getterArray(item) as unknown[]
      const innerGroups = collectGroups(meta.fields, queryParams)
      const innerHeaders = innerGroups.flatMap(g => g.headers)

      groups.push({
        headers: innerHeaders,
        getRows: async (item, qp) => {
          const items = getItems(item)
          if (items.length === 0) return [innerHeaders.map(() => '')]
          const rowsPerItem = await Promise.all(
            items.map(async inner => {
              const allGroupRows = await Promise.all(innerGroups.map(g => g.getRows(inner as Data, qp)))
              return mergeGroupRows(allGroupRows)
            }),
          )
          return rowsPerItem.flat()
        },
      })
    } else if ('keyEntity' in meta || 'getterEntity' in meta) {
      const getEntity = 'keyEntity' in meta ? (item: Data) => item[meta.keyEntity] : (item: Data) => meta.getterEntity(item)
      const innerGroups = collectGroups(meta.fields, queryParams)
      const innerHeaders = innerGroups.flatMap(g => g.headers)

      groups.push({
        headers: innerHeaders,
        getRows: async (item, qp) => {
          const entity = getEntity(item)
          if (entity == null) return [innerHeaders.map(() => '')]
          const allGroupRows = await Promise.all(innerGroups.map(g => g.getRows(entity as Data, qp)))
          return mergeGroupRows(allGroupRows)
        },
      })
    } else if ('fields' in meta) {
      groups.push(...collectGroups(meta.fields, queryParams))
    } else {
      const listField = meta

      groups.push({
        headers: [getTitle(listField.title, queryParams)],
        getRows: async (item, qp) => [[await listField.textFormat?.(item, qp) ?? '']],
      })
    }
  }

  return groups
}

export const buildExportColumns = <Data, QueryParams>(fields: ListFields<Data, QueryParams>, queryParams: QueryParams) => {
  const groups = collectGroups(fields, queryParams)

  const header = groups.flatMap(g => g.headers)
  header.unshift('')

  return {
    header,
    prepare: async (item: Data, index: number): Promise<string[][]> => {
      const indexString = String(index + 1)
      const allGroupRows = await Promise.all(groups.map(g => g.getRows(item, queryParams)))
      const merged = mergeGroupRows(allGroupRows)
      for (const row of merged) {
        row.unshift(indexString)
      }
      return merged
    },
  }
}
