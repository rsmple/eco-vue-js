import {reactive} from 'vue'

import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {paginateList} from 'eco-vue-js/dist/utils/useDefaultQuery'
import {isId} from 'eco-vue-js/dist/utils/utils'

export type Task = {
  id: number
  title: string
  done: boolean
}

export type QueryParamsTasks = {
  page?: number
}

let tasks: Task[] = [
  {id: 1, title: 'Rotate the API keys', done: false},
  {id: 2, title: 'Review the new scanner rules', done: true},
  {id: 3, title: 'Update the base images', done: false},
  {id: 4, title: 'Close the stale findings', done: false},
]

/** Lets the demo make every request fail, to show the rollback. */
export const server = reactive({fail: false})

/** Stands in for a request to the API: answers after half a second, or fails. */
const respond = <Data>(handler: () => Data) => new Promise<Data>((resolve, reject) => {
  setTimeout(() => {
    if (server.fail) reject(new Error('Server error'))
    else resolve(structuredClone(handler()))
  }, 500)
})

export const taskModelApi = createRestModelApi({
  modelKey: 'Task',
  model: {} as Task,
  queries: {
    item: {
      scope: 'item',
      dataType: {} as Task,
      isQueryParams: isId,
      queryFn: ({queryKey}) => respond(() => tasks.find(task => task.id === queryKey[2])!),
      actions: {
        update: ({update, set}, id, payload: Partial<Task>) => {
          // Shows the change at once, in every cached query holding the task. Rolled back if the request fails.
          update(task => ({...task, ...payload}))

          return respond(() => {
            tasks = tasks.map(task => task.id === id ? {...task, ...payload} : task)

            return tasks.find(task => task.id === id)!
          })
            .then(task => set(task))
        },
      },
    },

    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Task>,
      isQueryParams: (value: unknown): value is QueryParamsTasks | undefined => value === undefined || value instanceof Object,
      queryFn: ({queryKey}) => respond(() => paginateList(tasks, queryKey[2]?.page)),
    },
  },
})
