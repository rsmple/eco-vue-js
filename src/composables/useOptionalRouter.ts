import type {LocationQuery, RouteLocationRaw, useRouter} from 'vue-router'

import {type App, getCurrentInstance} from 'vue'

let cachedRouterAvailable: boolean | null = null

function isRouterAvailable(): boolean {
  if (cachedRouterAvailable !== null) {
    return cachedRouterAvailable
  }

  const instance = getCurrentInstance()
  const app = instance?.appContext.app as App & {config?: {globalProperties?: {$router?: unknown}}}

  const hasRouter = !!(app?.config?.globalProperties?.$router)

  cachedRouterAvailable = hasRouter
  return hasRouter
}

type Router = ReturnType<typeof useRouter>

export type FallbackRouter = {
  push: Router['push']
  resolve(to: RouteLocationRaw): Pick<ReturnType<Router['resolve']>, 'name' | 'query'> & {meta: Record<string, string> | undefined}
  noRouter?: true | undefined
}

const fallbackRouter: FallbackRouter = {
  push: to => {
    if (typeof to === 'string') {
      window.location.href = to
    } else if (to && typeof to === 'object' && 'path' in to) {
      window.location.href = to.path || '/'
    }

    return Promise.resolve()
  },
  resolve: to => ({
    name: typeof to === 'string' ? to : 'name' in to ? to.name : to.path ?? '',
    query: typeof to === 'string' ? {} : to.query as LocationQuery ?? {},
    meta: undefined,
  }),
  noRouter: true,
}

export const useOptionalRouter = (): FallbackRouter => {
  const hasRouter = isRouterAvailable()

  if (!hasRouter) return fallbackRouter

  const instance = getCurrentInstance()
  if (instance) {
    const router = instance.appContext.app.config.globalProperties.$router
    if (router) {
      return {
        push: router.push.bind(router),
        resolve: router.resolve.bind(router),
      } as FallbackRouter
    }
  }

  return fallbackRouter
}

export type FallbackRoute = {
  name: string
  query: LocationQuery
  noRouter?: true | undefined
}