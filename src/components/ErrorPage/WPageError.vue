<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    mode="out-in"
  >
    <div
      v-if="error"
      class="text-accent flex flex-col items-center px-8 py-24 text-center"
    >
      <div class="text-4xl font-semibold">
        {{ getText('errorTitle') }}
      </div>

      <div
        v-if="status"
        class="mt-12 font-mono text-7xl font-medium"
      >
        {{ status }}
      </div>

      <div class="mt-12 max-w-lg text-base font-normal">
        {{ caption }}
      </div>

      <div class="mt-12 flex w-full max-w-lg">
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          class="w-40 first:mr-auto last:ml-auto"
          @click="back"
        >
          {{ getText('back') }}
        </WButton>

        <WButton
          v-if="isRetryableError(error)"
          :semantic-type="SemanticType.PRIMARY"
          :loading="retrying"
          class="w-40 first:mr-auto last:ml-auto"
          @click="retry"
        >
          {{ getText('retry') }}
        </WButton>
      </div>
    </div>

    <component
      :is="tag ?? 'div'"
      v-else
      v-bind="$attrs"
    >
      <slot />
    </component>
  </Transition>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'

import WButton from '@/components/Button/WButton.vue'

import {SemanticType} from '@/utils/SemanticType'
import {ApiError, ApiErrorUnavailable} from '@/utils/api'
import {getQueryClient, isRetryableError, refetchFailedQueries, useHandledQueryError} from '@/utils/queryClient'
import {getText} from '@/utils/texts'

defineOptions({inheritAttrs: false})

const props = defineProps<{
  /** The error of the query the page shows, such as `query.error.value`. While it is set, the page is replaced with the error, its status and the server's `detail`; a failure that may pass also gets a Retry button. */
  error: Error | null
  /** Element that wraps the page when there is no error. */
  tag?: keyof HTMLElementTagNameMap
}>()

defineSlots<{
  /** The page, shown while there is no error. */
  default?: () => void
}>()

useHandledQueryError(() => props.error)

const status = computed(() => props.error instanceof ApiError ? props.error.response?.status : undefined)

const caption = computed(() => {
  const detail = props.error instanceof ApiError ? props.error.response?.data?.detail : undefined

  if (typeof detail === 'string' && detail) return detail

  if (props.error instanceof ApiErrorUnavailable) return getText('serverUnavailable')

  if (status.value !== undefined && status.value >= 500) return getText('serverError')

  return getText('pageNotFound')
})

const back = () => {
  window.history.back()
}

const retrying = ref(false)

const retry = async () => {
  if (retrying.value) return

  retrying.value = true

  try {
    await refetchFailedQueries(getQueryClient())
  } finally {
    retrying.value = false
  }
}
</script>
