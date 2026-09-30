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
  [EventLevel.INFO, 'Scan finished for'],
  [EventLevel.INFO, 'New commit pushed to'],
  [EventLevel.WARNING, 'Outdated dependency found in'],
  [EventLevel.INFO, 'Pipeline started for'],
  [EventLevel.ERROR, 'Build failed for'],
  [EventLevel.WARNING, 'Secret detected in'],
  [EventLevel.INFO, 'Report exported for'],
]

const REPOSITORIES = ['api-gateway', 'billing', 'web-app', 'auth-service', 'mobile', 'infra', 'search']

const start = Date.now()

/** Ten thousand events, newest first, a minute apart. */
const events: Event[] = Array.from({length: EVENT_COUNT}, (_, index) => {
  const [level, message] = MESSAGES[index * 5 % MESSAGES.length]!

  return {
    id: index + 1,
    level,
    message: `${ message } ${ REPOSITORIES[index * 3 % REPOSITORIES.length] }`,
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
