<template>
  <button
    :disabled="disabled"
    class="w-ripple-trigger grid select-none grid-cols-[auto_1fr] font-semibold outline-none transition-colors duration-500"
    :class="{
      'tone-primary text-tone': !hasError && active,
      'tone-negative text-tone': hasError,
      'tone-positive text-tone': !active && !hasError && hasValue && showHasValue,
      'text-description': !active && !hasError && (!showHasValue || !hasValue),
      'cursor-not-allowed opacity-50': disabled,
      'cursor-pointer': !disabled,
    }"
    @click="!disabled && $emit('click', $event)"
  >
    <div
      v-if="indicator"
      class="p-8"
    >
      <div
        class="text-surface rounded-full bg-inherit p-1 outline transition-[outline-width] duration-500" 
        :class="{
          'tone-negative bg-tone-fill outline-tone/10': hasError,
          'tone-positive bg-tone-fill outline-tone/10': !hasError && hasValue && showHasValue,
          'bg-track-strong outline-track-strong/10': !hasError && (!showHasValue || !hasValue),
          'outline-[1.5rem]': active,
        }"
      >
        <IconNegativeInfo
          v-if="hasError"
          class="size-8"
        />

        <IconCheckCircle
          v-else-if="hasValue"
          class="size-8"
        />

        <IconClose
          v-else
          class="size-8"
        />
      </div>
    </div>

    <div
      class="relative col-start-2 self-start"
      :class="{
        'mt-3.5': indicator,
        'w-ripple w-ripple-hover': !disabled,
      }"
    >
      <slot
        v-if="$slots.title"
        name="title"
        v-bind="{hasChanges, hasError, hasValue}"
      />

      <div
        v-else
        class="group/overflow grid grid-cols-[1fr_auto] items-center py-2"
        :class="{
          'justify-center text-center': !side,
          'text-start': side,
        }"
      >
        <div
          class="whitespace-nowrap px-3"
          :class="{
            'sm-not:pl---inner-margin': side,
          }"
        >
          <component :is="enableOverflow ? WTextOverflow : WEmptyComponent">
            <Suspense v-if="icon !== undefined">
              <component 
                :is="icon"
                class="square-[1.25em] -mt-1 inline"
              />

              <template #fallback>
                <svg class="square-[1.25em] -mt-1 inline">
                  <g />
                </svg>
              </template>
            </Suspense>

            {{ title }} {{ count !== undefined ? `(${numberFormatter.format(count)})` : '' }}
          </component>
        </div>

        <WStatusIcon
          v-if="statusIcon"
          :has-value="hasValue"
          :has-error="hasError"
          class="sm-not:mr---inner-margin square-4 ml-auto mr-4"
        />

        <slot
          name="suffix" 
          v-bind="{hasChanges, hasError, hasValue}"
        />
      </div>
  
      <Transition
        enter-active-class="transition-opacity"
        leave-active-class="transition-opacity"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="hasChanges"
          class="square-2 absolute right-1 top-1 rounded-full transition-colors duration-200"
          :class="{
            'tone-info bg-tone-fill': !hasError,
            'tone-negative bg-tone-fill': hasError,
          }"
        />
      </Transition>

      <Transition
        enter-active-class="transition-[scale,opacity] origin-center duration-300"
        leave-active-class="transition-[scale,opacity] origin-center duration-300"
        enter-from-class="scale-x-0 opacity-0"
        leave-to-class="scale-x-0 opacity-0"
        :css="!indicator"
      >
        <div
          v-if="active || indicator"
          class="absolute inset-x-0 bg-current bottom-0 h-0.5 rounded-sm"
          :class="{
            'sm-not:left---inner-margin': side,
          }"
        />
      </Transition>
    </div>
  </button>
</template>

<script setup lang="ts">
import IconCheckCircle from '@/assets/icons/IconCheckCircle.svg?component'
import IconClose from '@/assets/icons/IconClose.svg?component'
import IconNegativeInfo from '@/assets/icons/IconNegativeInfo.svg?component'

import {numberFormatter} from '@/utils/utils.ts'

import WEmptyComponent from '../EmptyComponent/WEmptyComponent.vue'
import WStatusIcon from '../Status/WStatusIcon.vue'
import WTextOverflow from '../TextOverflow/WTextOverflow.vue'

defineProps<{
  /** Marks the button as the open tab: primary text and an underline. */
  active?: boolean
  /** Colors the button red, over the other states. */
  hasError?: boolean
  /** Marks the tab as filled in, for `showHasValue`, `statusIcon` and `indicator`. */
  hasValue?: boolean
  /** Shows the unsaved changes dot. */
  hasChanges?: boolean
  /** Grays the button out and ignores clicks. */
  disabled?: boolean
  /** Icon before the title. */
  icon?: SVGComponent
  /** Text of the button. The `title` slot replaces it. */
  title?: string
  /** Shows a large status circle — error, has value or empty — before the title. */
  indicator?: boolean
  /** Aligns the title to the start, for a column of tab buttons. */
  side?: boolean
  /** Shows a value and error status icon after the title. */
  statusIcon?: boolean
  /** Colors the title green when `hasValue` is set and the tab isn't open. */
  showHasValue?: boolean
  /** Scrolls a title that doesn't fit into view on hover. */
  enableOverflow?: boolean
  /** Number shown in brackets after the title. */
  count?: number
}>()

defineEmits<{
  /** The button was clicked, unless it is disabled. */
  (e: 'click', value: MouseEvent): void
}>()

defineSlots<{
  /** Content of the button, replacing the title, icon, count and status icon. */
  title?: (props: {hasChanges?: boolean, hasError?: boolean, hasValue?: boolean}) => void
  /** Content after the title, such as a close button. */
  suffix?: (props: {hasChanges?: boolean, hasError?: boolean, hasValue?: boolean}) => void
}>()
</script>