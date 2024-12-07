<template>
  <div
    ref="container"
    class="grid gap-4"
    :class="{
      'grid grid-cols-1': !side,
      'sm-not:grid-cols-[repeat(2,100vw)] grid snap-x snap-mandatory snap-always grid-cols-[auto,1fr] items-start overflow-x-auto overscroll-x-contain': side,
    }"
  >
    <div
      v-if="!noHeader"
      ref="buttonContainer"
      class="relative"
      :class="{
        'sm-not:snap-start grid grid-cols-[1fr,auto]': side,
        'no-scrollbar sm-not:-pl--inner-margin flex snap-x snap-mandatory snap-always overflow-x-auto overscroll-x-contain pr-[50%]': !side,
        '4xl:pl-[50%]': stepper && !side,
      }"
    >
      <template
        v-for="(slot, index) in defaultSlotsAll"
        :key="slot.props?.name"
      >
        <TabTitleButton
          v-if="isTabItem(slot)"
          ref="button"
          :active="current === slot.props?.name"
          :index="index"
          :title="slot.props?.title"
          :icon="slot.props?.icon"
          :has-changes="tabItemRef?.[defaultSlots.indexOf(slot)]?.hasChanges === true"
          :has-error="tabItemRef?.[defaultSlots.indexOf(slot)]?.isValid === false"
          :has-value="tabItemRef?.[defaultSlots.indexOf(slot)]?.hasValue === true"
          :first="defaultSlots.indexOf(slot) === 0"
          :last="defaultSlots.indexOf(slot) === defaultSlots.length - 1"
          :disabled="stepper ? defaultSlots.indexOf(slot) > hasNoValueFirst : false"
          :stepper="stepper"
          :show-has-value="showHasValue"
          :side="side"
          :no-indicator="noIndicator"
          :class="{
            'snap-center': !side,
          }"
          @update:indicator-style="indicatorStyle = $event"
          @update:scroll-position="updateScrollPosition"
          @click="switchTab(slot.props?.name)"
        >
          <template
            v-if="(slot.children as Record<string, Component>)?.title"
            #title="scope"
          >
            <component
              v-bind="scope"
              :is="(slot.children as Record<string, Component>)?.title"
            />
          </template>

          <template
            v-if="(slot.children as Record<string, Component>)?.suffix"
            #suffix="scope"
          >
            <component
              v-bind="scope"
              :is="(slot.children as Record<string, Component>)?.suffix" 
            />
          </template>

          <template
            v-if="(slot.children as Record<string, Component>)?.right"
            #right="scope"
          >
            <component
              v-bind="scope"
              :is="(slot.children as Record<string, Component>)?.right"
            />
          </template>
        </TabTitleButton>

        <component
          :is="slot"
          v-else
        />
      </template>

      <div
        v-if="!noIndicator"
        class="absolute rounded-sm duration-500"
        :style="indicatorStyle"
        :class="{
          'bg-primary-default dark:bg-primary-dark': currentIsValid !== false,
          'bg-negative dark:bg-negative-dark': currentIsValid === false,
          'transition-[left,width,background-color]': !side && indicatorStyle !== undefined,
          'transition-[top,height,background-color]': side && indicatorStyle !== undefined,
        }"
      />
    </div>

    <div
      v-if="defaultSlots.some(slot => (slot.children as Record<string, Component>)?.default)"
      class="relative h-full transition-[min-height] duration-300"
      :class="{
        'sm-not:snap-start': side,
      }"
      :style="{minHeight: minHeight ? minHeight + 'px' : 'auto', '--direction-factor': isDirect ? '1' : '-1'}"
    >
      <TransitionGroup
        enter-active-class="transition-[transform,opacity] duration-[250ms] w-full"
        leave-active-class="transition-[transform,opacity] duration-[250ms] w-full absolute top-0"
        :enter-from-class="lessTransitions || side ? 'opacity-0' : 'opacity-0 translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor))]'"
        :leave-to-class="lessTransitions || side ? 'opacity-0' : 'opacity-0 translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor)*-1)]'"
      >
        <TabItem
          v-for="slot in defaultSlots"
          ref="tabItem"
          :key="slot.props?.name"
          :name="slot.props?.name"
          :title="slot.props?.title"
          :active="slot.props?.name === current"
          :removable="slot.props?.removable"
          @tab:switch="switchOnInvalid"
          @update:height="!disableMinHeight && updateHeight($event)"
          @update:active="$emit('update:current-title', slot.props?.title)"
        >
          <component :is="slot" />
        </TabItem>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {TabsProps} from './types'

