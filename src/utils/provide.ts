import {type InjectionKey, type MaybeRef, inject, provide} from 'vue'

const wReadonlyKey = Symbol('wReadonlyKey') as InjectionKey<MaybeRef<boolean>>

export const useProvideReadonly = (value?: MaybeRef<boolean>) => {
  if (value !== undefined) provide(wReadonlyKey, value)

  return inject(wReadonlyKey, undefined)
}

const wDisabledKey = Symbol('wDisabledKey') as InjectionKey<MaybeRef<boolean>>

export const useProvideDisabled = (value?: MaybeRef<boolean>) => {
  if (value !== undefined) provide(wDisabledKey, value)

  return inject(wDisabledKey, undefined)
}

const wSkeletonKey = Symbol('wSkeletonKey') as InjectionKey<MaybeRef<boolean>>

export const useProvideSkeleton = (value?: MaybeRef<boolean>) => {
  if (value !== undefined) provide(wSkeletonKey, value)

  return inject(wSkeletonKey, undefined)
}
