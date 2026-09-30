import {createUseQueryParams} from 'eco-vue-js/dist/utils/api'
import {Order, parseOrdering} from 'eco-vue-js/dist/utils/order'
import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {paginateList} from 'eco-vue-js/dist/utils/useDefaultQuery'
import {isId, parseString} from 'eco-vue-js/dist/utils/utils'

import {type Book, books} from '../models/Book'

/** The filters a user sets on the list. In an app they are kept in the URL. */
export const useQueryParamsBooks = createUseQueryParams({
  search: parseString,
  ordering: parseString,
})

export type QueryParamsBooks = typeof useQueryParamsBooks['QueryParams'] & {
  page?: number
  /** Comma-separated ids — how async selects look up the items behind their model value. */
  id__in?: string
}

let source = books

/** Stands in for a request to the API: answers after a moment with a copy of the data. */
const respond = <Data>(handler: () => Data) => new Promise<Data>(resolve => {
  setTimeout(() => resolve(structuredClone(handler())), 300)
})

const toSortable = (value: Book[keyof Book]) => value instanceof Date ? value.getTime() : value

/** Sorts in `direction`, with empty values last either way. */
const compare = (a: Book, b: Book, field: keyof Book, direction: 1 | -1) => {
  const left = toSortable(a[field])
  const right = toSortable(b[field])

  if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1

  return direction * (typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right)))
}

/** Filters and sorts by the same query params a backend would receive. */
const filterBooks = (queryParams: QueryParamsBooks | undefined) => {
  const search = queryParams?.search?.trim().toLowerCase()
  const ids = queryParams?.id__in?.split(',').map(Number)
  let result = search
    ? source.filter(book => book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search))
    : source

  if (ids) result = result.filter(book => ids.includes(book.id))

  if (queryParams?.ordering) {
    const [{field, order}] = parseOrdering<keyof Book>(queryParams.ordering)

    result = result.toSorted((a, b) => compare(a, b, field, order === Order.DESC ? -1 : 1))
  }

  return result
}

export const bookModelApi = createRestModelApi({
  modelKey: 'Book',
  model: {} as Book,
  queries: {
    item: {
      scope: 'item',
      dataType: {} as Book,
      isQueryParams: isId,
      queryFn: ({queryKey}) => respond(() => source.find(book => book.id === queryKey[2])!),
      actions: {
        // In an app, a PATCH to `/books/<id>/`.
        update: ({set}, id, payload: Partial<Book>) => respond(() => {
          source = source.map(book => book.id === id ? {...book, ...payload} : book)

          return source.find(book => book.id === id)!
        })
          .then(book => {
            // Puts the saved book into every cached page that holds it.
            set(book)

            return book
          }),

        // In an app, a DELETE to `/books/<id>/`.
        delete: (context, id) => respond(() => {
          source = source.filter(book => book.id !== id)
        })
          // Drops the book from every cached page.
          .then(() => () => null),
      },
    },

    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Book>,
      isQueryParams: (value: unknown): value is QueryParamsBooks | undefined => value === undefined || value instanceof Object,
      // In an app, a GET to `/books/` with the query params.
      queryFn: ({queryKey}) => respond(() => paginateList(filterBooks(queryKey[2]), queryKey[2]?.page, 10)),
    },
  },
})
