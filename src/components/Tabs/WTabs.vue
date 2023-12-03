<template>
  <div class="mb-8">
    <div
      v-if="names"
      class="relative flex mb-4 sm-not:-px--inner-margin"
    >
      <button
        v-for="(_, index) in defaultSlots"
        ref="button"
        :key="index"
        class="flex-1 font-semibold flex items-center justify-center h-10 cursor-pointer relative w-ripple w-ripple-hover select-none transition-colors duration-500 outline-none"
        :class="{
          'text-description': current !== index && isValidMap[index] !== false,
          'text-primary-default dark:text-primary-dark': current === index && isValidMap[index] !== false,
          'text-negative dark:text-negative-dark': isValidMap[index] === false,
        }"
        @click="handleClickTab(index)"
      >
        <div class="relative">
          {{ names[index] }}
  
          <Transition
            enter-active-class="transition-opacity"
            leave-active-class="transition-opacity"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <div
              v-if="hasChangesMap[index]"
              class="absolute top-0 -right-4 square-2 rounded-full transition-colors duration-500"
              :class="{
                'bg-info dark:bg-info-dark': isValidMap[index] !== false,
                'bg-negative dark:bg-negative-dark': isValidMap[index] === false,
              }"
            />
          </Transition>
        </div>
      </button>

      <div
        class="absolute bottom-0 h-1 rounded-sm duration-500"
        :style="indicatorStyle"
        :class="{
          'bg-primary-default dark:bg-primary-dark': isValidMap[current] !== false,
          'bg-negative dark:bg-negative-dark': isValidMap[current] === false,
          'transition-[left,width,background-color]': indicatorStyle !== undefined,
        }"
      />
    </div>

    <div
      class="relative transition-[min-height] h-full duration-300"
      :style="{minHeight: minHeight ? minHeight + 'px' : 'auto', '--direction-factor': isDirect ? '1' : '-1'}"
    >
      <TransitionGroup
        enter-active-class="transition-transform duration-[250ms] w-full"
        leave-active-class="transition-transform duration-[250ms] w-full absolute top-0"
        enter-from-class="translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor))]"
        leave-to-class="translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor)*-1)]"
      >
        <TabItem
          v-for="(slot, index) in defaultSlots"
          ref="tabItem"
          :key="index"
          :is-active="index === current"
          class="width-full"
          @update:height="updateHeight"
        >
          <WForm
            ref="form"
            :name="index.toString()"
            :title="names?.[index]"
            @update:is-valid="updateIsValidMap(index, $event)"
            @update:has-changes="updateHasChangesMap(index, $event)"
          >
            <component :is="slot" />
          </WForm>
        </TabItem>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch, nextTick, type VNode, inject, onUnmounted, useSlots, computed} from 'vue'
import TabItem from './components/TabItem.vue'
import WForm from '@/components/Form/WForm.vue'
import {throttle} from '@/utils/utils'
import {wTabItemListener, wTabItemUnlistener} from './models/injection'

const props = defineProps<{
  names?: string[]
  slots?: VNode[]
}>()

const emit = defineEmits<{
  (e: 'update:current', value: number): void
}>()

const slots = useSlots()

const defaultSlots = computed(() => (props.slots ?? slots.default?.() ?? []).filter(item => typeof item.type !== 'symbol'))

const current = ref(0)
const isDirect = ref(true)
const button = ref<HTMLDivElement[]>([])
const indicatorStyle = ref<Record<string, string> | undefined>(undefined)
const minHeight = ref(0)
const tabItem = ref<InstanceType<typeof TabItem>[]>([])
const form = ref<InstanceType<typeof WForm>[]>([])

const isValidMap = ref<Record<number, boolean>>({})
const hasChangesMap = ref<Record<number, boolean>>({})

const updateIsValidMap = (index: number, value: boolean | undefined): void => {
  if (value !== undefined) isValidMap.value[index] = value
  else delete isValidMap.value[index]

  nextTick()
    .then(() => {
      if (value === false && isValidMap.value[current.value] !== false) switchTab(index)
    })
}

const updateHasChangesMap = (index: number, value: boolean | undefined): void => {
  if (value !== undefined) hasChangesMap.value[index] = value
  else delete hasChangesMap.value[index]
}

const handleClickTab = async (index: number) => {
  tabItem.value[current.value]?.emitHeight?.()

  await nextTick()

  switchTab(index)
}

const switchTab = throttle((index: number): void => {
  if (current.value === index) return

  updateIndex(index)
}, 250)

const updateIndex = (value: number): void => {
  if (current.value === value || value < 0 || value > defaultSlots.value.length - 1) return

  isDirect.value = current.value < value
  current.value = value
}

const next = throttle((): void => {
  updateIndex(current.value + 1)
}, 250)

const previous = throttle((): void => {
  updateIndex(current.value - 1)
}, 250)

const updateIndicator = () => {
  if (!props.names) return

  const element = button.value[current.value]

  if (!element || !element.offsetWidth) return

  indicatorStyle.value = {
    width: element.offsetWidth + 'px',
    left: element.offsetLeft + 'px',
  }
}

const updateHeight = (value: number): void => {
  if (minHeight.value >= value) return

  minHeight.value = value
}

const validate = (index: number): string | undefined => {
  return form?.value[index].validate()
}

const tabItemListenerInjected = inject(wTabItemListener, null)
const tabItemUnlistenerInjected = inject(wTabItemUnlistener, null)

watch(current, value => {
  emit('update:current', value)

  updateIndicator()
}, {immediate: true})

onMounted(() => {
  updateIndicator()

  tabItemListenerInjected?.(updateIndicator)
})

onUnmounted(() => {
  tabItemUnlistenerInjected?.(updateIndicator)
})

defineExpose({
  updateIndex,
  next,
  previous,
  validate,
})

</script>
