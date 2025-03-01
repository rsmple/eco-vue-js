<template>
  <div
    v-bind="allowSelect ? {'onMouseover': () => $emit('hover:selected')} : undefined"
    class="relative isolate"
    :class="{
      [cardWrapperClass ?? '']: true,
      'w-ripple-trigger-has': isActionShown,
      'sm-not:dark:even:bg-primary-darkest/25 sm-not:even:bg-gray-50 grid grid-cols-1': card,
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
        'width-[--w-list-header-rounded,1rem]': !allowSelect,
      }"
    >
      <div class="bg-default dark:bg-default-dark absolute right-full top-0 z-[-1] h-full w-[calc(var(--nav-bar-width)+var(--inner-margin))]" />

      <div
        class="h-full rounded-l-[--w-list-rounded,unset]"
        :class="{
          'border border-r-0': hasBorder,
          'border-gray-300 dark:border-gray-700': hasBorder && !selected,
          'border-primary-default dark:border-primary-dark': hasBorder && selected,
          'rounded-bl-[unset!important]': isOpen,
          'border-b-transparent dark:border-b-transparent': hasBorder && isOpen,
          'w-ripple-has-only w-ripple-hover w-ripple-opacity-[0.04]': isActionShown,
        }"
      >
        <WCheckbox
          v-if="allowSelect"
          :model-value="selected"
          :disabled="disabled"
          :align-top="alignTop"
          class="h-full px-[--w-list-padding,1rem]"
          :class="{
            'opacity-50': allowSelectHover,
            'pt-3': alignTop,
          }"
          @update:model-value="$emit('toggle:selected')"
        />

        <div
          v-if="selected"
          class="bg-primary-default/10 dark:bg-primary-dark/10 rounded-inherit pointer-events-none absolute inset-0"
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
        'grid grid-cols-[--w-list-grid-cols] [grid-template-areas:--w-list-grid-areas] sm:rounded-[--w-list-rounded,unset]': card,
        'sm:border-y': hasBorder,
        'border-gray-300 dark:border-gray-700': hasBorder && !selected,
        'border-primary-default dark:border-primary-dark': hasBorder && selected,
        'sm:border': card && hasBorder,
        'border-b-transparent dark:border-b-transparent': !card && hasBorder && isOpen,
      }"
    >
      <WCheckbox
        v-if="allowSelect && card"
        :model-value="selected"
        :disabled="disabled"
        class="justify-end self-start"
        :class="{
          'opacity-50': allowSelectHover,
        }"
        :style="{gridArea: AREA_SELECT}"
        @update:model-value="$emit('toggle:selected')"
      />

      <slot v-bind="{toggle, isOpen, validate}" />

      <ListCardAction
        v-if="isActionShown"
        v-bind="allowSelectHover
          ? {tag: 'button', card, onClick: () => $emit('toggle:selected')}
          : to
            ? {tag: markRaw(RouterLink), card, class: 'z-[-1]', props: {to}}
            : {tag: 'button', card, class: 'z-[-1]', onClick: toggle}
        "
      />

      <div
        v-if="selected"
        class="bg-primary-default/10 dark:bg-primary-dark/10 rounded-inherit pointer-events-none absolute inset-0"
      />

      <WButtonMore
        v-if="card && $slots.more"
        class="-mr-4 flex items-center px-4"
        :disabled="disabled || disableMore"
        :style="{gridArea: AREA_MORE}"
      >
        <WButtonMoreItem
          v-if="allowSelect"
          :text="selected ? 'Unselect' : 'Select'"
          :icon="selected ? markRaw(IconMinusCircle) : markRaw(IconAddCircle)"
          @click="$emit('toggle:selected')"
        />

        <slot name="more" />
      </WButtonMore>
    </component>
      
    <div
      v-if="!card"
      class="right-inner bg-default dark:bg-default-dark sticky z-[1]"
      :class="{
        'width-[calc(var(--w-list-padding,1rem)*2+1.25em)]': $slots.more,
        'width-[--w-list-header-rounded,1rem]': !$slots.more,
      }"
    >
      <div class="bg-default dark:bg-default-dark absolute left-full top-0 z-[-1] h-full w-[calc(var(--actions-bar-width)+var(--inner-margin))]" />

      <div
        class="h-full rounded-r-[--w-list-rounded,unset]"
        :class="{
          'rounded-tr-[--w-list-rounded,unset] border border-l-0': hasBorder,
          'border-gray-300 dark:border-gray-700': hasBorder && !selected,
          'border-primary-default dark:border-primary-dark': hasBorder && selected,
          'rounded-br-[unset!important]': isOpen,
          'border-b-transparent dark:border-b-transparent': hasBorder && isOpen,
          'w-ripple-has-only w-ripple-hover w-ripple-opacity-[0.04]': isActionShown,
        }"
      >
        <WButtonMore
          v-if="$slots.more"
          class="flex h-full px-[--w-list-padding,1rem]"
          :class="{
            'items-start pt-3': alignTop,
            'items-center': !alignTop,
          }"
          :disabled="disabled || disableMore"
        >
          <slot name="more" />
        </WButtonMore>

        <div
          v-if="selected"
          class="bg-primary-default/10 dark:bg-primary-dark/10 rounded-inherit pointer-events-none absolute inset-0"
        />
      </div>
    </div>
  </div>

  <template v-if="$slots.expansion">
    <div
      v-if="isOpen"
      class="sm:w-inner sm:left-inner col-span-full sm:sticky"
      :class="{
        'border-gray-300 dark:border-gray-700': hasBorder && !selected,
        'border-primary-default dark:border-primary-dark': hasBorder && selected,
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

import {computed, markRaw, ref, useTemplateRef} from 'vue'
import {RouterLink} from 'vue-router'

import WButtonMore from '@/components/Button/WButtonMore.vue'
import WButtonMoreItem from '@/components/Button/WButtonMoreItem.vue'
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import WForm from '@/components/Form/WForm.vue'

import IconAddCircle from '@/assets/icons/sax/IconAddCircle.svg?component'
import IconMinusCircle from '@/assets/icons/sax/IconMinusCircle.svg?component'

import ListCardAction from './components/ListCardAction.vue'
import {AREA_MORE, AREA_SELECT} from './types'

const props = defineProps<{
  disabled: boolean | undefined
  mobile: boolean | undefined
  alignTop: boolean | undefined
  hasBorder: boolean | undefined
  cardClass: string | undefined
  cardWrapperClass: string | undefined
  allowOpen: boolean | undefined
  disableMore: boolean | undefined
  formName: string | undefined
  card: boolean
  to: LinkProps['to'] | undefined
  skeleton: boolean

  selected: boolean
  allowSelect: boolean
  allowSelectHover: boolean
}>()

defineEmits<{
  (e: 'toggle:selected'): void
  (e: 'hover:selected'): void
}>()

const formRef = useTemplateRef<ComponentInstance<typeof WForm>>('form')

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const validate: ComponentInstance<typeof WForm>['validate'] = (...args) => formRef.value?.validate(...args)

const isActionShown = computed<boolean>(() => !props.skeleton && (props.allowOpen || props.to !== undefined || props.allowSelectHover))
</script>
