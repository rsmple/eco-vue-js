<template>
  <div
    v-bind="allowSelect ? {'onMouseover': () => $emit('hover:selected')} : undefined"
    ref="container"
    class="relative isolate"
    :class="{
      [cardWrapperClass ?? '']: true,
      'w-ripple-trigger-has': isActionShown,
      'sm-not:dark:even:bg-primary-darkest/25 sm-not:even:bg-gray-50 grid grid-cols-1': card,
      'flex': !card,
      '-mb-px': !card && isOpen,
      'w-hover-checked': allowSelectHover,
    }"
    @contextmenu="toggleMenu"
  >
    <Transition
      enter-active-class="transition-transform duration-200"
      leave-active-class="transition-transform duration-200"
      enter-from-class="-translate-x-2"
      leave-to-class="-translate-x-2"
    >
      <div
        v-if="mobile && selected"
        class="bg-primary dark:bg-primary-dark @sm:hidden absolute left-0 top-0 h-full w-2"
      />
    </Transition>

    <div
      v-if="!card"
      class="-left--left-inner bg-default dark:bg-default-dark @not-lg:hidden sticky z-[1]"
      :class="{
        'width-[--w-list-header-rounded,1rem]': !allowSelect,
      }"
    >
      <div class="bg-default dark:bg-default-dark -w--left-inner absolute right-full top-0 z-[-1] h-full" />

      <div
        class="h-full rounded-l-[--w-list-rounded,unset]"
        :class="{
          'border border-r-0': hasBorder,
          'border-gray-300 dark:border-gray-700': hasBorder && !selected,
          'border-primary dark:border-primary-dark': hasBorder && selected,
          'rounded-bl-[unset!important]': isOpen,
          'border-b-transparent dark:border-b-transparent': hasBorder && isOpen,
          'pl-px': !hasBorder,
          ...beforeClass,
        }"
      >
        <WCheckbox
          v-if="allowSelect"
          :model-value="selected"
          :disabled="disabled"
          :align-top="alignTop"
          :less-transitions="allowSelectHover"
          class="h-full px-[--w-list-padding,1rem]"
          :class="{
            'opacity-50': allowSelectHover,
            'pt-4.5': alignTop,
          }"
          @update:model-value="$emit('toggle:selected')"
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
        'border-primary dark:border-primary-dark': hasBorder && selected,
        'sm:border': card && hasBorder,
        'border-b-transparent dark:border-b-transparent': !card && hasBorder && isOpen,
      }"
    >
      <WCheckbox
        v-if="allowSelect && card"
        :model-value="selected"
        :disabled="disabled"
        class="-p--inner-margin -my---inner-margin -mr---inner-margin justify-end self-start"
        :class="{
          'opacity-50': allowSelectHover,
        }"
        :style="{gridArea: AREA_SELECT}"
        @update:model-value="$emit('toggle:selected')"
      />

      <slot v-bind="{toggle, isOpen, validate, beforeClass}" />

      <ListCardAction
        v-if="isActionShown"
        v-bind="allowSelectHover
          ? {tag: 'button', card, onClick: () => $emit('toggle:selected')}
          : hasAction
            ? {tag: 'button', card, class: 'z-[-1]', onClick: () => $emit('click:action')}
            : to
              ? {tag: markRaw(RouterLink), card, class: 'z-[-1]', props: {to}}
              : allowOpen
                ? {tag: 'button', card, class: 'z-[-1]', onClick: toggle}
                : {tag: 'div', card, class: 'z-[-1]'}
        "
        :class="{
          'before:text-primary dark:before:text-primary-dark': allowSelectHover || selected || moreRef?.isOpen,
          'before:opacity-10': selected || moreRef?.isOpen,
        }"
        :opacity-class="allowSelectHover || selected || moreRef?.isOpen ? 'w-ripple-opacity-15' : undefined"
      />

      <WButtonMore
        v-if="card && $slots.more"
        ref="more"
        class="-p--inner-margin -my---inner-margin -mr---inner-margin flex items-center"
        :disabled="disabled || disableMore"
        :style="{gridArea: AREA_MORE}"
        :anchor="anchorRef ?? undefined"
        @close="position = null"
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
      class="-right--right-inner bg-default dark:bg-default-dark sticky z-[1]"
      :class="{
        'width-[calc(var(--w-list-padding,1rem)*2+1.25em)]': $slots.more,
        'width-[--w-list-header-rounded,1rem]': !$slots.more,
      }"
    >
      <div class="bg-default dark:bg-default-dark -w--right-inner absolute left-full top-0 z-[-1] h-full" />

      <div
        class="h-full rounded-r-[--w-list-rounded,unset]"
        :class="{
          'rounded-tr-[--w-list-rounded,unset] border border-l-0': hasBorder,
          'border-gray-300 dark:border-gray-700': hasBorder && !selected,
          'border-primary dark:border-primary-dark': hasBorder && selected,
          'rounded-br-[unset!important]': isOpen,
          'border-b-transparent dark:border-b-transparent': hasBorder && isOpen,
          ...beforeClass,
        }"
      >
        <WButtonMore
          v-if="$slots.more"
          ref="more"
          class="flex h-full px-[--w-list-padding,1rem]"
          :class="{
            'pt-4.5 items-start': alignTop,
            'items-center': !alignTop,
          }"
          :disabled="disabled || disableMore"
          :anchor="anchorRef ?? undefined"
          @close="position = null"
        >
          <slot name="more" />
        </WButtonMore>
      </div>
    </div>

    <div
      v-if="position"
      ref="anchor"
      class="absolute"
      :style="position"
    />
  </div>

  <template v-if="$slots.expansion">
    <div
      v-if="isOpen"
      class="list:-w--width-inner list:-left--left-inner list:sticky col-span-full"
      :class="{
        'border-gray-300 dark:border-gray-700': hasBorder && !selected,
        'border-primary dark:border-primary-dark': hasBorder && selected,
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
  hasAction: boolean | undefined
  skeleton: boolean

  selected: boolean
  allowSelect: boolean
  allowSelectHover: boolean
}>()

