<template>
  <WFieldWrapper
    v-bind="field"
    :class="[$attrs.class, {
      'group/seamless': field.seamless,
      'cursor-pointer': !isDisabled && !isReadonly,
      'cursor-not-allowed': isDisabled && !isReadonly,
    }]"
    @click="activate"
  >
    <template
      v-if="isReadonly"
      #default
    >
      <div
        class="flex max-w-full gap-(--w-input-gap,0.25rem) py-(--w-input-gap,0.25rem)"
        :class="field.seamless ? 'overflow-hidden' : 'flex-wrap'"
      >
        <SelectOptionPrefix
          v-for="(value, index) in modelValue"
          :key="value"
          :option="getOption(value)"
          :option-component="optionComponent"
          :option-component-props="optionComponentProps"
          :index="index"
          :loading="loading"
          :disabled="isDisabled"
          :readonly="true"
          :disable-clear="true"
          :search="value"
        >
          <template
            v-if="$slots.option"
            #option="optionScope"
          >
            <slot
              name="option"
              v-bind="optionScope"
              :selected="true"
              :model="true"
              :index="index"
              :skeleton="false"
            />
          </template>
        </SelectOptionPrefix>

        <div
          v-if="!modelValue.length && !hideInput"
          class="w-option w-option-padding-y"
          :class="{'font-mono': field.mono}"
        />
      </div>
    </template>

    <!-- The closed seamless field of WInput, with the chips and an input that stands in until the select mounts. -->
    <template
      v-else
      #field
    >
      <div
        class="
          relative isolate grid min-h-(--w-input-min-height,var(--w-input-height,2.75rem))
          grid-cols-[auto_1fr_auto] overflow-hidden rounded-(--w-input-rounded,0.75rem) border border-solid
          not-group-hover/seamless:border-transparent!
        "
        :class="{
          'cursor-text': !isDisabled,
          'tone-negative border-tone-line': field.errorMessage,
          [borderClass ?? 'border-line']: !isDisabled,
          'border-line/50': isDisabled,
        }"
        @mousedown.prevent="activate"
      >
        <div
          class="
            group/input relative col-start-2 grid grid-cols-1 overflow-hidden
            py-(--w-input-gap,0.25rem) first:pl-(--w-input-gap,0.25rem) last:pr-(--w-input-gap,0.25rem)
          "
        >
          <div
            class="w-skeleton-w-32 not-has-[.w-option-has-bg]:px---w-option-padding flex gap-(--w-input-gap,0.25rem)"
            :class="{'w-full min-w-max': noWrap}"
          >
            <SelectOptionPrefix
              v-for="(value, index) in modelValue"
              :key="value"
              :option="getOption(value)"
              :option-component="optionComponent"
              :option-component-props="optionComponentProps"
              :index="index"
              :loading="loading"
              :disabled="isDisabled"
              :readonly="false"
              :disable-clear="true"
              :search="value"
              :class="{
                'cursor-pointer': !isDisabled,
                'cursor-not-allowed opacity-50': isDisabled,
              }"
            >
              <template
                v-if="$slots.option"
                #option="optionScope"
              >
                <slot
                  name="option"
                  v-bind="optionScope"
                  :selected="true"
                  :model="true"
                  :index="index"
                  :skeleton="false"
                />
              </template>
            </SelectOptionPrefix>

            <div
              class="w-option-has-bg-input flex-1"
              :class="{
                'w-option': !isInputHidden,
                'absolute': isInputHidden,
                'font-mono': field.mono,
                'text-accent': !isDisabled,
                'text-accent/50': isDisabled,
              }"
            >
              <div class="relative flex min-h-full flex-1">
                <input
                  class="
                    w-input min-h-full flex-1 basis-auto appearance-none border-none bg-inherit
                    outline-0 placeholder:text-description disabled:cursor-not-allowed sm-not:text-base
                  "
                  :class="{'w-0 max-w-0': isInputHidden}"
                  value=""
                  :placeholder="modelValue.length ? undefined : placeholderEmpty ?? placeholder"
                  :name="name"
                  :size="size || undefined"
                  :disabled="isDisabled"
                  readonly
                  @focus="activate"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </WFieldWrapper>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectDeferredProps, SelectOptionComponent, SelectOptionProps} from '../types'

import {computed} from 'vue'

import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'

import {useComponentStates} from '@/utils/useComponentStates'

import SelectOptionPrefix from './SelectOptionPrefix.vue'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectDeferredProps<Model, Data, OptionComponent>>(),
  {
    size: 10,
  },
)

const emit = defineEmits<{
  /** The field was pressed or focused, and is neither readonly nor disabled. */
  (e: 'activate'): void
}>()

defineSlots<{
  option?: (props: PartialNot<SelectOptionProps<Data>>) => void
}>()

const {isReadonly, isDisabled} = useComponentStates({
  get readonly() {
    return props.field.readonly
  },
  get disabled() {
    return props.field.disabled
  },
})

const activate = () => {
  if (!isReadonly.value && !isDisabled.value) emit('activate')
}

const isInputHidden = computed(() => props.modelValue.length !== 0 || props.hideInput === true)
</script>
