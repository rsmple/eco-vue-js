<template>
  <div
    class="
      sm-not:grid-cols-1 sm-not:group-even:bg-gray-50 sm-not:dark:group-even:bg-primary-darkest/25 sm-not:pt-2 relative
      isolate grid sm:flex
    "
    :class="{
      'w-ripple-trigger-has': allowOpen,
      [cardWrapperClass ?? '']: true,
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
        class="bg-primary-default dark:bg-primary-dark sm-not:block absolute left-0 top-0 hidden h-full w-2"
      />
    </Transition>

    <div
      v-if="!mobile"
      class="left-inner sm-not:hidden bg-default dark:bg-default-dark sticky z-[1]"
      :class="{
        'width-16': allowSelect,
        'width-4': !allowSelect,
      }"
    >
      <div class="bg-default dark:bg-default-dark absolute right-full top-0 z-[-1] h-full w-[calc(var(--nav-bar-width)+var(--inner-margin))]" />

      <div
        class="h-full"
        :class="{
          'border-gray-300 sm:rounded-tl-3xl sm:border sm:border-r-0 dark:border-gray-700': hasBorder,
          'sm:rounded-bl-3xl': hasBorder && !isOpen,
          'sm:border-b-transparent sm:dark:border-b-transparent': hasBorder && isOpen,
          'w-ripple-has-only w-ripple-hover w-ripple-opacity-[0.04]': allowOpen
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
      class="sm-not:-px--inner-margin isolate grid sm:flex sm:flex-1"
      :class="{
        [cardClass ?? '']: true,
        'border-gray-300 sm:border-y dark:border-gray-700': hasBorder,
        'sm:border-b-transparent sm:dark:border-b-transparent': hasBorder && isOpen,
        'isolate': allowOpen,
      }"
    >
      <slot v-bind="{toggle, isOpen, validate}" />

      <button
        v-if="allowOpen"
        class="w-ripple w-ripple-hover w-ripple-has w-ripple-opacity-[0.04] absolute left-0 top-0 z-[-1] size-full cursor-pointer"
        @click="toggle"
      />
    </component>
      
    <div
      class="sm:right-inner sm:bg-default sm:dark:bg-default-dark sm:sticky sm:z-[1]"
      :class="{
        'width-14': !hideMore,
        'width-4': hideMore,
      }"
    >
      <div
        v-if="!mobile"
        class="bg-default dark:bg-default-dark sm-not:hidden absolute left-full top-0 z-[-1] h-full w-[calc(var(--actions-bar-width)+var(--inner-margin))]"
      />

      <div
        class="h-full"
        :class="{
          'border-gray-300 sm:rounded-tr-3xl sm:border sm:border-l-0 dark:border-gray-700': hasBorder,
          'sm:rounded-br-3xl': hasBorder && !isOpen,
          'sm:border-b-transparent sm:dark:border-b-transparent': hasBorder && isOpen,
          'w-ripple-has-only w-ripple-hover w-ripple-opacity-[0.04]': !mobile && allowOpen,
        }"
      >
        <WButtonMore
          v-if="!hideMore"
          class="sm-not:absolute sm-not:right-0 flex h-14 px-4 sm:h-full"
          :class="{
            'sm-not:top-5': !moreBottom,
            'sm-not:top-10': moreBottom,
            'items-start pt-3': alignTop,
            'items-center': !alignTop,
          }"
          :disabled="disabled || disableMore"
        >
          <WButtonMoreItem
            v-if="allowSelect && mobile"
            :text="selected ? 'Unselect' : 'Select'"
            :icon="selected ? markRaw(IconMinusCircle) : markRaw(IconAddCircle)"
            @click="updateSelected?.(!selected)"
          />

          <slot name="more" />
        </WButtonMore>
      </div>
    </div>
  </div>

  <template v-if="$slots.expansion">
    <div
      v-if="isOpen"
      class="sm:w-inner sm:left-inner sm:sticky sm:-mt-px"
      :class="{
        'border-gray-300 sm:rounded-b-3xl sm:border sm:border-t-0 sm:px-5 dark:border-gray-700': hasBorder,
      }"
    >
      <slot name="expansion" />
    </div>
  </template>
</template>

<script lang="ts" setup>
import {inject, markRaw, ref, useTemplateRef, watch} from 'vue'

import WButtonMore from '@/components/Button/WButtonMore.vue'
import WButtonMoreItem from '@/components/Button/WButtonMoreItem.vue'
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import WForm from '@/components/Form/WForm.vue'

import IconAddCircle from '@/assets/icons/sax/IconAddCircle.svg?component'
import IconMinusCircle from '@/assets/icons/sax/IconMinusCircle.svg?component'

import {wInfiniteListSelection, wInfiniteListSelectionItem} from '@/components/InfiniteList/models/injection'

defineProps<{
  disabled?: boolean
  hideMore?: boolean
  mobile?: boolean
  moreBottom?: boolean
  alignTop?: boolean
  hasBorder?: boolean
  cardClass?: string
  cardWrapperClass?: string
  allowOpen?: boolean
  disableMore?: boolean
  formName?: string
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
