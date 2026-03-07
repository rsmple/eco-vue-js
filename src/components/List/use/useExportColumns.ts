import type {ListFields} from '../types'
 
type ColumnDef<Data, QueryParams> = {
  header: string
   
  getValue: (item: Data, queryParams: QueryParams) => string | Promise<string>
}

const getTitle = <QueryParams>(title: string | ((params: QueryParams) => string), queryParams: QueryParams): string => {
  return typeof title === 'function' ? title(queryParams) : title
}

const collectColumns = <Data, QueryParams>(fields: ListFields<Data, QueryParams>, queryParams: QueryParams): ColumnDef<Data, QueryParams>[] => {
  const columns: ColumnDef<Data, QueryParams>[] = []

  for (const field of fields) {
    const meta = field.meta

    if ('keyArray' in meta || 'getterArray' in meta) {
      const innerFields = meta.fields

      const getItems = 'keyArray' in meta ? (item: Data) => (item[meta.keyArray] as unknown[]) ?? [] : (item: Data) => meta.getterArray(item) as unknown[]

      const innerColumns = collectColumns(innerFields, queryParams)

      for (const col of innerColumns) {
        columns.push({
          header: col.header,
          getValue: async (item, qp) => {
            const items = getItems(item)
            return (await Promise.all(items.map((inner: unknown) => col.getValue(inner, qp)))).join('; ')
          },
        })
      }
    } else if ('keyEntity' in meta || 'getterEntity' in meta) {
      const innerFields = meta.fields

      const getEntity = 'keyEntity' in meta ? (item: Data) => item[meta.keyEntity] : (item: Data) => meta.getterEntity(item)

      const innerColumns = collectColumns(innerFields, queryParams)

      for (const col of innerColumns) {
        columns.push({
          header: col.header,
          getValue: (item, qp) => {
            const entity = getEntity(item)
            return entity != null ? col.getValue(entity, qp) : ''
          },
        })
      }
    } else if ('fields' in meta) {
      columns.push(...collectColumns(meta.fields, queryParams))
    } else {
      const listField = meta

      columns.push({
        header: getTitle(listField.title, queryParams),
        getValue: async (item, qp) => await listField.textFormat?.(item, qp) ?? '',
      })
    }
  }

  return columns
}

export const buildExportColumns = <Data, QueryParams>(fields: ListFields<Data, QueryParams>, queryParams: QueryParams) => {
  const columns = collectColumns(fields, queryParams)

  return {
    header: columns.map(col => col.header),
    prepare: (item: Data) => Promise.all(columns.map(col => col.getValue(item, queryParams))),
  }
}
