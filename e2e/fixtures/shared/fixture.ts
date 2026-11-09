import {type Ref, ref} from 'vue'

import type {UniformScope, UniformScopeField} from 'eco-vue-js/dist/components/Uniform/types'
import {ApiError, ApiErrorCancel} from 'eco-vue-js/dist/utils/api'

/** The fixture's options, from the query string: `?name=uniform/Submit&fullPayload&api=sync`. */
export const fixtureParams = (): URLSearchParams => new URLSearchParams(typeof location === 'undefined' ? '' : location.search)

export const hasParam = (key: string): boolean => fixtureParams().has(key)

type Controls = Record<string, (...args: never[]) => unknown>

/** Functions the tests call with `page.evaluate(() => window.fixture.<name>(...))`. */
export const exposeControls = (controls: Controls): void => {
  if (typeof window === 'undefined') return

  const target = window as unknown as {fixture?: Controls}

  target.fixture = {...target.fixture, ...controls}
}

const clone = <Value>(value: Value): Value => value === undefined ? value : JSON.parse(JSON.stringify(value)) as Value

const isPlainObject = (value: unknown): value is Record<string, unknown> => value instanceof Object && !Array.isArray(value)

const merge = <Value>(target: Value, source: unknown): Value => {
  if (!isPlainObject(target) || !isPlainObject(source)) return clone(source) as Value

  const result: Record<string, unknown> = {...target}

  for (const key of Object.keys(source)) result[key] = merge(target[key], source[key])

  return result as Value
}

type Call = {payload: unknown, status: 'pending' | 'resolved' | 'rejected'}

/**
 * Stands in for an API that saves `Model`. Each call stays pending until a test settles the oldest one:
 * - `save()` merges the payload into the stored model and resolves with the whole of it, as a REST update does;
 * - `resolve(value)` resolves with the given value, `saveResponse()` with `{data}` as a raw response;
 * - `reject(data, status)` rejects with an ApiError carrying `data`, `cancel()` with an ApiErrorCancel.
 *
 * With `?api=sync` it saves at once and returns the stored model without a promise.
 */
export const useMockApi = <Model>(initial: Model, prefix = '') => {
  const stored = ref(clone(initial)) as Ref<Model>
  const calls = ref<Call[]>([])
  const pending: {index: number, resolve: (value: unknown) => void, reject: (error: unknown) => void}[] = []

  const sync = fixtureParams().get('api') === 'sync'

  const method = (payload: unknown) => {
    calls.value.push({payload: clone(payload), status: 'pending'})

    const index = calls.value.length - 1

    if (sync) {
      calls.value[index]!.status = 'resolved'
      stored.value = merge(stored.value, payload)

      return clone(stored.value)
    }

    return new Promise<Model>((resolve, reject) => {
      pending.push({index, resolve: resolve as (value: unknown) => void, reject})
    })
  }

  const next = (status: Call['status']) => {
    const item = pending.shift()

    if (!item) throw new Error('No pending call')

    calls.value[item.index]!.status = status

    return {...item, payload: calls.value[item.index]!.payload}
  }

  exposeControls({
    [`${ prefix }save`]: () => {
      const item = next('resolved')

      stored.value = merge(stored.value, item.payload)
      item.resolve(clone(stored.value))
    },
    [`${ prefix }saveResponse`]: () => {
      const item = next('resolved')

      stored.value = merge(stored.value, item.payload)
      item.resolve({data: clone(stored.value)})
    },
    [`${ prefix }resolve`]: (value: unknown) => next('resolved').resolve(value),
    [`${ prefix }reject`]: (data: unknown, status = 400) => next('rejected').reject(new ApiError({data, status} as RequestResponse<never>)),
    [`${ prefix }cancel`]: () => next('rejected').reject(new ApiErrorCancel({status: 0} as RequestResponse<undefined>)),
  })

  return {method, calls, stored}
}

/** The parts of a field's scope the tests check. */
export const fieldState = <Value>(scope: UniformScopeField<Value>) => ({
  title: scope.title,
  modelValue: scope.modelValue,
  errorMessage: scope.errorMessage ?? null,
  hasChanges: scope.hasChanges ?? null,
  hasValue: scope.hasValue,
  required: scope.required ?? false,
  loading: scope.loading ?? false,
  disabled: scope.disabled ?? false,
  readonly: scope.readonly ?? false,
  skeleton: scope.skeleton ?? false,
  async: scope.async ?? false,
})

/** The parts of a form's scope the tests check. */
export const formState = <Value>(scope: UniformScope<Value>) => ({
  modelValue: scope.modelValue,
  modelValueInit: scope.modelValueInit,
  hasChanges: scope.hasChanges ?? null,
  submitting: scope.submitting ?? false,
  disabled: scope.disabled ?? false,
  readonly: scope.readonly ?? false,
  skeleton: scope.skeleton ?? false,
  async: scope.async ?? false,
})
