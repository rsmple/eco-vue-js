<template>
  <div
    class="relative isolate"
    :class="{
      [cardWrapperClass ?? '']: true,
      'w-ripple-trigger-has': allowOpen || to,
      'dark:group-even:bg-primary-darkest/25 grid grid-cols-1 group-even:bg-gray-50': card,
      'flex': !card,
      '-mb-px': !card && isOpen,
    }"
  >
    <Transition
      enter-active-class="transition-transform duration-200"
      leave-active-class="transition-transform duration-200"
      enter-from-class="-translate-x-2"
      leave-to-class="-translate-x-2"
    >
      <div
        v-if="mobile && selected"
        class="bg-primary-default dark:bg-primary-dark @sm:hidden absolute left-0 top-0 h-full w-2"
      />
    </Transition>

    <div
      v-if="!card"
      class="left-inner bg-default dark:bg-default-dark @not-lg:hidden sticky z-[1]"
      :class="{
        'width-16': allowSelect,
        'width-4': !allowSelect,
      }"
    >
      <div class="bg-default dark:bg-default-dark absolute right-full top-0 z-[-1] h-full w-[calc(var(--nav-bar-width)+var(--inner-margin))]" />

      <div
        class="h-full rounded-l-[--w-list-rounded,unset]"
        :class="{
          'border border-r-0 border-gray-300 dark:border-gray-700': hasBorder,
          'rounded-bl-[unset!important]': isOpen,
          'border-b-transparent dark:border-b-transparent': hasBorder && isOpen,
          'w-ripple-has-only w-ripple-hover w-ripple-opacity-[0.04]': allowOpen || to,
        }"
      >
        <WCheckbox
          v-if="allowSelect"
          :model-value="selectedBetween ? null : selected ?? false"
          :disabled="disabled"
          :allow-shift="allowSelectRange"
          :align-top="alignTop"
          class="h-full px-4"
          :class="{
            'opacity-50': allowSelectHover,
            'pt-3': alignTop,
          }"
          @update:model-value="allowSelectHover ? updateSelectedRange?.() : updateSelected?.($event)"
          @update-shift:model-value="updateSelectedRange?.()"
          @mouseover="allowSelectHover ? updateSelectedRangeHover?.() : undefined"
        />
      </div>
    </div>

    <component
      :is="formName ? WForm : 'div'"
      ref="form"
      v-bind="formName ? {name: formName} : undefined"
      class="sm-not:-px--inner-margin isolate"
      :class="{
        [cardClass ?? '']: true,
        'flex flex-1': !card,
        'grid grid-cols-[--w-list-grid-cols] rounded-[--w-list-rounded,unset] [grid-template-areas:--w-list-grid-areas]': card,
        'border-gray-300 sm:border-y dark:border-gray-700': hasBorder,
        'border': card && hasBorder,
        'border-b-transparent dark:border-b-transparent': !card && hasBorder && isOpen,
      }"
    >
      <WCheckbox
        v-if="allowSelect && card"
        :model-value="selectedBetween ? null : selected ?? false"
        :disabled="disabled"
        :allow-shift="allowSelectRange"
        class="justify-end self-start"
        :class="{
          'opacity-50': allowSelectHover,
        }"
        :style="{gridArea: AREA_SELECT}"
        @update:model-value="allowSelectHover ? updateSelectedRange?.() : updateSelected?.($event)"
        @update-shift:model-value="updateSelectedRange?.()"
        @mouseover="allowSelectHover ? updateSelectedRangeHover?.() : undefined"
      />

      <slot v-bind="{toggle, isOpen, validate}" />

      <component
        :is="to ? RouterLink : 'button'"
        v-if="allowOpen || to"
        v-bind="to ? {to} : undefined"
        class="w-ripple w-ripple-hover w-ripple-has w-ripple-opacity-[0.04] absolute left-0 top-0 z-[-1] size-full cursor-pointer"
        :class="{
          'w-ripple-rounded-[--w-list-rounded,unset] rounded-[--w-list-rounded,unset]': card,
        }"
        @click="allowOpen && toggle()"
      />

      <WButtonMore
        v-if="card"
        class="-mr-4 flex items-center px-4"
        :disabled="disabled || disableMore"
        :style="{gridArea: AREA_MORE}"
      >
        <WButtonMoreItem
          v-if="allowSelect"
          :text="selected ? 'Unselect' : 'Select'"
          :icon="selected ? markRaw(IconMinusCircle) : markRaw(IconAddCircle)"
          @click="updateSelected?.(!selected)"
        />

        <slot name="more" />
      </WButtonMore>
    </component>
      
    <div
      v-if="!card"
      class="right-inner bg-default dark:bg-default-dark sticky z-[1]"
      :class="{
        'width-14': !hideMore,
        'width-4': hideMore,
      }"
    >
      <div class="bg-default dark:bg-default-dark absolute left-full top-0 z-[-1] h-full w-[calc(var(--actions-bar-width)+var(--inner-margin))]" />

      <div
        class="h-full rounded-r-[--w-list-rounded,unset]"
        :class="{
          'rounded-tr-[--w-list-rounded,unset] border border-l-0 border-gray-300 dark:border-gray-700': hasBorder,
          'rounded-br-[unset!important]': isOpen,
          'border-b-transparent dark:border-b-transparent': hasBorder && isOpen,
          'w-ripple-has-only w-ripple-hover w-ripple-opacity-[0.04]': allowOpen || to,
        }"
      >
        <WButtonMore
          v-if="!hideMore"
          class="flex h-full px-4"
          :class="{
            'items-start pt-3': alignTop,
            'items-center': !alignTop,
          }"
          :disabled="disabled || disableMore"
        >
          <slot name="more" />
        </WButtonMore>
      </div>
    </div>
  </div>

  <template v-if="$slots.expansion">
    <div
      v-if="isOpen"
      class="w-inner left-inner sticky col-span-full"
      :class="{
        'border-gray-300 dark:border-gray-700': hasBorder,
        'mt-[calc(var(--w-list-gap,1rem)*-1)] border border-t-0 px-5': !card && hasBorder,
        'rounded-b-[--w-list-rounded,unset]': !card,
      }"
    >
      <slot name="expansion" />
    </div>
  </template>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {inject, markRaw, ref, useTemplateRef, watch} from 'vue'
