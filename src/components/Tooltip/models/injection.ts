import type {InjectionKey, VNode} from 'vue'

export type TooltipMeta = {parent: HTMLElement, slot?: VNode, text?: string, light?: boolean}

export type SetTooltipMeta = (meta: TooltipMeta | null) => void

export const wTooltipSetMeta = Symbol('wTooltipSetMeta') as InjectionKey<SetTooltipMeta>