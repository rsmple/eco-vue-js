import {computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {isId, isIndex, isPage} from './utils'

const keysLengthPage: ObjectKeys<SelectedPage<number>>['length'] = 3

export const isSelecionPage = <T>(value: unknown): value is SelectedPage<T> => {
  return value instanceof Object
    && Object.keys(value).length === keysLengthPage
    && 'page' in value && isPage(value.page)
    && 'index' in value && isIndex(value.index)
    && 'id' in value && isId(value.id)
}

const stringifySelectedPage = <T>(value: SelectedPage<T>): string => value.page + ':' + value.index + ':' + value.id

const keysLengthRange: SelectedRange<number>['length'] = 2

export const isSelectedRange = <T>(value: unknown): value is SelectedRange<T> => {
  return Array.isArray(value)
    && value.length === keysLengthRange
    && isSelecionPage(value[0])
    && isSelecionPage(value[1])
}

const isRightOrder = <T>(value: SelectedRange<T>): boolean => {
  return value[0].page < value[1].page || (value[0].page === value[1].page && value[0].index <= value[1].index)
}

export const getPosition = <T>(range: SelectedPage<T>, pageLength: number): number => {
  return ((range.page - 1) * pageLength) + range.index
}

const stringifySelectedRange = <T>(value: SelectedRange<T>): string => stringifySelectedPage(value[0]) + '-' + stringifySelectedPage(value[1])

const DIVIDER = ','



export const useSelected = () => {
  const route = useRoute()
  const router = useRouter()

  const selectedRange = computed<SelectedRange<number> | undefined>(() => {
    if (!route.hash.includes('-')) return undefined

    const parsed = route.hash.substring(1).split('-').map((item): SelectedPage<number> => {
      const [page, index, id] = item.split(':').map(value => Number.parseInt(value))
      return {page, index, id}
    })

    if (!isSelectedRange<number>(parsed)) return undefined

    if (!isRightOrder(parsed)) parsed.reverse()

    return parsed
  })

  const setSelectedRange = (value: SelectedRange<number>) => {
    router.replace({query: route.query, hash: `#${ stringifySelectedRange(value) }`})
  }

  const selected = computed<number[]>(() => {
    if (typeof route.hash !== 'string') return []

    if (route.hash.includes('-')) return []

    const substring = route.hash[1] === '!' ? route.hash.substring(2) : route.hash.substring(1)

    return substring.split(DIVIDER).map(item => Number.parseInt(item)).filter(item => !isNaN(item))
  })

  const reverse = computed<boolean>(() => typeof route.hash === 'string' && route.hash[1] === '!')

  const setSelected = (value: number[]): void => {
    router.replace({query: route.query, hash: `#${ value.join(DIVIDER) }`})
  }

  const setSelectedReverse = (value: number[]): void => {
    router.replace({query: route.query, hash: `#!${ value.join(DIVIDER) }`})
  }

  return {
    selectedRange,
    setSelectedRange,

    selected,
    reverse,
    setSelected,
    setSelectedReverse,
  }
}
