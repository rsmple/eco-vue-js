import {computed, unref} from 'vue'

import {useProvideDisabled, useProvideReadonly, useProvideSkeleton} from './provide'

interface ComponentStateProps {
  readonly?: boolean
  disabled?: boolean
  skeleton?: boolean
}

export const useComponentStates = <T extends ComponentStateProps>(props: T) => {
  const readonlyProvided = useProvideReadonly()
  const disabledProvided = useProvideDisabled()
  const skeletonProvided = useProvideSkeleton()

  const isReadonly = computed(() => props.readonly ?? unref(readonlyProvided))
  const isDisabled = computed(() => props.disabled ?? unref(disabledProvided))
  const isSkeleton = computed(() => props.skeleton ?? unref(skeletonProvided))

  return {
    isReadonly,
    isDisabled,
    isSkeleton,
  }
}

export const useComponentStatesButton = <T extends Omit<ComponentStateProps, 'readonly'>>(props: T) => {
  const readonlyProvided = useProvideReadonly()
  const disabledProvided = useProvideDisabled()
  const skeletonProvided = useProvideSkeleton()

  const isDisabled = computed(() => props.disabled ?? (unref(disabledProvided) || unref(readonlyProvided)) ?? false)
  const isSkeleton = computed(() => props.skeleton ?? unref(skeletonProvided))

  return {
    isDisabled,
    isSkeleton,
  }
}

export const useComponentStatesSkeleton = <T extends Pick<ComponentStateProps, 'skeleton'>>(props: T) => {
  const skeletonProvided = useProvideSkeleton()

  const isSkeleton = computed(() => props.skeleton ?? unref(skeletonProvided))

  return {
    isSkeleton,
  }
}