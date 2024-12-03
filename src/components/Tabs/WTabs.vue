<template>
  <div
    class="grid gap-4"
    :class="{
      'grid grid-cols-1': !side,
      'grid grid-cols-[auto,1fr] items-start': side,
    }"
  >
    <div
      v-if="!noHeader"
      ref="buttonContainer"
      class="no-scrollbar relative flex snap-x snap-mandatory snap-always overflow-x-auto overscroll-x-contain"
      :class="{
        'flex-col': side,
      }"
    >
      <TabTitleButton
        v-for="(slot, index) in defaultSlots"
        :key="slot.props?.name"
        ref="button"
        :active="current === slot.props?.name"
        :index="index"
        :title="slot.props?.title"
        :icon="slot.props?.icon"
        :has-changes="hasChangesMap[slot.props?.name] === true"
        :has-error="isValidMap[slot.props?.name] === false"
        :side="side"
        @update:indicator-style="indicatorStyle = $event"
        @update:scroll-position="updateScrollPosition"
        @click="switchTab(slot.props?.name)"
      >
        <template
          v-if="(slot.children as Record<string, Component>)?.title"
          #title
        >
          <component :is="(slot.children as Record<string, Component>)?.title" />
        </template>

        <template
          v-if="(slot.children as Record<string, Component>)?.suffix"
          #suffix
        >
          <component :is="(slot.children as Record<string, Component>)?.suffix" />
        </template>

        <template
          v-if="(slot.children as Record<string, Component>)?.right"
          #right
        >
          <component :is="(slot.children as Record<string, Component>)?.right" />
        </template>
      </TabTitleButton>

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
      v-if="defaultSlots.some(slot => (slot.children as Record<string, Component>)?.default)"
      class="relative h-full transition-[min-height] duration-300"
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
          :active="slot.props?.name === current"
          :removable="slot.props?.removable"
          @update:height="!disableMinHeight && updateHeight($event)"
          @update:active="$emit('update:current-title', slot.props?.title)"
        >
          <WForm
            ref="form"
            :name="slot.props?.name"
            :title="slot.props?.title"
            @update:is-valid="updateIsValidMap(slot.props?.name, $event)"
            @update:has-changes="hasChangesMap[slot.props?.name] = $event"
          >
            <component :is="(slot.children as Record<string, Component>)?.default" />
          </WForm>
        </TabItem>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {TabsProps} from './types'

import {type CSSProperties, type Component, type VNode, computed, inject, nextTick, onMounted, onUnmounted, reactive, ref, useSlots, useTemplateRef, watch} from 'vue'

import WForm from '@/components/Form/WForm.vue'

import {debounce, throttle} from '@/utils/utils'

import TabItem from './components/TabItem.vue'
import TabTitleButton from './components/TabTitleButton.vue'
import {wTabItemListener, wTabItemUnlistener} from './models/injection'

const props = defineProps<TabsProps>()

const emit = defineEmits<{
  (e: 'update:current', value: string): void
  (e: 'update:current-index', value: number): void
  (e: 'update:has-changes', value: boolean): void
  (e: 'update:current-title', value: string): void
  (e: 'update:tabs-length', value: number): void
}>()

const slots = useSlots()

const buttonContainerRef = useTemplateRef('buttonContainer')

const defaultSlots = computed(() => {
  const result: VNode[] = []

  ;(props.customSlots ?? slots.default?.() ?? []).forEach(item => {
    if (Array.isArray(item.children)) result.push(...item.children as VNode[])

    if (typeof item.type === 'symbol') return

    result.push(item)
  })

  return result
})

const defaultSlotsKeys = computed<string[]>(() => defaultSlots.value.map(item => item.props?.name))

const current = ref<string>(defaultSlotsKeys.value[props.initTab ?? 0])
const currentIndex = computed(() => defaultSlotsKeys.value.indexOf(current.value))
const isDirect = ref(true)
const buttonRef = useTemplateRef('button')
const indicatorStyle = ref<CSSProperties | undefined>(undefined)
const minHeight = ref(0)
const tabItemRef = useTemplateRef('tabItem')
const formRef = useTemplateRef('form')

const isValidMap = reactive<Record<string, boolean | undefined>>({})
const hasChangesMap = reactive<Record<string, boolean | undefined>>({})

const hasChanges = computed<boolean>(() => Object.values(hasChangesMap).includes(true))

const updateIsValidMap = (key: string, value: boolean | undefined): void => {
  isValidMap[key] = value

  nextTick()
    .then(() => {
      if (value === false && isValidMap[current.value] !== false) switchTab(key)
    })
}

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

const setCurrentDebounced = debounce((value: string) => {
  if (current.value === value || !defaultSlotsKeys.value.includes(value)) return
  if (defaultSlots.value[defaultSlotsKeys.value.indexOf(value)].props?.disabled !== undefined) return

  isDirect.value = defaultSlotsKeys.value.indexOf(current.value) < defaultSlotsKeys.value.indexOf(value)
  current.value = value
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
  return formRef.value?.[index]?.validate(...args)
}

const invalidate = (index: number, ...args: Parameters<ComponentInstance<typeof WForm>['invalidate']>): ReturnType<ComponentInstance<typeof WForm>['invalidate']> => {
  return formRef.value?.[index]?.invalidate(...args)
}

const initModel = (index: number, ...args: Parameters<ComponentInstance<typeof WForm>['initModel']>): ReturnType<ComponentInstance<typeof WForm>['initModel']> => {
  return formRef.value?.[index]?.initModel(...args)
}

const updateIndicator = () => {
  buttonRef.value?.forEach(item => item?.update())
}

const updateScrollPosition = (value: {left?: number, top?: number}) => {
  if (!buttonContainerRef.value) return

  if (props.side) {
    if (buttonContainerRef.value.scrollHeight <= buttonContainerRef.value.offsetHeight) return

    buttonContainerRef.value.scrollTo({top: ((value.top ?? 0) - buttonContainerRef.value.offsetTop) / 2, behavior: 'smooth'})
  } else {
    if (buttonContainerRef.value.scrollWidth <= buttonContainerRef.value.offsetWidth) return

    buttonContainerRef.value.scrollTo({left: ((value.left ?? 0) - buttonContainerRef.value.offsetLeft) / 2, behavior: 'smooth'})
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

watch(hasChanges, value => {
  emit('update:has-changes', value)
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
  invalidate,
  initModel,
})
</script>
