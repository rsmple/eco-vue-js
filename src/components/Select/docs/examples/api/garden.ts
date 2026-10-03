import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {paginateList} from 'eco-vue-js/dist/utils/useDefaultQuery'

export enum Crop {
  TOMATO = 'Tomato',
  PEPPER = 'Pepper',
  SQUASH = 'Squash',
  BEAN = 'Bean',
  KALE = 'Kale',
  CUCUMBER = 'Cucumber',
  EGGPLANT = 'Eggplant',
  BEET = 'Beet',
  RADISH = 'Radish',
  CARROT = 'Carrot',
}

/** Each crop gets one of the theme's data colors, used as a tone: `text-tone`, `bg-tone-soft`, `surface-fill`. */
export const cropToneMap: Record<Crop, string> = {
  [Crop.TOMATO]: 'tone-data-red',
  [Crop.PEPPER]: 'tone-data-orange',
  [Crop.SQUASH]: 'tone-data-amber',
  [Crop.BEAN]: 'tone-data-green',
  [Crop.KALE]: 'tone-data-teal',
  [Crop.CUCUMBER]: 'tone-data-cyan',
  [Crop.EGGPLANT]: 'tone-data-violet',
  [Crop.BEET]: 'tone-data-fuchsia',
  [Crop.RADISH]: 'tone-data-pink',
  [Crop.CARROT]: 'tone-data-orange',
}

/** A tray of seeds sown into a bed on one day. */
export type Batch = {
  id: number
  bed: string
  sownAt: Date
  crops: Crop[]
  sprouted: number
  waiting: number
  lost: number
}

/** A seed variety from the catalogue. Months are 0-based. */
export type Variety = {
  id: number
  name: string
  crop: Crop
  heirloom: boolean
  organic: boolean
  frostHardy: boolean
  /** Days to germinate, from and to. */
  germination: [number, number]
  /** Days from sowing to the first harvest. */
  harvest: number
  sowMonths: number[]
  harvestMonths: number[]
}

type QueryParams = {
  page?: number
  search?: string
  /** Comma-separated ids — how async selects look up the items behind their model value. */
  id__in?: string
}

const batches: Batch[] = ([
  ['Bed 1', [2, 3], [Crop.TOMATO, Crop.PEPPER], 18, 4, 2],
  ['Bed 2', [2, 9], [Crop.KALE], 22, 0, 1],
  ['Bed 3', [2, 17], [Crop.BEET, Crop.RADISH, Crop.CARROT], 31, 12, 5],
  ['Bed 4', [2, 24], [Crop.BEAN], 9, 14, 0],
  ['Bed 5', [3, 1], [Crop.SQUASH, Crop.CUCUMBER], 6, 8, 4],
  ['Greenhouse A', [3, 6], [Crop.EGGPLANT, Crop.PEPPER], 12, 2, 0],
  ['Greenhouse B', [3, 14], [Crop.TOMATO], 24, 6, 3],
  ['Bed 6', [3, 21], [Crop.RADISH], 40, 0, 2],
  ['Bed 7', [4, 2], [Crop.BEAN, Crop.SQUASH], 3, 20, 1],
  ['Cold frame', [4, 11], [Crop.KALE, Crop.BEET], 0, 16, 0],
] as const).map(([bed, [month, day], crops, sprouted, waiting, lost], index) => ({
  id: index + 1,
  bed,
  sownAt: new Date(2026, month, day),
  crops: [...crops],
  sprouted,
  waiting,
  lost,
}))

const months = (from: number, to: number) => Array.from({length: to - from + 1}, (_, index) => from + index)

