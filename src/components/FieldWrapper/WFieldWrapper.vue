<template>
  <div
    class="group/field relative"
    v-bind="{class: $attrs.class, style: $attrs.style as StyleValue}"
    :class="{
      'mb-[1.125rem]': !noMargin && !subgrid,
      'col-span-full grid grid-cols-subgrid': subgrid,
    }"
    @click="$emit('click', $event)"
  >
    <label
      v-if="title || $slots.title"
      :for="id"
      class="text-accent relative block pr-6 text-xs font-semibold leading-loose"
      :class="{
        'cursor-not-allowed opacity-50': isDisabled && !isReadonly && !isSkeleton,
        'col-start-1': subgrid,
      }"
    >
      <template v-if="!isSkeleton">
        <slot name="title">
          <template v-if="titleIcon"><component
            :is="titleIcon"
            class="square-[1.25em] mt-[-0.25em] inline"
          />&nbsp;</template>{{ title }}
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
          class="absolute top-0.5 ml-2"
        />
      </template>

      <WSkeleton v-else />
    </label>

    <slot name="subtitle" />

    <div
      ref="field"
      class="grid"
      :class="{
        'pr-9': !title && !$slots.title && filterField,
        'col-start-2 -col-end-1 row-start-1 -row-end-3 grid-cols-subgrid': subgrid,
        'grid-cols-[1fr,auto]': !subgrid,
      }"
    >
      <div
        v-if="!isSkeleton"
        class="w-has-changes-color-info dark:w-has-changes-color-info-dark relative grid"
        :class="{
          'focus-within-not:w-has-changes-color-negative dark:focus-within-not:w-has-changes-color-negative-dark': errorMessage,
          'col-span-full grid-cols-subgrid': subgrid,
          'grid-cols-1': !subgrid,
        }"
      >
        <slot
          v-bind="{id, setFocused, focused}"
          name="field"
        >
          <div
            class="flex min-h-[--w-input-height,2.75rem] items-center font-normal"
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
            v-if="saved"
            class="text-description absolute right-0 whitespace-nowrap py-0.5 text-xs font-normal"
            :class="topText ? 'bottom-full' : 'top-full'"
          >
            {{ savedText ?? 'Saved' }}
          </div>

          <div
            v-else-if="errorMessage"
            class="text-negative dark:text-negative-dark absolute pt-0.5 text-xs font-normal"
            :class="[
              !leftError || topText ? 'right-0 text-end' : 'left-0 text-start',
              topText ? 'bottom-full' : 'top-full',
            ]"
          >
            {{ errorMessage }}
          </div>

          <div
            v-else-if="maxLength !== undefined && focused"
            class="text-description absolute right-0 whitespace-nowrap pt-0.5 text-xs font-normal"
            :class="topText ? 'bottom-full' : 'top-full'"
          >
            {{ numberFormatter.format(`${typeof modelValue === 'number' ? modelValue : (modelValue || '')}`.length) }} / {{ numberFormatter.format(maxLength) }}
          </div>
        </Transition>
      </div>

      <WSkeleton
        v-else
        class="w-skeleton-w-full w-skeleton-rounded-[--w-input-rounded,0.75rem] w-skeleton-h-[--w-input-height,2.75rem]"
      />

      <div
        v-if="$slots.right"
        ref="rightContainer"
        class="sm-not:flex-col flex gap-4 pl-4"
      >
        <slot name="right" />
      </div>

      <template v-if="!title && !$slots.title && filterField">
        <FilterButton
          :filter-field="filterField"
          :encoded-query-param="encodedQueryParam"
          :skeleton="isSkeleton"
          class="absolute right-0 self-center"
        />
      </template>
    </div>

    <slot name="bottom" />

    <div
      v-if="description"
      class="text-description col-start-1 whitespace-pre-wrap text-pretty break-words text-xs font-normal"
      :class="{
        'opacity-50': isDisabled && !isReadonly && !isSkeleton,
        'pt-4': !subgrid,
      }"
    >
      <WSkeleton v-if="isSkeleton" />

      <template v-else>
        {{ description }}
      </template>
    </div>

    <WTooltip
      v-if="tooltipText && !isSkeleton && !isReadonly"
      :text="tooltipText"
    />
  </div>
</template>

<script lang="ts" setup>
import type {FieldWrapperProps} from './types'

import {type StyleValue, computed, inject, ref, useId, useTemplateRef} from 'vue'

import WButtonCopy from '@/components/Button/WButtonCopy.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import {encodeQueryParam} from '@/utils/api'
import {useComponentStates} from '@/utils/useComponentStates'
import {numberFormatter} from '@/utils/utils'

import FilterButton from './components/FilterButton.vue'
import {wFieldSaved} from './use/useFieldSaved'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<FieldWrapperProps>(),
  {
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()

const {isReadonly, isDisabled, isSkeleton} = useComponentStates(props)

const id = useId()

const fieldRef = useTemplateRef('field')

const focused = ref(false)

const saved = inject(wFieldSaved, ref(false))

const encodedQueryParam = computed(() => {
  if (props.filterField === undefined) return undefined

  return encodeQueryParam(props.filterValue === undefined ? props.modelValue : props.filterValue)
})

const setFocused = (value: boolean): void => {
  focused.value = value
}

defineExpose({
  fieldRef,
})
</script>
