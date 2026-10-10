<template>
  <div
    ref="container"
    :class="{
      'sm-not:grid-cols-[repeat(2,100vw)] sm-not:snap-x sm-not:snap-mandatory sm-not:snap-always sm-not:overflow-x-auto sm-not:overscroll-x-contain grid-cols-[minmax(auto,var(--w-tabs-side-width,auto))_1fr] items-start gap-4': side && !flat,
    }"
    class="grid"
  >
    <!-- A stepper's title and progress go to the frame it is in, such as a modal's header. Outside a frame, or when another stepper has it, the progress is shown here. -->
    <template v-if="hasControls">
      <OverlayRegionPart
        v-if="isFramed"
        region="title"
        fallback
      >
        {{ currentTitle }}
      </OverlayRegionPart>

      <OverlayRegionPart
        region="subtitle"
        :in-place="!isFramed"
      >
        <WProgress
          :model-value="progress"
          :class="{'mb-4': !isFramed}"
        />
      </OverlayRegionPart>
    </template>

    <div
      v-if="!noHeader && !flat"
      ref="buttonContainer"
      class="relative"
      :class="{
        'sm-not:snap-start grid grid-cols-[1fr_auto]': side,
        'no-scrollbar mb-4 flex overflow-x-auto overscroll-x-contain': !side,
        // In an overlay frame the bar scrolls from edge to edge, with the first tab in line with the content. On a page it keeps the phone inset.
        'w-frame-bleed px-(--w-frame-padding)': !side && frame !== null,
        'sm-not:pl---inner-margin': !side && frame === null,
        'flex-wrap': !side && wrap,
        'shadow-[inset_0_-1px_var(--color-line-subtle)]': !side && divider,
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
          :count="slot.props.count"
          :has-changes="slot.props.hasChanges ?? slot.props['has-changes' as never] ?? tabItemRefByName[slot.props.name]?.hasChanges"
          :has-error="slot.props.hasError ?? slot.props['has-error' as never] ?? tabItemRefByName[slot.props.name]?.hasError"
          :has-value="slot.props.hasValue ?? slot.props['has-value' as never] ?? tabItemRefByName[slot.props.name]?.hasValue"
          :first="defaultSlotsIndexByName[slot.props.name] === 0"
          :last="defaultSlotsIndexByName[slot.props.name] === defaultSlots.length - 1"
          :disabled="isSlotDisabled(slot) || (stepper ? (defaultSlotsIndexByName[slot.props.name] ?? 0) > hasNoValueFirst : false)"
          :stepper="stepper"
          :show-has-value="showHasValue"
          :side="side"
          :status-icon="statusIcon"
          :enable-overflow="side"
          :indicator="indicator"
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
      class="relative h-full"
      :class="{
        'transition-[min-height] duration-300': !flat,
        'sm-not:snap-start': side,
      }"
      :style="flat ? undefined : {minHeight: minHeight ? minHeight + 'px' : 'auto', '--direction-factor': isDirect ? '1' : '-1'}"
    >
      <TransitionGroup
        enter-active-class="transition-[translate,opacity] duration-250 w-full"
        leave-active-class="transition-[translate,opacity] duration-250 w-full absolute top-0"
        :enter-from-class="lessTransitions || side || hasScrollbar ? 'opacity-0' : 'opacity-0 translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor))]'"
        :leave-to-class="lessTransitions || side || hasScrollbar ? 'opacity-0 absolute' : 'opacity-0 translate-x-[calc((100%+var(--inner-margin))*var(--direction-factor)*-1)]'"
        :css="!flat"
      >
        <TabItem
          v-for="slot in defaultSlots"
          :ref="(setTabRef as VNodeRef)"
          :key="slot.props.name"
          :name="slot.props.name"
          :title="slot.props.title"
          :active="slot.props.name === current"
          :removable="slot.props.removable ?? false"
          :flat="flat ?? false"
          @update:height="!disableMinHeight && !flat && updateHeight($event)"
        >
          <component :is="slot" />
        </TabItem>
      </TransitionGroup>
    </div>

    <!-- The stepper's buttons, pinned by the frame, such as a modal's footer. -->
    <OverlayRegionPart
      v-if="hasControls && isFramed"
      region="actions"
    >
      <TabsStepperButtons v-bind="stepperButtons" />
    </OverlayRegionPart>

    <div
      v-else-if="hasControls"
      class="gap---inner-margin mt-4 flex"
    >
      <TabsStepperButtons v-bind="stepperButtons" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {TabsItemProps, TabsProps} from './types'

