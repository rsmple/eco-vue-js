import type {QueryParamsListBulk, QueryParamsListBulkString} from './queryParams'
import type {QueryFunction, QueryKey} from '@tanstack/vue-query'
import type {MaybeRef} from 'vue'

import {unref} from 'vue'

import {
  type QueryItemUpdater,
  type QueryModel,
  type QueryModelId,
  type QueryScope,
  type QueryScopeModel,
  setQueryItems,
  snapshotQueries,
  updateQueryItems,
} from '@/utils/queryCache'
import {type DefaultQueryOptions, createDefaultQuery, normalizeQueryParamsValue} from '@/utils/useDefaultQuery'
import {isId} from '@/utils/utils'

import {getMatchingCollectionIds} from './getMatchingCollectionIds'
import {getQueryClient} from './queryClient'
 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAction = (...args: any) => any
type ScopeMap = Record<string, QueryScope>
type ParamsMap = Record<string, unknown>
type DataMap = Record<string, unknown>

type ModelBound<Scopes extends ScopeMap> = [Exclude<Scopes[keyof Scopes], 'single'>] extends [never] ? unknown : QueryModel

type DataBound<Model, Scopes extends ScopeMap, Key> = Key extends keyof Scopes
  ? Scopes[Key] extends 'single' ? unknown : QueryScopeModel<Model>[Scopes[Key]]
  : unknown

type QueryMap = Record<string, {
  scope: QueryScope
  isQueryParams?: unknown
  queryFn: unknown
  options?: unknown
  actions?: Record<string, unknown>
}>

type Invalidate = (scope?: QueryScope) => void

export type ActionContext<Model> = {
  update: (updater: QueryItemUpdater<Model>) => void
  set: (item: Model | Model[]) => void
  invalidate: Invalidate
}

export type SingleActionContext<Data> = {
  update: (updater: QuerySingleUpdater<Data>) => void
  set: (data: Data) => void
  invalidate: Invalidate
}

type QuerySingleUpdater<Data> = (data: Data) => Data

type ActionResult<Result, Updater> = Result extends Updater ? void : Result

type QueryRuntime = {
  scope: QueryScope
  isQueryParams?: (value: unknown) => value is unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryFn: QueryFunction<any, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: DefaultQueryOptions<any>
  actions?: Record<string, AnyAction>
}

type ApiRuntime = Record<string, {use: unknown, actions?: Record<string, AnyAction>}>

type ScopeShapes<S extends ScopeMap> = { [K in keyof S]: { scope: S[K] } }
type InferQueries<Q extends QueryMap> = { [K in keyof Q]: Q[K] }

type ActionsOf<Queries extends QueryMap, Key> = Key extends keyof Queries
  ? Queries[Key] extends {actions: infer Actions} ? Actions : NonNullable<unknown>
  : NonNullable<unknown>

type HasActions<Queries extends QueryMap, Key> = Key extends keyof Queries
  ? Queries[Key] extends {actions: Record<string, unknown>} ? true : false
  : false

type ParamsOf<Params, Key> = Key extends keyof Params ? unknown extends Params[Key] ? never : Params[Key] : never
type HasParams<Params, Key> = Key extends keyof Params ? unknown extends Params[Key] ? false : true : false

type IsSingle<Scopes, Key> = Key extends keyof Scopes ? Scopes[Key] extends 'single' ? true : false : false

type DataOf<Datas, Key> = Key extends keyof Datas ? Datas[Key] : never

type ContextOf<Scopes, Datas, Model, Key> = IsSingle<Scopes, Key> extends true
  ? SingleActionContext<DataOf<Datas, Key>>
  : ActionContext<Model>

type UpdaterOf<Scopes, Datas, Model, Key> = IsSingle<Scopes, Key> extends true
  ? QuerySingleUpdater<DataOf<Datas, Key>>
  : QueryItemUpdater<Model>

type ParamsArgs<Params, Key> = HasParams<Params, Key> extends true ? [params: ParamsOf<Params, Key>] : []

type PayloadOf<Fn, WithParams> = WithParams extends true
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ? Fn extends (ctx: any, params: any, payload: infer Payload) => any ? Payload : never
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  : Fn extends (ctx: any, payload: infer Payload) => any ? Payload : never

