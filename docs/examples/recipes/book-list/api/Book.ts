import {Order, parseOrdering} from 'eco-vue-js/dist/utils/order'
import {makeQueryPaginated} from 'eco-vue-js/dist/utils/useDefaultQuery'

import {type Book, type QueryParamsBooks, books} from '../models/Book'

let source = books

const compare = (a: Book, b: Book, field: keyof Book) => {
  const left = a[field]
  const right = b[field]

  return typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))
}

/**
 * Stands in for a paginated endpoint: filters and sorts by the same query params a backend would receive.
 * In an app this is a request to the API — the list component does not know the difference.
 */
export const useQueryBooks = makeQueryPaginated<Book, QueryParamsBooks>(
  'book',
  queryParams => {
    const search = queryParams.search?.trim().toLowerCase()
    const ids = queryParams.id__in?.split(',').map(Number)
    let result = search
      ? source.filter(book => book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search))
      : source

    if (ids) result = result.filter(book => ids.includes(book.id))

    if (queryParams.ordering) {
      const [{field, order}] = parseOrdering<keyof Book>(queryParams.ordering)

      result = result.toSorted((a, b) => compare(a, b, field) * (order === Order.DESC ? -1 : 1))
    }

    return result
  },
  list => source = list,
  10,
)