const varieties: Variety[] = ([
  ['Cherokee Purple', Crop.TOMATO, true, true, false, [6, 14], 80, months(2, 3), months(6, 8)],
  ['Sungold', Crop.TOMATO, false, false, false, [5, 10], 65, months(2, 3), months(6, 9)],
  ['Brandywine', Crop.TOMATO, true, true, false, [6, 14], 90, months(2, 3), months(7, 8)],
  ['California Wonder', Crop.PEPPER, true, false, false, [8, 21], 75, months(1, 2), months(7, 9)],
  ['Early Jalapeño', Crop.PEPPER, false, true, false, [8, 16], 65, months(1, 2), months(6, 9)],
  ['Waltham Butternut', Crop.SQUASH, true, true, false, [5, 10], 100, months(4, 5), months(8, 9)],
  ['Blue Lake', Crop.BEAN, true, false, false, [6, 10], 58, months(4, 6), months(6, 8)],
  ['Kentucky Wonder', Crop.BEAN, true, true, false, [6, 12], 65, months(4, 6), months(7, 9)],
  ['Lacinato', Crop.KALE, true, true, true, [5, 8], 60, [2, 3, 6, 7], [5, 6, 9, 10, 11]],
  ['Red Russian', Crop.KALE, true, false, true, [5, 8], 50, [2, 3, 7], [4, 5, 9, 10, 11]],
  ['Marketmore 76', Crop.CUCUMBER, false, true, false, [4, 10], 68, months(4, 5), months(6, 8)],
  ['Listada de Gandia', Crop.EGGPLANT, true, true, false, [7, 14], 85, months(1, 2), months(7, 8)],
  ['Detroit Dark Red', Crop.BEET, true, false, true, [5, 12], 60, months(2, 6), months(5, 9)],
  ['Chioggia', Crop.BEET, true, true, true, [5, 12], 55, months(2, 6), months(5, 9)],
  ['French Breakfast', Crop.RADISH, true, true, true, [3, 7], 25, [2, 3, 4, 7, 8], [3, 4, 5, 8, 9]],
  ['Cherry Belle', Crop.RADISH, false, false, true, [3, 7], 24, [2, 3, 4, 7, 8], [3, 4, 5, 8, 9]],
  ['Danvers', Crop.CARROT, true, true, true, [10, 21], 75, months(2, 5), months(6, 10)],
] as const).map(([name, crop, heirloom, organic, frostHardy, germination, harvest, sowMonths, harvestMonths], index) => ({
  id: index + 1,
  name,
  crop,
  heirloom,
  organic,
  frostHardy,
  germination: [...germination],
  harvest,
  sowMonths: [...sowMonths],
  harvestMonths: [...harvestMonths],
}))

/** Stands in for a request to the API: answers after a moment with a copy of the data. */
const respond = <Data>(handler: () => Data) => new Promise<Data>(resolve => {
  setTimeout(() => resolve(structuredClone(handler())), 600)
})

/** Searches the given fields and filters by `id__in`, as a backend would. */
const filterList = <Item extends {id: number}>(list: Item[], queryParams: QueryParams | undefined, fields: (item: Item) => string[]) => {
  const search = queryParams?.search?.trim().toLowerCase()
  const ids = queryParams?.id__in?.split(',').map(Number)

  return list
    .filter(item => !search || fields(item).some(field => field.toLowerCase().includes(search)))
    .filter(item => !ids || ids.includes(item.id))
}

const isQueryParams = (value: unknown): value is QueryParams | undefined => value === undefined || value instanceof Object

export const batchModelApi = createRestModelApi({
  modelKey: 'Batch',
  model: {} as Batch,
  queries: {
    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Batch>,
      isQueryParams,
      // In an app, a GET to `/batches/` with the query params.
      queryFn: ({queryKey}) => respond(() => paginateList(filterList(batches, queryKey[2], item => [item.bed, ...item.crops]), queryKey[2]?.page, 6)),
    },
  },
})

export const varietyModelApi = createRestModelApi({
  modelKey: 'Variety',
  model: {} as Variety,
  queries: {
    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Variety>,
      isQueryParams,
      // In an app, a GET to `/varieties/` with the query params.
      queryFn: ({queryKey}) => respond(() => paginateList(filterList(varieties, queryKey[2], item => [item.name, item.crop]), queryKey[2]?.page, 6)),
    },
  },
})
