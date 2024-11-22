<template>
  <div
    class="relative"
    :class="{
      'mt-1 mb-[1.125rem]': !noMargin,
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
        v-if="title || $slots.title?.()?.length"
        class="text-xs font-semibold text-accent mb-2 duration-500"
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
        </template>

        <WSkeleton
          v-else
          class="w-skeleton-h-4 w-skeleton-w-16"
        />
      </div>

      <slot name="subtitle" />

      <div class="grid grid-cols-[1fr,auto]">
        <div
          v-if="!skeleton"
          class="relative grid grid-cols-1 w-has-changes-color-info dark:w-has-changes-color-info-dark"
          :class="{
            'focus-within-not:w-has-changes-color-negative dark:focus-within-not:w-has-changes-color-negative-dark': errorMessage,
          }"
        >
          <slot
            v-bind="{id, setFocused, focused}"
            name="field"
          >
            <div
              class="text-base font-normal min-h-[2.75rem] flex items-center border-t border-solid border-gray-300 dark:border-gray-700"
              :class="{
                'font-mono': mono,
              }"
            >
              <slot v-bind="{id, setFocused, focused}">
                {{ typeof modelValue === 'number' ? numberFormatter.format(modelValue) : modelValue === null ? 'N / A' : modelValue }}
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
              class="square-2 rounded-full transition-colors absolute top-0 right-0 bg-[var(--has-changes-bg)]"
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
              class="text-xs font-normal text-negative dark:text-negative-dark absolute right-0 top-full pt-0.5 text-end"
            >
              {{ errorMessage }}
            </div>

            <div
              v-else-if="maxLength !== undefined && focused"
              class="text-xs font-normal text-description absolute right-0 top-full pt-0.5 whitespace-nowrap"
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
          v-if="$slots.right?.()?.length"
          ref="rightContainer"
          class="pl-4 flex gap-4 sm-not:flex-col"
        >
          <slot name="right" />
        </div>
      </div>
    </label>

    <div
      v-if="description"
      class="text-xs font-normal text-description pt-4 whitespace-pre-wrap break-words text-pretty"
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
import {ref, useId} from 'vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'
import WButtonCopy from '@/components/Button/WButtonCopy.vue'
import {numberFormatter} from '@/utils/utils'
import type {FieldWrapperProps} from './types'

defineOptions({inheritAttrs: false})

defineProps<FieldWrapperProps>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()

const id = useId()

const focused = ref(false)

const setFocused = (value: boolean): void => {
  focused.value = value
}

</script>
