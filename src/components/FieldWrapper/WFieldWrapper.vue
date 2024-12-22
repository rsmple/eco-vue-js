<template>
  <div
    class="relative"
    :class="{
      'mb-[1.125rem] mt-1': !noMargin,
      [typeof $attrs.class === 'string' ? $attrs.class : '']: true,
    }"
    @click="$emit('click', $event)"
  >
    <label
      :for="id"
      :class="{
        'cursor-not-allowed': disabled && !skeleton,
      }"
    >
      <div
        v-if="title || $slots.title"
        class="text-accent relative mb-2 pr-6 text-xs font-semibold duration-500"
        :class="{
          'opacity-50': disabled && !skeleton,
        }"
      >
        <template v-if="!skeleton">
          <slot name="title">
            {{ title }}
          </slot>

          <Transition
            enter-active-class="transition-opacity"
            leave-active-class="transition-opacity"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <span
              v-if="required"
              class="text-negative dark:text-negative-dark"
            >
              *
            </span>
          </Transition>

          <FilterButton
            v-if="filterField && encodedQueryParam"
            :filter-field="filterField"
            :encoded-query-param="encodedQueryParam"
            class="absolute -top-0.5 ml-1"
          />
        </template>

        <WSkeleton
          v-else
          class="w-skeleton-h-4 w-skeleton-w-16"
        />
      </div>

      <slot name="subtitle" />

      <div
        class="grid grid-cols-[1fr,auto]"
        :class="{
          'pr-9': !title && !$slots.title && filterField && encodedQueryParam,
        }"
      >
        <div
          v-if="!skeleton"
          class="w-has-changes-color-info dark:w-has-changes-color-info-dark relative grid grid-cols-1"
          :class="{
            'focus-within-not:w-has-changes-color-negative dark:focus-within-not:w-has-changes-color-negative-dark': errorMessage,
          }"
        >
          <slot
            v-bind="{id, setFocused, focused}"
            name="field"
          >
            <div
              class="flex min-h-11 items-center text-base font-normal"
              :class="{
                'font-mono': mono,
                'border-t border-solid border-gray-300 dark:border-gray-700': title || $slots.title,
              }"
            >
              <slot v-bind="{id, setFocused, focused}">
                {{ typeof modelValue === 'number' ? numberFormatter.format(modelValue) : modelValue === null ? (emptyValue ?? 'N / A') : (modelValue || emptyValue) }}
              </slot>

              <WButtonCopy
                v-if="allowCopy && modelValue"
                :value="`${modelValue}`"
                class="ml-2"
              />
            </div>
          </slot>

          <Transition
            enter-active-class="transition-opacity"
            leave-active-class="transition-opacity"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <span
              v-if="hasChanges"
              class="square-2 absolute right-0 top-0 rounded-full bg-[var(--has-changes-bg)] transition-colors"
            />
          </Transition>

          <Transition
            enter-active-class="transition-opacity"
            leave-active-class="transition-opacity"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <div
              v-if="errorMessage"
              class="text-negative dark:text-negative-dark absolute top-full pt-0.5 text-xs font-normal"
              :class="{
                'right-0 text-end': !leftError,
                'left-0 text-start': leftError,
              }"
            >
              {{ errorMessage }}
            </div>

            <div
              v-else-if="maxLength !== undefined && focused"
              class="text-description absolute right-0 top-full whitespace-nowrap pt-0.5 text-xs font-normal"
            >
              {{ numberFormatter.format(`${typeof modelValue === 'number' ? modelValue : (modelValue || '')}`.length) }} / {{ numberFormatter.format(maxLength) }}
            </div>
          </Transition>
        </div>

        <WSkeleton
          v-else
          class="w-skeleton-w-full w-skeleton-rounded-xl w-skeleton-h-[calc(var(--field-height,2.125rem)+0.625rem)]"
        />

        <div
          v-if="$slots.right"
          ref="rightContainer"
          class="sm-not:flex-col flex gap-4 pl-4"
        >
          <slot name="right" />
        </div>

        <FilterButton
          v-if="!title && !$slots.title && filterField && encodedQueryParam"
          :filter-field="filterField"
          :encoded-query-param="encodedQueryParam"
          class="absolute right-0 self-center"
        />
      </div>
    </label>

    <div
      v-if="description"
      class="text-description whitespace-pre-wrap text-pretty break-words pt-4 text-xs font-normal"
      :class="{
        'opacity-50': disabled && !skeleton,
      }"
    >
      <WSkeleton v-if="skeleton" />

      <template v-else>
        {{ description }}
      </template>
    </div>

    <WTooltip
      v-if="tooltipText && !skeleton"
      :text="tooltipText"
    />
  </div>
</template>

<script lang="ts" setup>
import type {FieldWrapperProps} from './types'

import {computed, ref, useId} from 'vue'

import WButtonCopy from '@/components/Button/WButtonCopy.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import {encodeQueryParam} from '@/main'
import {numberFormatter} from '@/utils/utils'

import FilterButton from './components/FilterButton.vue'

defineOptions({inheritAttrs: false})

const props = defineProps<FieldWrapperProps>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()

const id = useId()

const focused = ref(false)

const encodedQueryParam = computed(() => {
  if (!props.filterField) return undefined

  return encodeQueryParam(props.filterValue === undefined ? props.modelValue : props.filterValue)
})

const setFocused = (value: boolean): void => {
  focused.value = value
}
</script>
