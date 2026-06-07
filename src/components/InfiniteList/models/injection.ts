import type {InjectionKey, Ref} from 'vue'

export const wScrollingElement = Symbol('wScrollingElement') as InjectionKey<Ref<Element | null>>