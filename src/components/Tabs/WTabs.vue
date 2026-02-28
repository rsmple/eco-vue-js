<template>
  <div
    ref="container"
    class="grid gap-4"
    :class="{
      'grid grid-cols-1': !side,
      'sm-not:grid-cols-[repeat(2,100vw)] sm-not:snap-x sm-not:snap-mandatory sm-not:snap-always sm-not:overflow-x-auto sm-not:overscroll-x-contain grid grid-cols-[minmax(auto,var(--w-tabs-side-width,auto)),1fr] items-start': side,
    }"
  >
    <div
      v-if="!noHeader"
      ref="buttonContainer"
      class="relative"
      :class="{
        'sm-not:snap-start grid grid-cols-[1fr,auto]': side,
        'no-scrollbar sm-not:-pl--inner-margin sm-not:-mx---inner-margin flex overflow-x-auto overscroll-x-contain': !side,
        'flex-wrap': !side && wrap,
        'pr-[50%]': !side && !wrap,
        [headerClass ?? '']: true,
      }"
    >
      <template
        v-for="(slot, index) in defaultSlotsAll"
        :key="slot.props?.name"
      >
        <TabTitleButton
          v-if="isTabItem(slot)"
          ref="button"
          :active="current === slot.props.name"
          :index="index"
          :title="slot.props.title"
          :icon="slot.props.icon"
          :has-changes="slot.props.hasChanges ?? slot.props['has-changes' as never] ?? tabItemRefByName[slot.props.name]?.hasChanges"
          :has-error="slot.props.hasError ?? slot.props['has-error' as never] ?? tabItemRefByName[slot.props.name]?.hasError"
          :has-value="slot.props.hasValue ?? slot.props['has-value' as never] ?? tabItemRefByName[slot.props.name]?.hasValue"
          :first="defaultSlots.indexOf(slot) === 0"
          :last="defaultSlots.indexOf(slot) === defaultSlots.length - 1"
          :disabled="stepper ? defaultSlots.indexOf(slot) > hasNoValueFirst : false"
          :stepper="stepper"
          :show-has-value="showHasValue"
          :side="side"
          :status-icon="statusIcon"
          :enable-overflow="side"
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
            v-if="(slot.children as Record<string, Component>)?.right || hasOnClose"
            #right="scope"
          >
            <component
              v-bind="scope"
              :is="(slot.children as Record<string, Component>)?.right"
            />

            <button
              v-if="'onClose' in slot.props"
              class="w-ripple-trigger text-description sm-not:mx-3 flex h-full items-center justify-center px-1"
              aria-label="Close tab"
              @click="(slot.props.onClose as () => void)?.()"
            >
              <div class="w-ripple w-ripple-hover relative rounded-full">
                <IconClose />
              </div>
            </button>
            
            <div
              v-else
              class="w-10"
            />
          </template>
        </TabTitleButton>

        <component
          :is="slot"
          v-else
        />
      </template>
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
        :enter-from-class="lessTransitions || side || hasScrollbar ? 'opacity-0' : 'opacity-0 translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor))]'"
        :leave-to-class="lessTransitions || side || hasScrollbar ? 'opacity-0' : 'opacity-0 translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor)*-1)]'"
      >
        <TabItem
          v-for="slot in defaultSlots"
          ref="tabItem"
          :key="slot.props.name"
          :name="slot.props.name"
          :title="slot.props.title"
          :active="slot.props.name === current"
          :removable="slot.props.removable ?? false"
          :enable-status="statusIcon || showHasValue"
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
import type {TabsItemProps, TabsProps} from './types'

import {type Component, type RendererElement, type RendererNode, type VNode, computed, inject, onMounted, onUnmounted, ref, useTemplateRef, watch} from 'vue'

import IconClose from '@/assets/icons/IconClose.svg?component'

import {Notify} from '@/utils/Notify'
import {useIsMobile} from '@/utils/mobile'
import {debounce, getHasScrollbar, throttle, unwrapSlots} from '@/utils/utils'

import TabItem from './components/TabItem.vue'
import TabTitleButton from './components/TabTitleButton.vue'
import {wTabItemListener, wTabItemUnlistener} from './models/injection'

const props = defineProps<TabsProps>()

const emit = defineEmits<{
  (e: 'update:current', value: string): void
  (e: 'update:current-index', value: number): void
  (e: 'update:has-changes', value: boolean): void
  (e: 'update:current-title', value: string | undefined): void
  (e: 'update:tabs-length', value: number): void
  (e: 'update:progress', value: number): void
  (e: 'update:first', value: boolean): void
  (e: 'update:last', value: boolean): void
}>()

const {isMobile} = useIsMobile()

const hasScrollbar = getHasScrollbar()

const slots = defineSlots<{
  default: () => void
}>()

const containerRef = useTemplateRef('container')
const buttonContainerRef = useTemplateRef('buttonContainer')

const defaultSlotsRaw = computed(() => props.customSlots ?? slots.default?.() ?? [])

const isTabItem = (slot: VNode): slot is VNode<RendererNode, RendererElement, TabsItemProps> & {props: TabsItemProps} => {
  return slot.type instanceof Object && '__name' in slot.type && slot.type.__name === 'WTabsItem'
}

const defaultSlotsAll = computed(() => {
  return unwrapSlots(defaultSlotsRaw.value)
})

