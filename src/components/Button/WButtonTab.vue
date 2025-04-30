<template>
  <button
    :disabled="disabled"
    class="w-ripple-trigger grid select-none grid-cols-[auto,1fr] font-semibold outline-none transition-colors duration-500"
    :class="{
      'text-primary dark:text-primary-dark': !hasError && active,
      'text-negative dark:text-negative-dark': hasError,
      'text-positive dark:text-positive-dark': !active && !hasError && hasValue && showHasValue,
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
        class="text-default dark:text-default-dark rounded-full bg-[inherit] bg-opacity-100 p-1 outline transition-[outline-width] duration-500" 
        :class="{
          'bg-negative dark:bg-negative-dark outline-negative/10 dark:outline-negative-dark/10': hasError,
          'bg-positive dark:bg-positive-dark outline-positive/10 dark:outline-positive-dark/10': !hasError && hasValue && showHasValue,
          'bg-gray-400 outline-gray-400/10 dark:bg-gray-600 dark:outline-gray-600/10': !hasError && (!showHasValue || !hasValue),
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
        class="flex items-center py-2"
        :class="{
          'justify-center text-center': !side,
          'text-start': side,
        }"
      >
        <div
          class="whitespace-nowrap px-3"
          :class="{
            'sm-not:-pl--inner-margin': side,
          }"
        >
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

          {{ title }}
        </div>

        <WStatusIcon
          v-if="statusIcon"
          :has-value="hasValue"
          :has-error="hasError"
          class="sm-not:-mr--inner-margin square-4 ml-auto mr-4"
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
          class="square-2 absolute right-1 top-1 rounded-full transition-colors duration-500"
          :class="{
            'bg-info dark:bg-info-dark': !hasError,
            'bg-negative dark:bg-negative-dark': hasError,
          }"
        />
      </Transition>

      <Transition
        enter-active-class="transition-[transform,opacity] origin-center duration-300"
        leave-active-class="transition-[transform,opacity] origin-center duration-300"
        enter-from-class="scale-x-0 opacity-0"
        leave-to-class="scale-x-0 opacity-0"
        :css="!indicator"
      >
        <div
          v-if="active || indicator"
          class="absolute inset-x-0 bottom-0 h-0.5 rounded-sm"
          :class="{
            'bg-current': indicator,
            'bg-primary dark:bg-primary-dark': !indicator,
            'sm-not:-left--inner-margin': side,
          }"
        />
      </Transition>
    </div>
  </button>
</template>

<script setup lang="ts">
import IconCheckCircle from '@/assets/icons/sax/IconCheckCircle.svg?component'
import IconClose from '@/assets/icons/sax/IconClose.svg?component'
import IconNegativeInfo from '@/assets/icons/sax/IconNegativeInfo.svg?component'

import WStatusIcon from '../Status/WStatusIcon.vue'

defineProps<{
  active?: boolean
  hasError?: boolean
  hasValue?: boolean
  hasChanges?: boolean
  disabled?: boolean
  icon?: SVGComponent
  title?: string
  indicator?: boolean
  side?: boolean
  statusIcon?: boolean
  showHasValue?: boolean
}>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>