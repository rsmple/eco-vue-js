import type {InjectionKey} from 'vue'

/** Provided inside the list toolbar: the filters there keep to one line and move the chips that do not fit into a menu. */
export const wListToolbar = Symbol('wListToolbar') as InjectionKey<true>
