<template>
  <div
    ref="element"
    class="flex z-[1] isolate"
    :style="elementStyles"
  >
    <div class="relative rounded-xl bg-black-default dark:bg-gray-800 min-h-[4.5rem] max-w-[calc(100vw-2rem)] sm:max-w-lg flex select-none my-2 mr-4 ml-auto shadow-md">
      <WCounter
        v-show="count > 1"
        class="absolute -top-2.5 -left-2.5 shadow-md"
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

      <div class="flex-1 py-4 grid items-center">
        <div class="text-base text-default font-semibold">
          {{ title }}
        </div>

        <div
          v-if="caption || userInput"
          class="text-base text-default font-normal break-words whitespace-pre-wrap"
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

      <div
        class="w-ripple-trigger w-ripple-hover text-description cursor-pointer p-6"
        @click="$emit('click:close')"
      >
        <div class="relative flex justify-center items-center square-8 rounded-full w-ripple">
          <IconCancel class="square-4" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref, watch, type StyleValue} from 'vue'
import {useRouter} from 'vue-router'
import {NotifyType} from '../models/NotifyType'
import IconDanger from '@/assets/icons/default/IconDanger.svg?component'
import IconWarn from '@/assets/icons/default/IconWarn.svg?component'
import IconSuccess from '@/assets/icons/default/IconSuccess.svg?component'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'
import WCounter from '@/components/Counter/WCounter.vue'
import WButton from '@/components/Button/WButton.vue'
import {SemanticType} from '@/utils/SemanticType'
import IconBack from '@/assets/icons/default/IconBack.svg?component'
import type {LinkProps} from '@/types/types'

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

const element = ref<HTMLElement | undefined>()
const height = ref<number | undefined>()

const router = useRouter()

const linkText = computed(() => props.to ? router.resolve(props.to).meta.title : undefined)

const elementStyles = computed<StyleValue | undefined>(() => {
  if (!height.value) return undefined

  return {
    '--list-item-height': height.value + 'px',
  }
})

watch(element, value => {
  if (!value) return

  height.value = value.getBoundingClientRect().height || undefined
})

</script>
