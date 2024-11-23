<template>
  <div
    class="mb-8 grid gap-4"
    :class="{
      'grid grid-cols-1': !side,
      'grid grid-cols-[auto,1fr] items-start': side,
    }"
  >
    <div
      v-if="names"
      ref="buttonContainer"
      class="relative flex overflow-x-auto overscroll-x-contain no-scrollbar snap-x snap-always snap-mandatory"
      :class="{
        'flex-col': side,
      }"
    >
      <button
        v-for="(_, index) in defaultSlots"
        ref="button"
        :key="index"
        class="
          flex-1 font-semibold flex items-center cursor-pointer snap-center
          relative w-ripple w-ripple-hover select-none transition-colors duration-500 outline-none
        "
        :class="{
          'text-description': current !== index && isValidMap[index] !== false,
          'text-primary-default dark:text-primary-dark': current === index && isValidMap[index] !== false,
          'text-negative dark:text-negative-dark': isValidMap[index] === false,
          'h-10 text-center justify-center': !side,
          'py-3 text-start pr-4': side,
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
              class="absolute top-0 right-0 square-2 rounded-full transition-colors duration-500"
              :class="{
                'bg-info dark:bg-info-dark': isValidMap[index] !== false,
                'bg-negative dark:bg-negative-dark': isValidMap[index] === false,
              }"
            />
          </Transition>
        </div>
      </button>

      <div
        class="absolute rounded-sm duration-500"
        :style="indicatorStyle"
        :class="{
          'bg-primary-default dark:bg-primary-dark': isValidMap[current] !== false,
          'bg-negative dark:bg-negative-dark': isValidMap[current] === false,
          'transition-[left,width,background-color]': !side && indicatorStyle !== undefined,
          'transition-[top,height,background-color]': side && indicatorStyle !== undefined,
        }"
      />
    </div>

    <div
      class="relative transition-[min-height] h-full duration-300"
      :style="{minHeight: minHeight ? minHeight + 'px' : 'auto', '--direction-factor': isDirect ? '1' : '-1'}"
    >
      <TransitionGroup
        enter-active-class="transition-[transform,opacity] duration-[250ms] w-full"
        leave-active-class="transition-[transform,opacity] duration-[250ms] w-full absolute top-0"
        :enter-from-class="lessTransitions || side ? 'opacity-0' : 'translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor))]'"
        :leave-to-class="lessTransitions || side ? 'opacity-0' : 'translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor)*-1)]'"
      >
        <TabItem
          v-for="(slot, index) in defaultSlots"
          ref="tabItem"
          :key="index"
          :is-active="index === current"
          class="width-full"
          @update:height="!disableMinHeight && updateHeight($event)"
        >
          <WForm
            ref="form"
            :name="namesForm?.[index] ?? index.toString()"
            :title="names?.[index]"
            @update:is-valid="updateIsValidMap(index, $event)"
            @update:has-changes="hasChangesMap[index] = $event"
          >
            <component :is="slot" />
          </WForm>
        </TabItem>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch, nextTick, type VNode, inject, onUnmounted, useSlots, computed, reactive, useTemplateRef} from 'vue'
import TabItem from './components/TabItem.vue'
import WForm from '@/components/Form/WForm.vue'
import {debounce, throttle} from '@/utils/utils'
import {wTabItemListener, wTabItemUnlistener} from './models/injection'

const props = defineProps<{
  names?: string[] | Record<number, string>
  namesForm?: string[] | Record<number, string>
  icons?: SVGComponent[] | Record<number, SVGComponent>
  customSlots?: VNode[]
  lessTransitions?: boolean
  initTab?: number
  side?: boolean
  disableMinHeight?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:current', value: number): void
  (e: 'update:has-changes', value: boolean): void
}>()

const slots = useSlots()

const defaultSlots = computed(() => (props.customSlots ?? slots.default?.() ?? []).filter(item => typeof item.type !== 'symbol'))

const current = ref(props.initTab ?? 0)
const isDirect = ref(true)
const button = ref<HTMLButtonElement[]>([])
const indicatorStyle = ref<Record<string, string> | undefined>(undefined)
const minHeight = ref(0)
const tabItem = ref<ComponentInstance<typeof TabItem>[]>([])
const form = ref<ComponentInstance<typeof WForm>[]>([])
const buttonContainerRef = useTemplateRef('buttonContainer')

const isValidMap = reactive<Record<number, boolean | undefined>>({})
const hasChangesMap = reactive<Record<number, boolean | undefined>>({})

const hasChanges = computed<boolean>(() => Object.values(hasChangesMap).includes(true))

const updateIsValidMap = (index: number, value: boolean | undefined): void => {
  isValidMap[index] = value

  nextTick()
    .then(() => {
      if (value === false && isValidMap[current.value] !== false) switchTab(index)
    })
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

const updateIndicator = (): void => {
  if (!props.names) return

  const element = button.value[current.value]

  if (!element || !element.offsetWidth) return

  if (props.side) {
    indicatorStyle.value = {
      height: element.offsetHeight + 'px',
      top: element.offsetTop + 'px',
      left: '0',
      width: '0.25rem',
    }
  } else {
    indicatorStyle.value = {
      width: element.offsetWidth + 'px',
      left: element.offsetLeft + 'px',
      bottom: '0',
      height: '0.25rem',
    }
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

  if (buttonContainerRef.value && button.value[value]) {
    if (props.side) {
      buttonContainerRef.value.scrollTo({top: (button.value[value].offsetTop - buttonContainerRef.value.offsetTop) / 2, behavior: 'smooth'})
    } else {
      buttonContainerRef.value.scrollTo({left: (button.value[value].offsetLeft - buttonContainerRef.value.offsetLeft) / 2, behavior: 'smooth'})
    }
  }
}, {immediate: true})

watch(hasChanges, value => {
  emit('update:has-changes', value)
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
  invalidate,
  initModel,
})

</script>
