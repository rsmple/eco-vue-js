import type {LocationQuery, RouteLocationRaw, RouteRecordNormalized, useRoute, useRouter} from 'vue-router'

import {type App, getCurrentInstance, inject} from 'vue'

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
  resolve(to: RouteLocationRaw): Pick<ReturnType<Router['resolve']>, 'name' | 'query' | 'href' | 'matched'> & {meta: Record<string, string> | undefined, name: string}
  replace: Router['replace']
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
  resolve: to => {
    const result = {
      name: typeof to === 'string' ? to : 'name' in to ? to.name as string : to.path ?? '',
      href: typeof to === 'string' ? to : 'href' in to && typeof to.href === 'string' ? to.href : to.path ?? '',
      query: typeof to === 'string' ? {} : to.query as LocationQuery ?? {},
      meta: undefined,
    }

    return {...result, matched: [result] as unknown as RouteRecordNormalized[]}
  },
  replace: to => {
    if (typeof to === 'string') {
      window.location.href = to
    } else if (to && typeof to === 'object' && 'path' in to) {
      window.location.href = to.path || '/'
    }

    return Promise.resolve()
  },
  noRouter: true,
}

export const useOptionalRouter = (): FallbackRouter => {
  const hasRouter = isRouterAvailable()

  if (!hasRouter) return fallbackRouter

  const instance = getCurrentInstance()
  if (instance) {
    const router = instance.appContext.app.config.globalProperties.$router
    if (router) {
      return router as FallbackRouter
    }
  }

  return fallbackRouter
}

type Route = ReturnType<typeof useRoute>

export type FallbackRoute = {
  name: string
  query: LocationQuery
  hash: Route['hash']
  fullPath: Route['fullPath']
  noRouter?: true | undefined
}

const SYMBOL_ROUTE = 'Symbol(route location)'

export const useOptionalRoute = (): FallbackRoute => {
  const hasRouter = isRouterAvailable()

  if (hasRouter) {
    const instance = getCurrentInstance()

    if (instance) {
      const injectionKey = Object.getOwnPropertySymbols(instance.appContext.provides).find(item => item.toString() === SYMBOL_ROUTE)

      if (injectionKey) return inject(injectionKey) as FallbackRoute
    }
  }

  const url = new URL(window.location.href)

  return {
    query: Object.fromEntries(url.searchParams.entries()),
    name: url.pathname,
    hash: url.hash,
    fullPath: url.pathname,
    noRouter: true,
  }
}