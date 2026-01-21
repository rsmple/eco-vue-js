<template>
  <div class="bg-black-default relative my-2 mr-4 grid min-h-[4.5rem] max-w-[calc(100vw-2rem)] grid-cols-[auto,1fr,auto] rounded-xl shadow-md sm:max-w-lg dark:bg-gray-800">
    <WCounter
      v-show="count > 1"
      class="absolute left-[-0.625em] top-[-0.625em] text-xs shadow-md"
      :count="count"
    />

    <div class="m-7">
      <IconDanger
        v-if="type === NotifyType.DANGER"
        class="square-6 text-negative dark:text-negative-dark"
      />

      <IconWarn
        v-else-if="type === NotifyType.WARN"
        class="square-6 text-warning dark:text-warning-dark"
      />

      <IconSuccess
        v-else-if="type === NotifyType.SUCCESS"
        class="square-6 text-positive dark:text-positive-dark"
      />
    </div>

    <div class="grid items-center py-4">
      <div class="text-default font-semibold">
        {{ title }}
      </div>

      <div
        v-if="caption || userInput"
        class="text-default whitespace-pre-wrap break-words font-normal [word-break:break-word]"
      >
        {{ caption ? caption + ' ' : '' }}<span class="break-all">{{ userInput }}</span>
      </div>

      <WButton
        v-if="to"
        :to="to"
        :semantic-type="SemanticType.SECONDARY"
        class="mt-4 justify-self-start"
      >
        {{ linkText }} <IconBack class="rotate-180" />
      </WButton>
    </div>

    <button
      class="w-ripple-trigger w-ripple-hover text-description flex cursor-pointer p-6"
      @click="$emit('click:close')"
    >
      <div class="square-8 w-ripple relative flex items-center justify-center rounded-full">
        <IconCancel class="square-4" />
      </div>
    </button>
  </div>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {computed} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WCounter from '@/components/Counter/WCounter.vue'

import IconBack from '@/assets/icons/IconBack.svg?component'
import IconCancel from '@/assets/icons/IconCancel.svg?component'
import IconDanger from '@/assets/icons/IconDanger.svg?component'
import IconSuccess from '@/assets/icons/IconSuccess.svg?component'
import IconWarn from '@/assets/icons/IconWarn.svg?component'

import {useOptionalRouter} from '@/composables/useOptionalRouter'
import {SemanticType} from '@/utils/SemanticType'

import {NotifyType} from '../models/NotifyType'

interface Props extends Partial<LinkProps> {
  title: string
  caption?: string
  userInput?: string
  type: NotifyType
  count: number
}

const props = withDefaults(
  defineProps<Props>(),
  {
    caption: undefined,
    userInput: undefined,
    to: undefined,
  },
)

defineEmits<{
  (e: 'click:close'): void
}>()

const router = useOptionalRouter()

const linkText = computed(() => {
  if (!props.to) return undefined

  if (props.to instanceof Object && 'meta' in props.to && props.to.meta instanceof Object && 'title' in props.to.meta) {
    return props.to.meta.title
  }

  return router.resolve(props.to).meta?.title
})
</script>
