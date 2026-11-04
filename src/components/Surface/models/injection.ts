import type {InjectionKey} from 'vue'

/** Set by a WSection for the sections inside it, which render as its parts. */
export const wSectionNested = Symbol('wSectionNested') as InjectionKey<boolean>
