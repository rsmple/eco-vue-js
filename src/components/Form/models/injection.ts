import type {ValidatePath} from './utils'
import type {InjectionKey} from 'vue'

export const wFormTitleUpdater = Symbol('wFormTitleUpdater') as InjectionKey<(value: string | undefined, key: string) => void>

export const wFormErrorMessageUpdater = Symbol('wFormErrorMessageUpdater') as InjectionKey<(value: string | undefined, key: string) => void>

export const wFormHasChangesUpdater = Symbol('wFormHasChangesUpdater') as InjectionKey<(value: boolean, key: string) => void>

export const wFormHasValueUpdater = Symbol('wFormHasValueUpdater') as InjectionKey<(value: boolean | null, key: string) => void>

export const wFormHasShownUpdater = Symbol('wFormHasShownUpdater') as InjectionKey<(value: boolean, key: string) => void>

export const wFormValidateUpdater = Symbol('wFormValidateUpdater') as InjectionKey<(value: (silent?: boolean, path?: ValidatePath) => string | undefined, key: string) => void>

export const wFormInvalidateUpdater = Symbol('wFormValidateUpdater') as InjectionKey<(value: (messages: Record<string, string | string[] | undefined>) => void, key: string) => void>

export const wFormInitModelUpdater = Symbol('wFormInitModelUpdater') as InjectionKey<(value: () => void, key: string) => void>

export const wFormUnlistener = Symbol('wFormUnlistener') as InjectionKey<(value: undefined, key: string) => void>
