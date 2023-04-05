<template>
  <div class="mb-8">
    <div class="relative flex mb-4">
      <div
        v-for="(_, index) in $slots.default?.()"
        ref="button"
        :key="index"
        class="flex-1 font-semibold flex items-center justify-center h-10 cursor-pointer relative w-ripple select-none transition-colors duration-500"
        :class="{
          'text-description': current !== index && isValidMap[index] !== false,
          'text-primary-default dark:text-primary-dark': current === index && isValidMap[index] !== false,
          'text-negative dark:text-negative-dark': isValidMap[index] === false,
        }"
        @click="handleClickTab(index)"
      >
        {{ names[index] }}
      </div>

      <div
        class="absolute bottom-0 h-1 rounded-sm bg-primary-default dark:bg-primary-dark transition-all duration-500"
        :style="indicatorStyle"
        :class="{
          'bg-negative dark:bg-negative-dark': isValidMap[current] === false,
        }"
      />
    </div>

    <div
      class="relative transition-[min-height] h-full duration-200"
      :style="{minHeight: minHeight ? minHeight + 'px' : 'auto'}"
    >
      <TransitionGroup
        enter-active-class="swipe-horizontal-enter-active"
        leave-active-class="swipe-horizontal-leave-active"
        v-bind="isDirect ? {
          enterFromClass: 'swipe-horizontal-direct-enter-from',
          leaveToClass: 'swipe-horizontal-direct-leave-to',
        } : {
          enterFromClass: 'swipe-horizontal-reverse-enter-from',
          leaveToClass: 'swipe-horizontal-reverse-leave-to',
        }"
      >
        <TabItem
          v-for="(slot, index) in $slots.default?.()"
          ref="tabItem"
          :key="index"
          :is-active="index === current"
          class="width-full"
          @update:height="updateHeight"
        >
          <WForm
            :name="index.toString()"
            :title="names[index]"
            @update:is-valid="updateIsValidMap(index, $event)"
          >
            <component :is="slot" />
          </wform>
        </TabItem>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch, nextTick} from 'vue'
import TabItem from './components/TabItem.vue'
import WForm from '@/components/Form/WForm.vue'
import {debounce} from '@/utils/utils'

defineProps<{
  names: string[]
}>()

const current = ref(0)
const isDirect = ref(true)
const button = ref<HTMLDivElement[]>([])
const indicatorStyle = ref({})
const minHeight = ref(0)
const tabItem = ref<InstanceType<typeof TabItem>[]>([])

const isValidMap = ref<Record<number, boolean>>({})

const updateIsValidMap = (index: number, value: boolean | undefined): void => {
  const result = {...isValidMap.value}

  if (value === undefined) {
    delete result[index]
  } else {
    result[index] = value
  }

  isValidMap.value = result

  if (value === false) switchTab(index)
}

const handleClickTab = async (index: number) => {
  tabItem.value[current.value]?.emitHeight?.()

  await nextTick()

  switchTab(index)
}

const switchTab = debounce((index: number): void => {
  if (current.value === index) return

  updateIndex(index)
}, 100)

const updateIndex = (value: number): void => {
  isDirect.value = current.value < value
  current.value = value
}

const updateIndicator = () => {
  const element = button.value[current.value]

  if (!element) return

  indicatorStyle.value = {
    width: element.clientWidth + 'px',
    left: element.offsetLeft + 'px',
  }
}

const updateHeight = (value: number): void => {
  if (minHeight.value >= value) return

  minHeight.value = value
}

watch(current, () => {
  updateIndicator()
})

onMounted(() => {
  updateIndicator()
})

</script>