type DeclaredPayload<Payload> = unknown extends Payload
  ? never
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  : Payload extends ActionContext<any> | SingleActionContext<any> ? never : Payload

type PayloadArgs<Fn, WithParams> = [DeclaredPayload<PayloadOf<Fn, WithParams>>] extends [never]
  ? []
  : [payload: DeclaredPayload<PayloadOf<Fn, WithParams>>]
 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReturnTypeOf<Fn> = Fn extends (...args: any) => any ? ReturnType<Fn> : never

type KeyOf<ModelKey extends string, Scopes, Params, Key> = [
  ModelKey,
  Key extends keyof Scopes ? Scopes[Key] : never,
  ...(Key extends keyof Params ? unknown extends Params[Key] ? [] : [Params[Key]] : []),
]

type DataShapes<
  ModelKey extends string,
  Scopes extends ScopeMap,
  Params extends ParamsMap,
  Datas extends DataMap,
> = {
  [Key in keyof Datas]: {
    // Query type is defined by root model. For case when a query needs to extend root model,
    // it requies one of these: annotating queryFn arguments, set dataType: {} as TargetModel,
    // or annotated options: {select}. Without annotation data type sattles to root model.
    queryFn: QueryFunction<Datas[Key], KeyOf<ModelKey, Scopes, Params, Key>>
    dataType?: Datas[Key]
    options?: DefaultQueryOptions<Datas[Key]>
  }
}

type QueryShapes<
  Model,
  Scopes extends ScopeMap,
  Params extends ParamsMap,
  Datas extends DataMap,
  Queries extends QueryMap,
> = {
  [Key in keyof Params]: {
    isQueryParams?: (value: unknown) => value is Params[Key]
    actions?: {
      [KeyAction in keyof ActionsOf<Queries, Key>]: (
        ...args: [
          context: ContextOf<Scopes, Datas, Model, Key>,
          ...ParamsArgs<Params, Key>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload?: any,
        ]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) => any
    }
  }
}

type RestModelApi<
  ModelKey extends string,
  Model,
  Scopes extends ScopeMap,
  Params extends ParamsMap,
  Datas extends DataMap,
  Queries extends QueryMap,
> = {
  [Key in keyof Scopes]: OmitByType<{
    use: HasParams<Params, Key> extends true
        ? ReturnType<typeof createDefaultQuery<ModelKey, Scopes[Key], DataOf<Datas, Key>, ParamsOf<Params, Key>>>
        : ReturnType<typeof createDefaultQuery<ModelKey, Scopes[Key], DataOf<Datas, Key>>>

    actions: HasActions<Queries, Key> extends true ? {
      [KeyAction in keyof ActionsOf<Queries, Key>]: (
        ...args: [
          ...ParamsArgs<Params, Key>,
          ...PayloadArgs<ActionsOf<Queries, Key>[KeyAction], HasParams<Params, Key>>,
        ]
      ) => Promise<ActionResult<Awaited<ReturnTypeOf<ActionsOf<Queries, Key>[KeyAction]>>, UpdaterOf<Scopes, Datas, Model, Key>>>
    } : never
  }, never>
} & {
  invalidate: (scope?: QueryScope) => Promise<void>
}

export const createRestModelApi = <
  ModelKey extends string,
  Model extends ModelBound<Scopes>,
  Scopes extends ScopeMap,
  Params extends ParamsMap,
  Datas extends {[Key in keyof Scopes]: DataBound<Model, Scopes, Key>},
  Queries extends QueryMap,