const defaultSlots = computed(() => {
  return defaultSlotsAll.value.filter(isTabItem)
})

const defaultSlotsKeys = computed<string[]>(() => defaultSlots.value.map(item => item.props.name))

const current = ref<string>(props.initTab ?? (props.initTabIndex !== undefined
  ? defaultSlotsKeys.value[props.initTabIndex]!
  : defaultSlots.value.find(slot => !!slot.props?.init)?.props?.name ?? defaultSlotsKeys.value[0]!
))
const currentIndex = computed(() => defaultSlotsKeys.value.indexOf(current.value))
const isDirect = ref(true)
const buttonRef = useTemplateRef<ComponentInstance<typeof TabTitleButton>[]>('button')
const minHeight = ref(0)
const tabItemRef = useTemplateRef('tabItem')

const tabItemRefByName = computed(() => {
  const result: Record<string, ComponentInstance<typeof TabItem>> = {}

  if (tabItemRef.value) {
    for (const item of tabItemRef.value) {
      if (!item?.name) continue
      result[item.name] = item
    }
  }

  return result
})

const hasNoValueFirst = computed<number>(() => {
  if (!props.stepper) return 0

  const index = defaultSlotsAll.value.findIndex(item => isTabItem(item) && item.props.hasValue === false)

  if (index === -1) return defaultSlotsKeys.value.length

  return index
})

const hasOnClose = computed(() => defaultSlotsAll.value.some(item => item.props && 'onClose' in item.props))

const first = computed<boolean>(() => currentIndex.value === 0)
const last = computed<boolean>(() => currentIndex.value === defaultSlotsKeys.value.length - 1)

const switchTab = throttle((key: string): void => {
  if (current.value === key) {
    scrollToTabContent()
    return
  }

  updateCurrent(key)
}, 200)

const updateCurrent = (value: string) => {
  tabItemRef.value?.[currentIndex.value]?.emitHeight?.()

  setCurrentDebounced(value)
}

const updateIndex = (value: number) => {
  tabItemRef.value?.[currentIndex.value]?.emitHeight?.()

  setCurrentDebounced(defaultSlotsKeys.value[value]!)
}

let timeout: NodeJS.Timeout | null = null

const scrollToTabContent = () => {
  if (!isMobile.value || !props.side) return

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
  if (defaultSlots.value[defaultSlotsKeys.value.indexOf(value)]?.props?.disabled !== undefined) return

  isDirect.value = defaultSlotsKeys.value.indexOf(current.value) < defaultSlotsKeys.value.indexOf(value)
  current.value = value

  scrollToTabContent()
}, 100)

const next = (update = false): void => {
  const errorMessage = update ? validate(currentIndex.value) : validateIfNoError(currentIndex.value)

  if (errorMessage) {
    Notify.warn({title: 'Form contains invalid values', caption: errorMessage.length < 200 ? errorMessage : undefined})

    return
  }

  switchTab(defaultSlotsKeys.value[currentIndex.value + 1]!)
}

const previous = (): void => {
  switchTab(defaultSlotsKeys.value[currentIndex.value - 1]!)
}

const jump = (name: string, update: boolean): void => {
  const valid = defaultSlotsKeys.value
    .slice(currentIndex.value, defaultSlotsKeys.value.indexOf(name))
    .every(item => {
      const index = defaultSlotsAll.value.findIndex(slot => isTabItem(slot) && slot.props.name === item)
      const errorMessage = update ? validate(index) : validateIfNoError(index)

      if (errorMessage) {
        Notify.warn({title: 'Form contains invalid values', caption: errorMessage.length < 200 ? errorMessage : undefined})

        return false
      }

      return true
    })

  if (valid) return switchTab(name)
}

const updateHeight = (value: number): void => {
  if (minHeight.value >= value) return

  minHeight.value = value
}

const validate = (index: number): string | undefined => {
  const slot = defaultSlotsAll.value[index]

  if (!slot || !isTabItem(slot)) return undefined

  return slot.props.validate?.()
}

const validateIfNoError = (index: number): string | undefined => {
  const slot = defaultSlotsAll.value[index]

  if (!slot || !isTabItem(slot) || slot.props.hasError) return undefined

  return slot.props.validate?.()
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
    switchTab(newValue[newIndex]!)
    return
  }

  if (!newValue.includes(current.value)) {
    switchTab(newValue[oldValue.indexOf(current.value) - 1]!)
    return
  }
})

watch(defaultSlotsKeys, value => {
  emit('update:tabs-length', value.length)
}, {immediate: true})

if (props.stepper) {
  const progress = computed(() => 100 * (currentIndex.value + 1) / defaultSlotsKeys.value.length)

  watch(progress, value => {
    emit('update:progress', value)
  }, {immediate: true})

  watch(first, value => {
    emit('update:first', value)
  }, {immediate: true})

  watch(last, value => {
    emit('update:last', value)
  }, {immediate: true})
}

if (!props.noSwitchOnInvalid) {
  const switchTabDebounced = debounce(switchTab, 50)

  const invalidName = computed<string | undefined>(() => defaultSlotsAll.value.find(slot => isTabItem(slot) && slot.props.hasError)?.props?.name)

  watch(invalidName, value => {
    if (value && value !== current.value) switchTabDebounced(value)
  })
}

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
  jump,
})
</script>
