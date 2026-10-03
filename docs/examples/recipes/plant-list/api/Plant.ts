import {createUseQueryParams} from 'eco-vue-js/dist/utils/api'
import {Order, parseOrdering} from 'eco-vue-js/dist/utils/order'
import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {paginateList} from 'eco-vue-js/dist/utils/useDefaultQuery'
import {isId, parseBoolean, parseId, parseString, parseStringList} from 'eco-vue-js/dist/utils/utils'

import {Kind, Light, type Plant, plants} from '../models/Plant'

/** Parses a comma-separated list, dropping values that are not in `values`, such as ones edited into the URL by hand. */
const parseEnumList = <Value extends string>(values: Value[]): ParseFn<Value[]> => value => {
  return parseStringList(value)?.filter((item): item is Value => (values as string[]).includes(item))
}

/** The filters a user sets on the list. In an app they are kept in the URL. */
export const useQueryParamsPlants = createUseQueryParams({
  search: parseString,
  ordering: parseString,
  kind__in: parseEnumList(Object.values(Kind)),
  light__in: parseEnumList(Object.values(Light)),
  watered: parseBoolean,
  caretaker: parseId,
})

export type QueryParamsPlants = typeof useQueryParamsPlants['QueryParams'] & {
  page?: number
  /** Comma-separated ids — how async selects look up the items behind their model value. */
  id__in?: string
}

let source = plants

/** Stands in for a request to the API: answers after a moment with a copy of the data. */
const respond = <Data>(handler: () => Data) => new Promise<Data>(resolve => {
  setTimeout(() => resolve(structuredClone(handler())), 300)
})

const toSortable = (value: Plant[keyof Plant]) => value instanceof Date ? value.getTime() : value

/** Sorts in `direction`, with empty values last either way. */
const compare = (a: Plant, b: Plant, field: keyof Plant, direction: 1 | -1) => {
  const left = toSortable(a[field])
  const right = toSortable(b[field])

  if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1

  return direction * (typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right)))
}

/** Filters and sorts by the same query params a backend would receive. */
const filterPlants = (queryParams: QueryParamsPlants | undefined) => {
  const {kind__in, light__in, watered, caretaker} = queryParams ?? {}
  const search = queryParams?.search?.trim().toLowerCase()
  const ids = queryParams?.id__in?.split(',').map(Number)
  let result = search
    ? source.filter(plant => plant.name.toLowerCase().includes(search) || plant.species.toLowerCase().includes(search))
    : source

  if (ids) result = result.filter(plant => ids.includes(plant.id))
  if (kind__in) result = result.filter(plant => kind__in.includes(plant.kind))
  if (light__in) result = result.filter(plant => light__in.includes(plant.light))
  if (watered !== undefined) result = result.filter(plant => plant.watered === watered)
  if (caretaker) result = result.filter(plant => plant.caretaker.id === caretaker)

  if (queryParams?.ordering) {
    const ordering = parseOrdering<keyof Plant>(queryParams.ordering)

    // Each next field breaks the ties of the ones before it.
    result = result.toSorted((a, b) => {
      for (const {field, order} of ordering) {
        const difference = compare(a, b, field, order === Order.DESC ? -1 : 1)

        if (difference !== 0) return difference
      }

      return 0
    })
  }

  return result
}

export const plantModelApi = createRestModelApi({
  modelKey: 'Plant',
  model: {} as Plant,
  queries: {
    item: {
      scope: 'item',
      dataType: {} as Plant,
      isQueryParams: isId,
      queryFn: ({queryKey}) => respond(() => source.find(plant => plant.id === queryKey[2])!),
      actions: {
        // In an app, a PATCH to `/plants/<id>/`.
        update: ({set}, id, payload: Partial<Plant>) => respond(() => {
          source = source.map(plant => plant.id === id ? {...plant, ...payload} : plant)

          return source.find(plant => plant.id === id)!
        })
          .then(plant => {
            // Puts the saved plant into every cached page that holds it.
            set(plant)

            return plant
          }),

        // In an app, a DELETE to `/plants/<id>/`.
        delete: (context, id) => respond(() => {
          source = source.filter(plant => plant.id !== id)
        })
          // Drops the plant from every cached page.
          .then(() => () => null),
      },
    },

    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Plant>,
      isQueryParams: (value: unknown): value is QueryParamsPlants | undefined => value === undefined || value instanceof Object,
      // In an app, a GET to `/plants/` with the query params.
      queryFn: ({queryKey}) => respond(() => paginateList(filterPlants(queryKey[2]), queryKey[2]?.page, 10)),
    },
  },
})
