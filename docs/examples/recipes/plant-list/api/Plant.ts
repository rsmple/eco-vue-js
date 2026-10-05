import {createUseQueryParams} from 'eco-vue-js/dist/utils/api'
import {Order, parseOrdering} from 'eco-vue-js/dist/utils/order'
import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {paginateList} from 'eco-vue-js/dist/utils/useDefaultQuery'
import type {QueryParamsSelection} from 'eco-vue-js/dist/utils/useSelected'
import {isId, parseBoolean, parseId, parseString, parseStringList} from 'eco-vue-js/dist/utils/utils'

import {gardeners} from '../../../shared/Gardener'
import {Kind, Light, type Plant, plants} from '../models/Plant'

/** What the API takes to create or change a plant: the caretaker goes by id. */
export type PlantPayload = Partial<Omit<Plant, 'caretaker'> & {caretaker: number}>

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

/** The filters, plus the selection a bulk action narrows them to. */
export type QueryParamsPlants = typeof useQueryParamsPlants['QueryParams'] & Omit<QueryParamsSelection, 'id__in'> & {
  page?: number
  /** Ids — comma-separated when async selects look up the items behind their model value, an array for the rows picked in the list. */
  id__in?: string | number[]
}

let source = plants

/** Stands in for a request to the API: answers after a moment with a copy of the data. */
const respond = <Data>(handler: () => Data) => new Promise<Data>(resolve => {
  setTimeout(() => resolve(structuredClone(handler())), 300)
})

/** Copies a value the way sending it would: a form's payload holds its reactive objects, which cannot be stored or cloned. */
const toPlain = <Value>(value: Value): Value => {
  if (Array.isArray(value)) return value.map(toPlain) as Value
  if (value instanceof Date) return new Date(value) as Value
  if (value instanceof Object) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toPlain(item)])) as Value

  return value
}

/** Applies a payload the way the backend would, looking up the caretaker by id. */
const applyPayload = (plant: Plant, {caretaker, ...payload}: PlantPayload): Plant => ({
  ...plant,
  ...toPlain(payload),
  caretaker: gardeners.find(item => item.id === caretaker) ?? plant.caretaker,
})

/** The defaults the backend fills in for a new plant. */
const createPlant = (payload: PlantPayload): Plant => {
  const today = new Date()
  const height = payload.height ?? 0

  return applyPayload({
    id: Math.max(0, ...source.map(plant => plant.id)) + 1,
    name: '',
    species: '',
    kind: Kind.TROPICAL,
    height,
    watered: true,
    humidity: 50,
    seeds: 0,
    water: 200,
    waterBy: null,
    light: Light.BRIGHT,
    health: 100,
    growth: [{date: +today, height}],
    waterings: [today],
    temperature: [16, 26],
    caretaker: gardeners[0]!,
    tasks: [],
    description: '',
  }, payload)
}

const toSortable =(value: Plant[keyof Plant]) => value instanceof Date ? value.getTime() : value

/** Sorts in `direction`, with empty values last either way. */
const compare = (a: Plant, b: Plant, field: keyof Plant, direction: 1 | -1) => {
  const left = toSortable(a[field])
  const right = toSortable(b[field])

  if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1

  return direction * (typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right)))
}

/** Filters and sorts by the same query params a backend would receive, then narrows to the selection. */
const filterPlants = (queryParams: QueryParamsPlants | undefined) => {
  const {kind__in, light__in, watered, caretaker, id__not_in, slice_indexes} = queryParams ?? {}
  const search = queryParams?.search?.trim().toLowerCase()
  const ids = typeof queryParams?.id__in === 'string' ? queryParams.id__in.split(',').map(Number) : queryParams?.id__in
  let result = search
    ? source.filter(plant => plant.name.toLowerCase().includes(search) || plant.species.toLowerCase().includes(search))
    : source

  if (ids) result = result.filter(plant => ids.includes(plant.id))
  if (id__not_in) result = result.filter(plant => !id__not_in.includes(plant.id))
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

  // A range picked with Shift is the positions in the sorted list, both ends included.
  if (slice_indexes) result = result.slice(slice_indexes[0], slice_indexes[1] + 1)

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
        update: ({set}, id, payload: PlantPayload) => respond(() => {
          source = source.map(plant => plant.id === id ? applyPayload(plant, payload) : plant)

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

    list: {
      scope: 'list',
      dataType: [] as Plant[],
      // In an app, a GET to `/plants/` without pagination — for selects.
      queryFn: () => respond(() => source.toSorted((a, b) => a.name.localeCompare(b.name))),
      actions: {
        // In an app, a POST to `/plants/`.
        create: ({set, invalidate}, payload: PlantPayload) => respond(() => {
          const plant = createPlant(payload)

          source = [...source, plant]

          return plant
        })
          .then(plant => {
            // Caches the new plant for its item query, and refetches the lists it may now appear in.
            set(plant)
            invalidate()

            return plant
          }),
      },
    },

    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Plant>,
      isQueryParams: (value: unknown): value is QueryParamsPlants | undefined => value === undefined || value instanceof Object,
      // In an app, a GET to `/plants/` with the query params.
      queryFn: ({queryKey}) => respond(() => paginateList(filterPlants(queryKey[2]), queryKey[2]?.page, 10)),
      actions: {
        // In an app, a PATCH to `/plants/bulk/` with the filters and the selection as query params.
        updateMany: ({invalidate}, queryParams, payload: PlantPayload) => respond(() => {
          const ids = new Set(filterPlants(queryParams).map(plant => plant.id))

          source = source.map(plant => ids.has(plant.id) ? applyPayload(plant, payload) : plant)
        })
          // Refetches every cached page, since the change can move plants in and out of the filters.
          .then(() => invalidate()),

        // In an app, a DELETE to `/plants/bulk/` with the filters and the selection as query params.
        deleteMany: ({invalidate}, queryParams) => respond(() => {
          const ids = new Set(filterPlants(queryParams).map(plant => plant.id))

          source = source.filter(plant => !ids.has(plant.id))
        })
          .then(() => invalidate()),
      },
    },
  },
})
