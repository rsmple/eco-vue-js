import type {InjectionKey} from 'vue'

export const wFormTitleUpdater = Symbol('wFormTitleUpdater') as InjectionKey<(key: string, value: string | undefined) => void>

export const wFormErrorMessageUpdater = Symbol('wFormErrorMessageUpdater') as InjectionKey<(key: string, value: string | undefined) => void>

export const wFormHasChangesUpdater = Symbol('wFormHasChangesUpdater') as InjectionKey<(key: string, value: boolean | undefined) => void>

export const wFormValidateUpdater = Symbol('wFormValidateUpdater') as InjectionKey<(key: string, value: (silent: boolean) => string | undefined) => void>

export const wFormInvalidateUpdater = Symbol('wFormValidateUpdater') as InjectionKey<(key: string, value: (messages: Record<string, string>) => void) => void>

export const wFormInitModelUpdater = Symbol('wFormInitModelUpdater') as InjectionKey<(key: string, value: () => void) => void>

export const wFormUnlistener = Symbol('wFormUnlistener') as InjectionKey<(key: string) => void>
