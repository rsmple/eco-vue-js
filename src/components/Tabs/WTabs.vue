<template>
  <div class="mb-8">
    <div class="relative flex mb-4">
      <button
        v-for="(_, index) in $slots.default?.()"
        ref="button"
        :key="index"
        class="flex-1 font-semibold flex items-center justify-center h-10 cursor-pointer relative w-ripple w-ripple-hover select-none transition-colors duration-500"
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
        class="absolute bottom-0 h-1 rounded-sm transition-all duration-500"
        :style="indicatorStyle"
        :class="{
          'bg-primary-default dark:bg-primary-dark': isValidMap[current] !== false,
          'bg-negative dark:bg-negative-dark': isValidMap[current] === false,
        }"
      />
    </div>

    <div
      class="relative transition-[min-height] h-full duration-300"
      :style="{minHeight: minHeight ? minHeight + 'px' : 'auto', '--direction-factor': isDirect ? '1' : '-1'}"
    >
      <TransitionGroup
        enter-active-class="top-0 left-0 transition-[top,left,transform] duration-[250ms] ease-linear"
        leave-active-class="top-0 left-0 transition-[top,left,transform] duration-[250ms] ease-linear absolute"
        enter-from-class="translate-x-[calc((100%+2*var(--inner-margin))*var(--direction-factor))]"
        leave-to-class="left-[calc((100%+2*var(--inner-margin))*var(--direction-factor)*-1)] top-0"
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
            @update:has-changes="updateHasChangesMap(index, $event)"
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
    width: element.offsetWidth + 'px',
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
