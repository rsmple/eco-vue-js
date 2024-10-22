<template>
  <div
    class="
      relative grid sm-not:grid-cols-1 sm:flex isolate sm:mt-4 first:mt-0
      sm-not:group-even:bg-gray-50 sm-not:dark:group-even:bg-primary-darkest/25 sm-not:pt-2
    "
    :class="{
      'w-ripple-trigger-has': allowOpen,
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
        class="bg-primary-default dark:bg-primary-dark w-2 h-full hidden sm-not:block absolute left-0 top-0"
      />
    </Transition>

    <div
      v-if="!mobile"
      class="sticky z-[1] left-inner sm-not:hidden bg-default dark:bg-default-dark"
      :class="{
        'width-16': allowSelect,
        'width-4': !allowSelect,
      }"
    >
      <div class="absolute top-0 -z-[1] right-full h-full w-[calc(var(--nav-bar-width)+var(--inner-margin))] bg-default dark:bg-default-dark" />

      <div
        class="h-full"
        :class="{
          'sm:border sm:border-r-0 border-gray-300 dark:border-gray-700 sm:rounded-tl-3xl': hasBorder,
          'sm:rounded-bl-3xl': hasBorder && !isOpen,
          'sm:border-b-[transparent] sm:dark:border-b-[transparent]': hasBorder && isOpen,
          'w-ripple-has-only w-ripple-hover w-ripple-opacity-[0.04]': allowOpen
        }"
      >
        <WCheckbox
          v-if="allowSelect"
          :model-value="selectedBetween ? null : selected ?? false"
          :disabled="disabled"
          :allow-shift="allowSelectRange"
          :align-top="alignTop"
          class="px-4 h-full"
          :class="{
            'opacity-50': allowSelectHover,
          }"
          @update:model-value="allowSelectHover ? updateSelectedRange?.() : updateSelected?.($event)"
          @update-shift:model-value="updateSelectedRange?.()"
          @mouseover="allowSelectHover ? updateSelectedRangeHover?.() : undefined"
        />
      </div>
    </div>

    <div
      class="grid sm:flex sm:flex-1 sm-not:-px--inner-margin isolate"
      :class="{
        [cardClass ?? '']: true,
        'sm:border-y border-gray-300 dark:border-gray-700': hasBorder,
        'sm:border-b-[transparent] sm:dark:border-b-[transparent]': hasBorder && isOpen,
        'isolate': allowOpen,
      }"
    >
      <slot v-bind="{toggle, isOpen}" />

      <button
        v-if="allowOpen"
        class="cursor-pointer w-ripple w-ripple-hover w-ripple-has w-ripple-opacity-[0.04] absolute top-0 left-0 h-full w-full -z-[1]"
        @click="toggle"
      />
    </div>
      
    <div
      class="sm:sticky sm:z-[1] sm:right-inner sm:bg-default sm:dark:bg-default-dark"
      :class="{
        'width-14': !hideMore,
        'width-4': hideMore,
      }"
    >
      <div
        v-if="!mobile"
        class="absolute top-0 -z-[1] left-full h-full w-[calc(var(--actions-bar-width)+var(--inner-margin))] bg-default dark:bg-default-dark sm-not:hidden"
      />

      <div
        class="h-full"
        :class="{
          'sm:border sm:border-l-0 border-gray-300 dark:border-gray-700 sm:rounded-tr-3xl': hasBorder,
          'sm:rounded-br-3xl': hasBorder && !isOpen,
          'sm:border-b-[transparent] sm:dark:border-b-[transparent]': hasBorder && isOpen,
          'w-ripple-has-only w-ripple-hover w-ripple-opacity-[0.04]': !mobile && allowOpen,
        }"
      >
        <WButtonMore
          v-if="!hideMore"
          class="sm-not:absolute sm-not:right-0 sm-not:bottom-0 flex px-4 sm:h-full"
          :class="{
            'sm-not:top-5': !moreBottom,
            'sm-not:top-10': moreBottom,
            'items-start pt-2': alignTop,
            'items-center': !alignTop,
          }"
          :disabled="disabled"
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
      class="sm:sticky sm:w-inner sm:left-inner sm:-mt-px"
      :class="{
        'sm:px-5 sm:border sm:border-t-0 border-gray-300 dark:border-gray-700 sm:rounded-b-3xl': hasBorder,
      }"
    >
      <slot name="expansion" />
    </div>
  </template>
</template>

<script lang="ts" setup>
import {inject, markRaw, ref, watch} from 'vue'
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import WButtonMore from '@/components/Button/WButtonMore.vue'
import WButtonMoreItem from '@/components/Button/WButtonMoreItem.vue'
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
  allowOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selected', value: boolean): void
  (e: 'update:selected-hover', value: boolean): void
}>()

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

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