import {type Component, type RendererElement, type RendererNode, type VNode, type VNodeRef, computed, h, inject, onBeforeUpdate, onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch} from 'vue'

import WProgress from '@/components/Progress/WProgress.vue'
import WUniformErrorMessage from '@/components/Uniform/WUniformErrorMessage.vue'

import IconClose from '@/assets/icons/IconClose.svg?component'

import OverlayRegionPart from '@/components/Modal/components/OverlayRegionPart.vue'
import {wOverlayRegions} from '@/components/Modal/models/overlayRegistry'
import {wUniformStepperController} from '@/components/Uniform/utils/injection'
import {Notify} from '@/utils/Notify'
import {useOverlayClose, useOverlayFrame} from '@/utils/Overlay'
import {useIsMobile} from '@/utils/mobile'
import {getText} from '@/utils/texts'
import {debounce, getHasScrollbar, getPropValue, throttle, unwrapSlots} from '@/utils/utils'

import TabItem from './components/TabItem.vue'
import TabTitleButton from './components/TabTitleButton.vue'
import TabsStepperButtons from './components/TabsStepperButtons.vue'
import {wTabItemListener, wTabItemUnlistener} from './models/injection'

const props = defineProps<TabsProps>()

const emit = defineEmits<{
  /** Name of the open tab. Also emitted on mount. */
  (e: 'update:current', value: string): void
  /** Index of the open tab. Also emitted on mount. */
  (e: 'update:current-index', value: number): void
  /** Whether any tab has unsaved changes. */
  (e: 'update:has-changes', value: boolean): void
  /** Title of the open tab, also when the title itself changes. */
  (e: 'update:current-title', value: string | undefined): void
  /** Number of tabs. Also emitted on mount. */
  (e: 'update:tabs-length', value: number): void
  /** With `stepper`, the share of steps reached, in percent. */
  (e: 'update:progress', value: number): void
  /** With `stepper`, whether the first tab is open. */
  (e: 'update:first', value: boolean): void
  /** With `stepper`, whether the last tab is open. */
  (e: 'update:last', value: boolean): void
  /** With `stepperControls`, the submit button was clicked on the last step and the step is valid. Not emitted inside a form with `api-method`, which is submitted instead. */
  (e: 'submit'): void
}>()

const {isMobile} = useIsMobile()

const hasScrollbar = getHasScrollbar()

const slots = defineSlots<{
  /** WTabsItem elements. Anything else is rendered among the tab buttons. */
  default: () => VNode[]
}>()

const containerRef = useTemplateRef('container')
const buttonContainerRef = useTemplateRef('buttonContainer')

const isTabItem = (slot: VNode): slot is VNode<RendererNode, RendererElement, TabsItemProps> & {props: TabsItemProps} => {
  return slot.type instanceof Object && '__name' in slot.type && slot.type.__name === 'WTabsItem'
}

const isSlotDisabled = (slot: VNode): boolean => {
  const value = slot.props?.disabled

  return value !== undefined && value !== false
}

const defaultSlotsRaw = shallowRef<VNode[]>(props.customSlots ?? slots.default?.() ?? [])

const refreshSlots = () => {
  defaultSlotsRaw.value = props.customSlots ?? slots.default?.() ?? []
}

