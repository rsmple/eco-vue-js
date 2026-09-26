import type {FallbackRoute, FallbackRouter} from '@/composables/useOptionalRouter'
import type {LocationQuery, RouteLocationRaw, RouteRecordNormalized} from 'vue-router'

import {type Router, inBrowser} from 'vitepress'
import {type App, type PropType, defineComponent, h, reactive, watch} from 'vue'

/**
 * The kit looks for vue-router through `$router` and an injected route object. VitePress has its own
 * router, so this adapter exposes it in that shape: nav items get an active state, `to` props render
 * links, and list query params and selection land in the page URL like they would in an app.
 */
export const installKitRouter = (app: App, router: Router, base: string) => {
  const stripBase = (path: string) => '/' + path.slice(base.length).replace(/\.html$/, '')

  const route = reactive<FallbackRoute>({name: '', query: {}, hash: '', fullPath: ''})

  const sync = () => {
    route.name = stripBase(router.route.path)
    route.query = inBrowser ? Object.fromEntries(new URLSearchParams(location.search)) : {}
    // vue-router hands out the decoded hash; the list keeps its selection there as JSON.
    route.hash = inBrowser ? decodeURIComponent(location.hash) : ''
    route.fullPath = router.route.path
  }

  const resolve: FallbackRouter['resolve'] = (to: RouteLocationRaw) => {
    const location = typeof to === 'string' ? {path: to} : to
    const path = 'path' in location && location.path ? location.path : route.name
    const query = (location.query ?? {}) as LocationQuery
    const search = new URLSearchParams(Object.entries(query).filter(([, value]) => value != null) as [string, string][]).toString()
    const hash = location.hash ?? ''
    const href = base + path.replace(/^\//, '') + (search ? '?' + search : '') + hash

    const result = {name: path, href, query, meta: undefined}

    return {...result, matched: [result] as unknown as RouteRecordNormalized[]}
  }

  const kitRouter: FallbackRouter = {
    resolve,
    push: to => router.go(resolve(to).href),
    replace: to => {
      const {href} = resolve(to)

      history.replaceState(history.state, '', href)
      sync()

      return Promise.resolve()
    },
  }

  watch(() => router.route.path, sync, {immediate: true})

  if (inBrowser) {
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
  }

  app.config.globalProperties.$router = kitRouter as unknown as typeof app.config.globalProperties.$router
  app.provide(Symbol('kit-route'), route)

  // WRouterLink renders `RouterLink` when it resolves; VitePress intercepts plain anchor clicks itself.
  app.component('RouterLink', defineComponent({
    props: {to: {type: [String, Object] as PropType<RouteLocationRaw>, required: true}},
    setup: (props, {slots}) => () => h('a', {href: resolve(props.to).href}, slots.default?.()),
  }))
}