import {RouterLink} from 'vue-router'

import WButtonMore from '@/components/Button/WButtonMore.vue'
import WButtonMoreItem from '@/components/Button/WButtonMoreItem.vue'
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import WForm from '@/components/Form/WForm.vue'

import IconAddCircle from '@/assets/icons/sax/IconAddCircle.svg?component'
import IconMinusCircle from '@/assets/icons/sax/IconMinusCircle.svg?component'

import {wInfiniteListSelection, wInfiniteListSelectionItem} from '@/components/InfiniteList/models/injection'

import {AREA_MORE, AREA_SELECT} from './types'

defineProps<{
  disabled: boolean | undefined
  hideMore: boolean | undefined
  mobile: boolean | undefined
  alignTop: boolean | undefined
  hasBorder: boolean | undefined
  cardClass: string | undefined
  cardWrapperClass: string | undefined
  allowOpen: boolean | undefined
  disableMore: boolean | undefined
  formName: string | undefined
  card: boolean | undefined
  to: LinkProps['to'] | undefined
}>()

const emit = defineEmits<{
  (e: 'update:selected', value: boolean): void
  (e: 'update:selected-hover', value: boolean): void
}>()

const formRef = useTemplateRef<ComponentInstance<typeof WForm>>('form')

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const validate: ComponentInstance<typeof WForm>['validate'] = (...args) => formRef.value?.validate(...args)

const {
  allowSelect,
  allowSelectRange,
  allowSelectHover,
} = inject(wInfiniteListSelection, {})

const {
  selected,
  selectedBetween,

  updateSelected,
  updateSelectedRange,
  updateSelectedRangeHover,
} = inject(wInfiniteListSelectionItem, {})

if (selected) {
  watch(selected, value => {
    emit('update:selected', value)
  }, {immediate: true})
}

if (allowSelectHover) {
  watch(allowSelectHover, value => {
    emit('update:selected-hover', value)
  }, {immediate: true})
}

defineExpose({
  updateSelected,
})
</script>