import {type CSSProperties, type Component, type VNode, computed, inject, onMounted, onUnmounted, ref, useSlots, useTemplateRef, watch} from 'vue'

import WForm from '@/components/Form/WForm.vue'

import {getIsMobile} from '@/main'
import {debounce, throttle} from '@/utils/utils'

import TabItem from './components/TabItem.vue'
import TabTitleButton from './components/TabTitleButton.vue'
import {wTabItemListener, wTabItemUnlistener} from './models/injection'

const mobile = getIsMobile()

const props = defineProps<TabsProps>()

const emit = defineEmits<{
  (e: 'update:current', value: string): void
  (e: 'update:current-index', value: number): void
  (e: 'update:has-changes', value: boolean): void
  (e: 'update:current-title', value: string): void
  (e: 'update:tabs-length', value: number): void
}>()

const slots = useSlots()

const containerRef = useTemplateRef('container')
const buttonContainerRef = useTemplateRef('buttonContainer')

const defaultSlotsRaw = computed(() => props.customSlots ?? slots.default?.() ?? [])

const unwrapSlots = (slots: VNode[]): VNode[] => {
  return slots.flatMap(slot => {
    if (Array.isArray(slot?.children)) return unwrapSlots(slot.children as VNode[])
    else if (typeof slot.type !== 'symbol') return slot
    else return []
  })
}

const isTabItem = (slot: VNode): boolean => {
  return slot.type instanceof Object && '__name' in slot.type && slot.type.__name === 'WTabsItem'
}

const defaultSlotsAll = computed(() => {
  return unwrapSlots(defaultSlotsRaw.value)
})

const defaultSlots = computed(() => {
  return defaultSlotsAll.value.filter(isTabItem)
})

const defaultSlotsKeys = computed<string[]>(() => defaultSlots.value.map(item => item.props?.name))

const current = ref<string>(props.initTab ?? (props.initTabIndex !== undefined
  ? defaultSlotsKeys.value[props.initTabIndex]
  : defaultSlots.value.find(slot => !!slot.props?.init)?.props?.name ?? defaultSlotsKeys.value[0]
))
const currentIndex = computed(() => defaultSlotsKeys.value.indexOf(current.value))
const isDirect = ref(true)
const buttonRef = useTemplateRef('button')
const indicatorStyle = ref<CSSProperties | undefined>(undefined)
const minHeight = ref(0)
const tabItemRef = useTemplateRef('tabItem')

const currentIsValid = computed<boolean>(() => tabItemRef.value?.[currentIndex.value]?.isValid ?? true)
const hasNoValueFirst = computed<number>(() => {
  if (!props.stepper) return 0

  const index = tabItemRef.value?.findIndex(item => item?.hasValue === false) ?? 0

  if (index === -1) return defaultSlotsKeys.value.length

  return index
})

const switchOnInvalid = debounce((key: string): void => {
  if (currentIsValid.value !== false) switchTab(key)
}, 50)

const switchTab = throttle((key: string): void => {
  if (current.value === key) return

  updateCurrent(key)
}, 200)

const updateCurrent = (value: string) => {
  tabItemRef.value?.[currentIndex.value]?.emitHeight?.()

  setCurrentDebounced(value)
}

const updateIndex = (value: number) => {
  tabItemRef.value?.[currentIndex.value]?.emitHeight?.()

  setCurrentDebounced(defaultSlotsKeys.value[value])
}

let timeout: NodeJS.Timeout | null = null