>(
    config: {
      modelKey: ModelKey
      model: Model
      queries: 
        & InferQueries<Queries>
        & ScopeShapes<Scopes>
        & DataShapes<ModelKey, Scopes, Params, Datas>
        & QueryShapes<Model, Scopes, Params, Datas, Queries>
    },
  ): RestModelApi<ModelKey, Model, Scopes, Params, Datas, Queries> => {
  const queries: Record<string, QueryRuntime> = config.queries
  const result: ApiRuntime = {}

  const invalidateModel = (scope?: QueryScope) => getQueryClient().invalidateQueries({
    queryKey: scope ? [config.modelKey, scope] : [config.modelKey],
  })

  const paramsOf = (query: QueryRuntime, args: unknown[]): unknown => {
    const params = unref(args[0] as MaybeRef<unknown>)

    return query.isQueryParams?.(undefined) ? normalizeQueryParamsValue(params) : params
  }

  const queryKeyOf = (query: QueryRuntime, args: unknown[]): QueryKey => {
    return query.isQueryParams
      ? [config.modelKey, query.scope, paramsOf(query, args)]
      : [config.modelKey, query.scope]
  }

  const resolveIds = (query: QueryRuntime, args: unknown[]): Set<QueryModelId> | undefined => {
    const queryClient = getQueryClient()

    if (query.scope === 'item') {
      const id = query.isQueryParams
        ? unref(args[0] as MaybeRef<unknown>)
        : queryClient.getQueryData<QueryModel>(queryKeyOf(query, args))?.id

      return isId(id) ? new Set([id]) : new Set()
    }

    if (!query.isQueryParams) return undefined

    return getMatchingCollectionIds<QueryModel, QueryParamsListBulk | QueryParamsListBulkString>(queryClient, config.modelKey, paramsOf(query, args) as QueryParamsListBulk | QueryParamsListBulkString | undefined)
  }

  const setItems = (query: QueryRuntime, args: unknown[], item: QueryModel | QueryModel[]) => {
    const queryClient = getQueryClient()
    const items = Array.isArray(item) ? item : [item]

    if (query.scope === 'item' && items.length) queryClient.setQueryData(queryKeyOf(query, args), items[0])

    setQueryItems(config.modelKey, items, queryClient)
  }

  const withActionContext = (query: QueryRuntime, action: AnyAction): AnyAction => (...args) => {
    const queryClient = getQueryClient()
    let rollback: (() => void) | undefined
    let ids: Set<QueryModelId> | undefined
    let idsResolved = false
    const pendingScopes = new Set<QueryScope | undefined>()

    const snapshot = () => {
      rollback ??= snapshotQueries(config.modelKey, queryClient)
    }

    const updateSingle = (updater: QuerySingleUpdater<unknown>) => {
      snapshot()

      queryClient.setQueryData(queryKeyOf(query, args), (data: unknown) => data === undefined ? undefined : updater(data))
    }

    const updateItems = (updater: QueryItemUpdater<QueryModel>) => {
      if (!idsResolved) {
        ids = resolveIds(query, args)
        idsResolved = true
      }

      snapshot()

      updateQueryItems(config.modelKey, ids, updater, queryClient)
    }

    const invalidate: Invalidate = scope => void pendingScopes.add(scope)

    const flushInvalidations = () => {
      if (pendingScopes.has(undefined)) void invalidateModel()
      else pendingScopes.forEach(scope => void invalidateModel(scope))

      pendingScopes.clear()
    }

    const applyUpdater = (updater: unknown) => {
      if (query.scope === 'single') updateSingle(updater as QuerySingleUpdater<unknown>)
      else updateItems(updater as QueryItemUpdater<QueryModel>)

      return undefined
    }

    const applyResult = (value: unknown) => {
      const result = typeof value === 'function' ? applyUpdater(value) : value

      flushInvalidations()

      return result
    }

    const response = action(query.scope === 'single'
      ? {
        update: updateSingle,
        set: (data: unknown) => {
          queryClient.setQueryData(queryKeyOf(query, args), data)
        },
        invalidate,
      } satisfies SingleActionContext<unknown>
      : {
        update: updateItems,
        set: (item: QueryModel | QueryModel[]) => setItems(query, args, item),
        invalidate,
      } satisfies ActionContext<QueryModel>, ...args)

    if (!(response instanceof Promise)) return applyResult(response)

    return response
      .then(applyResult)
      .catch(error => {
        rollback?.()

        return Promise.reject(error)
      })
  }

  Object.keys(queries).forEach(key => {
    const query = queries[key]

    result[key] = {
      use: query.isQueryParams
        ? createDefaultQuery(config.modelKey, query.scope, query.queryFn, query.isQueryParams, query.options)
        : createDefaultQuery(config.modelKey, query.scope, query.queryFn, undefined, query.options),
    }

    if (query.actions) {
      result[key].actions = Object.fromEntries(
        Object.entries(query.actions).map(([name, action]) => [name, withActionContext(query, action)]),
      )
    }
  })

  return Object.assign(result, {
    invalidate: (scope?: QueryScope) => invalidateModel(scope),
  }) as unknown as RestModelApi<ModelKey, Model, Scopes, Params, Datas, Queries>
}