onBeforeUpdate(refreshSlots)

watch(
  () => props.customSlots ?? slots.default?.() ?? [],
  value => {
    defaultSlotsRaw.value = value
  },
)

const defaultSlotsAll = computed(() => unwrapSlots(defaultSlotsRaw.value))

const defaultSlots = computed(() => defaultSlotsAll.value.filter(isTabItem))

const defaultSlotsKeys = computed<string[]>(() => defaultSlots.value.map(item => item.props.name))

const defaultSlotsIndexByName = computed<Record<string, number>>(() => {
  const map: Record<string, number> = {}
  defaultSlots.value.forEach((slot, i) => { map[slot.props.name] = i })
  return map
})

const current = ref<string>(props.initTab ?? (props.initTabIndex !== undefined
  ? defaultSlotsKeys.value[props.initTabIndex]!
  : defaultSlots.value.find(slot => !!slot.props?.init)?.props?.name ?? defaultSlotsKeys.value[0]!
))
const currentIndex = computed(() => defaultSlotsKeys.value.indexOf(current.value))

watch(
  () => unwrapSlots(props.customSlots ?? slots.default?.() ?? []).filter(isTabItem)[currentIndex.value]?.props?.title,
  value => emit('update:current-title', value),
  {immediate: true, flush: 'post'},
)

const isDirect = ref(true)
const buttonRef = useTemplateRef<ComponentInstance<typeof TabTitleButton>[]>('button')
const minHeight = ref(0)

const tabItemRefByName = ref<Record<string, ComponentInstance<typeof TabItem>>>({})

const setTabRef = (value: ComponentInstance<typeof TabItem> | null) => {
  if (typeof value?.name !== 'string') return

  tabItemRefByName.value[value.name] = value
}

const hasNoValueFirst = computed<number>(() => {
  if (!props.stepper) return 0

  const index = defaultSlots.value.findIndex(item => item.props.hasValue === false)

  if (index === -1) return defaultSlotsKeys.value.length

  return index
})

const hasChanges = computed<boolean>(() => defaultSlots.value.some(slot => getPropValue(slot.props, 'hasChanges') ?? tabItemRefByName.value[slot.props.name]?.hasChanges))

watch(hasChanges, value => {
  emit('update:has-changes', value)
})

const hasOnClose = computed(() => defaultSlotsAll.value.some(item => item.props && 'onClose' in item.props))

const first = computed<boolean>(() => currentIndex.value === 0)
const last = computed<boolean>(() => currentIndex.value === defaultSlotsKeys.value.length - 1)

const switchTab = throttle(async (key: string) => {
  if (current.value === key) {
    scrollToTabContent()
    return
  }

  const targetIndex = defaultSlotsKeys.value.indexOf(key)

  const requireSave = targetIndex > currentIndex.value && defaultSlots.value
    .slice(Math.max(currentIndex.value, 0), targetIndex)
    .some(item => getPropValue(item.props, 'requireSave'))

  if (requireSave && stepperController && (stepperController.hasChanges() || stepperController.fullPayload())) {
    if (!await stepperController.submit()) return
  }

  updateCurrent(key)
}, 200)

const updateCurrent = (value: string) => {
  setCurrentDebounced(value)
}

const updateIndex = (value: number) => {
  setCurrentDebounced(defaultSlotsKeys.value[value]!)
}

let timeout: ReturnType<typeof setTimeout> | null = null

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
  const slot = defaultSlots.value[defaultSlotsKeys.value.indexOf(value)]
  if (slot && isSlotDisabled(slot)) return

  isDirect.value = defaultSlotsKeys.value.indexOf(current.value) < defaultSlotsKeys.value.indexOf(value)
  current.value = value

  scrollToTabContent()
}, 100)

const stepperController = inject(wUniformStepperController, null)

const frame = useOverlayFrame()

const hasControls = props.stepper && props.stepperControls && !props.flat