const scrollToTabContent = () => {
  if (!mobile || !props.side) return

  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }

  timeout = setTimeout(() => {
    containerRef.value?.scrollTo({left: document.documentElement.offsetWidth, behavior: 'smooth'})

    timeout = null
  }, 300)
}

const setCurrentDebounced = debounce((value: string) => {
  if (current.value === value || !defaultSlotsKeys.value.includes(value)) return
  if (defaultSlots.value[defaultSlotsKeys.value.indexOf(value)].props?.disabled !== undefined) return

  isDirect.value = defaultSlotsKeys.value.indexOf(current.value) < defaultSlotsKeys.value.indexOf(value)
  current.value = value

  scrollToTabContent()
}, 100)

const next = (): void => {
  switchTab(defaultSlotsKeys.value[currentIndex.value + 1])
}

const previous = (): void => {
  switchTab(defaultSlotsKeys.value[currentIndex.value - 1])
}

const updateHeight = (value: number): void => {
  if (minHeight.value >= value) return

  minHeight.value = value
}

const validate = (index: number, ...args: Parameters<ComponentInstance<typeof WForm>['validate']>): ReturnType<ComponentInstance<typeof WForm>['validate']> => {
  return tabItemRef.value?.[index]?.validate(...args)
}

const validateIfNoError = (index: number, ...args: Parameters<ComponentInstance<typeof WForm>['validate']>): ReturnType<ComponentInstance<typeof WForm>['validate']> => {
  if (tabItemRef.value?.[index]?.errorMessage) return tabItemRef.value?.[index].errorMessage

  return tabItemRef.value?.[index]?.validate(...args)
}

const invalidate = (index: number, ...args: Parameters<ComponentInstance<typeof WForm>['invalidate']>): ReturnType<ComponentInstance<typeof WForm>['invalidate']> => {
  return tabItemRef.value?.[index]?.invalidate(...args)
}

const initModel = (index: number, ...args: Parameters<ComponentInstance<typeof WForm>['initModel']>): ReturnType<ComponentInstance<typeof WForm>['initModel']> => {
  return tabItemRef.value?.[index]?.initModel(...args)
}

const updateIndicator = () => {
  buttonRef.value?.forEach(item => item?.update())
}

const updateScrollPosition = (value: {left?: number, top?: number}) => {
  if (!buttonContainerRef.value) return

  if (props.side) {
    if (buttonContainerRef.value.scrollHeight <= buttonContainerRef.value.offsetHeight) return

    buttonContainerRef.value.scrollTo({top: value.top! - buttonContainerRef.value.offsetHeight / 2, behavior: 'smooth'})
  } else {
    if (buttonContainerRef.value.scrollWidth <= buttonContainerRef.value.offsetWidth) return

    buttonContainerRef.value.scrollTo({left: value.left! - buttonContainerRef.value.offsetWidth / 2, behavior: 'smooth'})
  }
}

const tabItemListenerInjected = inject(wTabItemListener, null)
const tabItemUnlistenerInjected = inject(wTabItemUnlistener, null)

watch(current, value => {
  emit('update:current', value)
}, {immediate: true})

watch(currentIndex, value => {
  emit('update:current-index', value)
}, {immediate: true})

watch(defaultSlotsKeys, (newValue, oldValue) => {
  const newIndex = newValue.findIndex(item => !oldValue.includes(item))

  if (props.switchToNew && newIndex !== -1) {
    switchTab(newValue[newIndex])
    return
  }

  if (!newValue.includes(current.value)) {
    switchTab(newValue[oldValue.indexOf(current.value) - 1])
    return
  }
})

watch(defaultSlotsKeys, value => {
  emit('update:tabs-length', value.length)
}, {immediate: true})

onMounted(() => {
  tabItemListenerInjected?.(updateIndicator)
})

onUnmounted(() => {
  tabItemUnlistenerInjected?.(updateIndicator)
})

defineExpose({
  updateCurrent,
  updateIndex,
  next,
  previous,
  validate,
  validateIfNoError,
  invalidate,
  initModel,
})
</script>
