import type {RouteLocationMatched, RouteLocationRaw, RouteRecordNormalized} from 'vue-router'

import {type Component, type ComputedRef, type MaybeRefOrGetter, computed, onBeforeUnmount, shallowReactive, toValue, watchEffect} from 'vue'

import {useOptionalMatchedRoute, useOptionalRoute} from '@/composables/useOptionalRouter'

export type RouteTitle = {
  /** Title of the page. `undefined` shows a placeholder while it loads. */
  title: string | undefined
  /** Shorter title for the breadcrumb, the browser tab and nav items. Defaults to `title`. */
  titleShort?: string
  /** Title for the browser tab, e.g. a long name the header shows elsewhere. Defaults to `titleShort`. */
  documentTitle?: string
  /** Content after the title in the header, shown only while the page is the current one. */
  suffix?: Component
  /** Link for the breadcrumb. Defaults to the level's named route, then its named `''` child, then its `redirect`. */
  to?: RouteLocationRaw
}

type Registration = {
  token: symbol
  entry: ComputedRef<RouteTitle>
}

const registrations = shallowReactive(new Map<RouteRecordNormalized, Registration>())

const getMetaString = (record: RouteLocationMatched, key: string): string | undefined => {
  const value = record.meta[key]

  return typeof value === 'string' ? value : undefined
}

const getStaticTitle = (record: RouteLocationMatched): RouteTitle | undefined => {
  const title = getMetaString(record, 'title')

  if (title === undefined) return undefined

  return {
    title,
    titleShort: getMetaString(record, 'titleShort'),
  }
}

export const getRouteTitle = (record: RouteRecordNormalized | undefined): RouteTitle | undefined => {
  if (!record) return undefined

  return registrations.get(record)?.entry.value
}

export const getRouteTitleShort = (value: RouteTitle): string | undefined => value.titleShort ?? value.title

const getDocumentTitle = (value: RouteTitle): string | undefined => value.documentTitle ?? getRouteTitleShort(value)

export const useRouteTitle = (getter: MaybeRefOrGetter<RouteTitle>) => {
  const record = useOptionalMatchedRoute()?.value

  if (!record) return

  const token = Symbol(record.path)

  registrations.set(record, {token, entry: computed(() => toValue(getter))})

  onBeforeUnmount(() => {
    if (registrations.get(record)?.token === token) registrations.delete(record)
  })
}

const groupByPath = (matched: RouteLocationMatched[]): RouteLocationMatched[][] => {
  const groups: RouteLocationMatched[][] = []

  for (const record of matched) {
    const last = groups.at(-1)

    if (last?.[0]?.path === record.path) last.push(record)
    else groups.push([record])
  }

  return groups
}

const getGroupLink = (group: RouteLocationMatched[]): RouteLocationRaw | undefined => {
  const name = group.find(record => record.name !== undefined)?.name

  if (name !== undefined) return {name}

  const indexName = group.flatMap(record => record.children).find(child => child.path === '' && child.name !== undefined)?.name

  if (indexName !== undefined) return {name: indexName}

  const redirect = group.find(record => record.redirect !== undefined && typeof record.redirect !== 'function')?.redirect

  return typeof redirect === 'function' ? undefined : redirect
}

const getGroupTitle = (group: RouteLocationMatched[]): RouteTitle | undefined => {
  const reversed = [...group].reverse()

  const entry = reversed.map(record => registrations.get(record)?.entry.value).find(item => item !== undefined)
    ?? reversed.map(getStaticTitle).find(item => item !== undefined)

  if (!entry) return undefined

  return {...entry, to: entry.to ?? getGroupLink(reversed)}
}

export const useRouteTitles = () => {
  const route = useOptionalRoute()

  const titles = computed<RouteTitle[]>(() => groupByPath(route.matched ?? [])
    .map(getGroupTitle)
    .filter(item => item !== undefined))

  return {
    titles,
  }
}

export const useDocumentTitle = (suffix?: MaybeRefOrGetter<string | undefined>, separator = ' · ') => {
  const {titles} = useRouteTitles()

  watchEffect(() => {
    const suffixValue = toValue(suffix)

    const parts = titles.value
      .map(getDocumentTitle)
      .filter(item => item !== undefined)
      .reverse()

    if (suffixValue) parts.push(suffixValue)

    document.title = parts.join(separator)
  })
}
