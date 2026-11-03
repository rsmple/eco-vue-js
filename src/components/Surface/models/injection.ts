import type {InjectionKey, Ref} from 'vue'

/** Set by a WSection for the sections inside it, which render as its parts. */
export const wSectionNested = Symbol('wSectionNested') as InjectionKey<boolean>

/**
 * Set by a section head over the content after it, such as WTabs `section`: the head's height. A page list in that
 * content sticks its header under the head, which sticks above it.
 */
export const wSectionHeadHeight = Symbol('wSectionHeadHeight') as InjectionKey<Readonly<Ref<number>>>
