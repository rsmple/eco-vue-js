import type {InjectionKey} from 'vue'

export const wIsModal = Symbol('wIsModal') as InjectionKey<boolean>

export const wModalHeaderHeight = Symbol('wModalHeaderHeight') as InjectionKey<number>