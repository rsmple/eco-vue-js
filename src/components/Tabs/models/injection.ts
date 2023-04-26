import type {InjectionKey} from 'vue'

export const wTabItemListener = Symbol('wTabItemListener') as InjectionKey<((value: () => void) => void) | undefined>

export const wTabItemUnlistener = Symbol('wTabItemUnlistener') as InjectionKey<((value: () => void) => void) | undefined>