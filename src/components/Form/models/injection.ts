import type {ValidatePath} from './utils'
import type {InjectionKey} from 'vue'

export const wFormTitleUpdater = Symbol('wFormTitleUpdater') as InjectionKey<(key: string, value: string | undefined) => void>

export const wFormErrorMessageUpdater = Symbol('wFormErrorMessageUpdater') as InjectionKey<(key: string, value: string | undefined) => void>

export const wFormHasChangesUpdater = Symbol('wFormHasChangesUpdater') as InjectionKey<(key: string, value: boolean) => void>

export const wFormHasValueUpdater = Symbol('wFormHasValueUpdater') as InjectionKey<(key: string, value: boolean | null) => void>

export const wFormHasShownUpdater = Symbol('wFormHasShownUpdater') as InjectionKey<(key: string, value: boolean) => void>

export const wFormValidateUpdater = Symbol('wFormValidateUpdater') as InjectionKey<(key: string, value: (silent?: boolean, path?: ValidatePath) => string | undefined) => void>

export const wFormInvalidateUpdater = Symbol('wFormValidateUpdater') as InjectionKey<(key: string, value: (messages: Record<string, string | string[] | undefined>) => void) => void>

export const wFormInitModelUpdater = Symbol('wFormInitModelUpdater') as InjectionKey<(key: string, value: () => void) => void>

export const wFormUnlistener = Symbol('wFormUnlistener') as InjectionKey<(key: string) => void>
