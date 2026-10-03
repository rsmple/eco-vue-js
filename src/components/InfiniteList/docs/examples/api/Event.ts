import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {paginateList} from 'eco-vue-js/dist/utils/useDefaultQuery'

export enum EventLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export type Event = {
  id: number
  level: EventLevel
  message: string
  at: Date
}

export type QueryParamsEvents = {
  page?: number
  size?: number
}

export const EVENT_COUNT = 10_000

const MESSAGES: [EventLevel, string][] = [
  [EventLevel.INFO, 'Watering finished in'],
  [EventLevel.INFO, 'Moisture reading from'],
  [EventLevel.WARNING, 'Soil drying out in'],
  [EventLevel.INFO, 'Sprinklers started in'],
  [EventLevel.ERROR, 'Sensor offline in'],
  [EventLevel.WARNING, 'Frost expected in'],
  [EventLevel.INFO, 'Harvest logged in'],
]

const BEDS = ['the greenhouse', 'the herb bed', 'the orchard', 'the seed trays', 'the balcony', 'the tomato row', 'the rose bed']

const start = Date.now()

/** Ten thousand events, newest first, a minute apart. */
const events: Event[] = Array.from({length: EVENT_COUNT}, (_, index) => {
  const [level, message] = MESSAGES[index * 5 % MESSAGES.length]!

  return {
    id: index + 1,
    level,
    message: `${ message } ${ BEDS[index * 3 % BEDS.length] }`,
    at: new Date(start - index * 60_000),
  }
})

/** Stands in for a request to the API: answers after a moment with one page. */
const respond = <Data>(handler: () => Data) => new Promise<Data>(resolve => {
  setTimeout(() => resolve(structuredClone(handler())), 300)
})

export const eventModelApi = createRestModelApi({
  modelKey: 'Event',
  model: {} as Event,
  queries: {
    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Event>,
      isQueryParams: (value: unknown): value is QueryParamsEvents | undefined => value === undefined || value instanceof Object,
      queryFn: ({queryKey}) => respond(() => paginateList(events, queryKey[2]?.page, queryKey[2]?.size)),
    },
  },
})