// The frame shows one stepper — the first to claim it. Another one, such as a stepper inside a step, keeps its controls in itself.
const regions = hasControls ? inject(wOverlayRegions, null) : null
const owner = Symbol('stepper')
const isFramed = regions?.claim('stepper', owner) ?? false

if (isFramed) onUnmounted(() => regions?.release('stepper', owner))

const closeOverlay = useOverlayClose()

const currentTitle = computed(() => defaultSlots.value[currentIndex.value]?.props.title)

/** Runs the tab's `validate` and, in a stepper, checks the fields inside it. Shows a warning and returns `false` if anything is invalid. */
const checkTab = (index: number, update: boolean): boolean => {
  const errorMessage = update ? validate(index) : validateIfNoError(index)

  if (errorMessage) {
    Notify.warn({title: getText('invalidData'), caption: errorMessage.length < 200 ? errorMessage : undefined})

    return false
  }

  const key = defaultSlotsKeys.value[index]
  const message = props.stepper && key !== undefined ? tabItemRefByName.value[key]?.validate() : undefined

  if (message) {
    Notify.warn({title: getText('invalidData'), caption: h(WUniformErrorMessage, {message})})

    return false
  }

  return true
}

const next = async (update = false): Promise<void> => {
  if (!checkTab(currentIndex.value, update)) return

  switchTab(defaultSlotsKeys.value[currentIndex.value + 1]!)
}

const previous = (): void => {
  switchTab(defaultSlotsKeys.value[currentIndex.value - 1]!)
}

const jump = (name: string, update: boolean) => {
  const valid = defaultSlotsKeys.value
    .slice(currentIndex.value, defaultSlotsKeys.value.indexOf(name))
    .every(item => checkTab(defaultSlotsKeys.value.indexOf(item), update))

  if (valid) return switchTab(name)
}

const submit = async (): Promise<void> => {
  if (!checkTab(currentIndex.value, false)) return

  if (stepperController) await stepperController.submit()
  else emit('submit')
}

const stepperButtons = computed(() => ({
  first: first.value,
  last: last.value,
  // Only the stepper the frame shows closes it; one inside, such as in a step, goes back no further than its first step.
  closable: isFramed && closeOverlay !== null,
  hasChanges: hasChanges.value || (stepperController?.hasChanges() ?? false),
  submitting: props.submitting || (stepperController?.submitting() ?? false),
  disabledNext: props.disabledNext ?? false,
  submitText: props.submitText,
  onPrevious: previous,
  onNext: () => next(),
  onSubmit: submit,
  onClose: () => closeOverlay?.(),
}))

const updateHeight = (value: number): void => {
  if (minHeight.value >= value) return

  minHeight.value = value
}

const validate = (index: number): string | undefined => {
  return defaultSlots.value[index]?.props.validate?.()
}

const validateIfNoError = (index: number): string | undefined => {
  const slot = defaultSlots.value[index]

  if (!slot || slot.props.hasError) return undefined

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
  const oldSet = new Set(oldValue)
  const newIndex = newValue.findIndex(item => !oldSet.has(item))

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

watch(defaultSlotsKeys, newKeys => {
  const active = new Set(newKeys)
  for (const name in tabItemRefByName.value) {
    if (!active.has(name)) delete tabItemRefByName.value[name]
  }
}, {flush: 'post'})

const progress = computed(() => 100 * (currentIndex.value + 1) / defaultSlotsKeys.value.length)

if (props.stepper) {
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

  watch(() => defaultSlots.value.filter(slot => getPropValue(slot.props, 'hasError') || tabItemRefByName.value[slot.props.name]?.hasError).map(item => item.props?.name), value => {
    if (value.length && !value.includes(current.value)) switchTabDebounced(value[0])
  })
}

onMounted(() => {
  tabItemListenerInjected?.(updateIndicator)
  document.fonts.ready.then(updateIndicator)
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