defineEmits<{
  (e: 'toggle:selected'): void
  (e: 'hover:selected'): void
  (e: 'click:action'): void
}>()

const containerRef = useTemplateRef('container')
const moreRef = useTemplateRef('more')
const formRef = useTemplateRef<ComponentInstance<typeof WForm>>('form')

const isOpen = ref(false)
const position = ref<{left: string, top: string} | null>(null)
const anchorRef = useTemplateRef<HTMLDivElement>('anchor')

const beforeClass = computed(() => {
  if (!isActionShown.value) return {}

  return {
    'w-ripple-has-only w-ripple-hover': true,
    'w-ripple-opacity-[0.05]': !props.allowSelectHover && !props.selected && !moreRef.value?.isOpen,
    'before:text-primary dark:before:text-primary-dark w-ripple-opacity-15': props.allowSelectHover || props.selected || moreRef.value?.isOpen,
    'before:opacity-10': props.selected || moreRef.value?.isOpen,
  }
})

const toggle = () => {
  isOpen.value = !isOpen.value
}

const validate: ComponentInstance<typeof WForm>['validate'] = (...args) => formRef.value?.validate(...args)

const isActionShown = computed<boolean>(() => !props.skeleton && (props.allowOpen || props.to !== undefined || props.allowSelectHover || props.hasAction || props.selected))

const toggleMenu = (event: MouseEvent) => {
  if (props.disabled || props.disableMore || !containerRef.value || !moreRef.value || event.ctrlKey) return

  const containerRect = containerRef.value.getBoundingClientRect()

  position.value = {left: event.screenX - containerRect.x + 'px', top: event.clientY - containerRect.y + 'px'}

  moreRef.value.open()

  event.preventDefault()
}
</script>
