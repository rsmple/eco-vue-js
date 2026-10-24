import type {InjectionKey, Ref} from 'vue'

export const wScrollingElement = Symbol('wScrollingElement') as InjectionKey<Ref<Element | null>>
/** The height of the sticky list header, for content that sticks under it. */
export const wInfiniteListHeaderHeight = Symbol('wInfiniteListHeaderHeight') as InjectionKey<Ref<number>>
