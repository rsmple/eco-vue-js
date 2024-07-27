<template>
  <div class="mb-8">
    <div
      v-if="names"
      class="relative flex mb-4 sm-not:-px--inner-margin overflow-x-auto overscroll-x-contain no-scrollbar snap-x snap-always snap-mandatory"
    >
      <button
        v-for="(_, index) in defaultSlots"
        ref="button"
        :key="index"
        class="
          flex-1 font-semibold flex items-center justify-center h-10 cursor-pointer snap-center
          relative w-ripple w-ripple-hover select-none transition-colors duration-500 outline-none
        "
        :class="{
          'text-description': current !== index && isValidMap[index] !== false,
          'text-primary-default dark:text-primary-dark': current === index && isValidMap[index] !== false,
          'text-negative dark:text-negative-dark': isValidMap[index] === false,
        }"
        @click="switchTab(index)"
      >
        <div class="relative whitespace-nowrap px-4">
          <component
            :is="icons?.[index]"
            v-if="icons?.[index]"
            class="inline -mt-1"
          />

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
        :enter-from-class="lessTransitions ? 'opacity-0' : 'translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor))]'"
        :leave-to-class="lessTransitions ? 'opacity-0' : 'translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor)*-1)]'"
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
import {onMounted, ref, watch, nextTick, type VNode, inject, onUnmounted, useSlots, computed, reactive} from 'vue'
import TabItem from './components/TabItem.vue'
import WForm from '@/components/Form/WForm.vue'
import {debounce, throttle} from '@/utils/utils'
import {wTabItemListener, wTabItemUnlistener} from './models/injection'

const props = defineProps<{
  names?: string[]
  icons?: SVGComponent[] | Record<number, SVGComponent>
  slots?: VNode[]
  lessTransitions?: boolean
  initTab?: number
}>()

const emit = defineEmits<{
  (e: 'update:current', value: number): void
  (e: 'update:has-changes', value: boolean): void
}>()

const usedSlots = useSlots()

const defaultSlots = computed(() => (props.slots ?? usedSlots.default?.() ?? []).filter(item => typeof item.type !== 'symbol'))

const current = ref(props.initTab ?? 0)
const isDirect = ref(true)
const button = ref<HTMLButtonElement[]>([])
const indicatorStyle = ref<Record<string, string> | undefined>(undefined)
const minHeight = ref(0)
const tabItem = ref<ComponentInstance<typeof TabItem>[]>([])
const form = ref<ComponentInstance<typeof WForm>[]>([])

const isValidMap = reactive<Record<number, boolean>>({})
const hasChangesMap = reactive<Record<number, boolean>>({})

const hasChanges = computed<boolean>(() => Object.values(hasChangesMap).includes(true))

const updateIsValidMap = (index: number, value: boolean | undefined): void => {
  if (value !== undefined) isValidMap[index] = value
  else delete isValidMap[index]

  nextTick()
    .then(() => {
      if (value === false && isValidMap[current.value] !== false) switchTab(index)
    })
}

const updateHasChangesMap = (index: number, value: boolean | undefined): void => {
  if (value !== undefined) hasChangesMap[index] = value
  else delete hasChangesMap[index]
}

const switchTab = throttle((index: number): void => {
  if (current.value === index) return

  updateIndex(index)
}, 200)

const updateIndex = (value: number) => {
  tabItem.value[current.value]?.emitHeight?.()

  setIndexDebounced(value)
}

const setIndexDebounced = debounce((value: number) => {
  if (current.value === value || value < 0 || value > defaultSlots.value.length - 1) return

  isDirect.value = current.value < value
  current.value = value
}, 100)

const next = (): void => {
  switchTab(current.value + 1)
}

const previous = (): void => {
  switchTab(current.value - 1)
}

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

const validate = (index: number, ...args: Parameters<ComponentInstance<typeof WForm>['validate']>): ReturnType<ComponentInstance<typeof WForm>['validate']> => {
  return form?.value[index].validate(...args)
}

const invalidate = (index: number, ...args: Parameters<ComponentInstance<typeof WForm>['invalidate']>): ReturnType<ComponentInstance<typeof WForm>['invalidate']> => {
  return form?.value[index].invalidate(...args)
}

const initModel = (index: number, ...args: Parameters<ComponentInstance<typeof WForm>['initModel']>): ReturnType<ComponentInstance<typeof WForm>['initModel']> => {
  return form?.value[index].initModel(...args)
}

const tabItemListenerInjected = inject(wTabItemListener, null)
const tabItemUnlistenerInjected = inject(wTabItemUnlistener, null)

watch(current, value => {
  emit('update:current', value)

  updateIndicator()

  button.value[value]?.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'})
}, {immediate: true})

watch(hasChanges, value => {
  emit('update:has-changes', value)
}, {immediate: true})

onMounted(() => {
  updateIndicator()

  button.value[current.value]?.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'})

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
  invalidate,
  initModel,
})

</script>
