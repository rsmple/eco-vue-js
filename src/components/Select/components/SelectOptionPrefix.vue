<template>
  <div
    class="relative grid grid-cols-[1fr,auto] items-center text-description group/model"
    :class="{
      'cursor-pointer': !disabled,
      'cursor-not-allowed opacity-50': disabled,
    }"
  >
    <slot name="option">
      <template v-if="optionComponent">
        <component
          :is="optionComponent"
          :option="option"
          :selected="true"
          :model="true"
        >
          <button
            v-if="!disableClear"
            class="relative flex square-5 rounded-full -my-1 -mr-2 ml-1 items-center justify-center outline-none"
            :class="{
              'cursor-not-allowed': disabled,
              'cursor-progress': loading,
              'cursor-pointer w-ripple w-ripple-hover ': !loading && !disabled,
            }"
            @mousedown.stop.prevent=""
            @click.stop.prevent="!loading && $emit('unselect')"
          >
            <IconCancel class="square-3" />
          </button>
        </component>
      </template>
    </slot>

    <button
      v-if="!optionComponent && !disableClear"
      class="relative flex square-5 rounded-full items-center justify-center outline-none"
      :class="{
        'cursor-not-allowed': disabled,
        'cursor-progress': loading,
        'cursor-pointer w-ripple w-ripple-hover ': !loading && !disabled,
      }"
      @mousedown.stop.prevent=""
      @click.stop.prevent="!loading && $emit('unselect')"
    >
      <IconCancel class="square-3" />
    </button>
  </div>
</template>

<script lang="ts" setup generic="Item extends string | number = string">
import type {Component} from 'vue'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

defineProps<{
  option: Item
  optionComponent?: Component<{option: Item, selected?: boolean, model?: boolean}>
  disabled?: boolean
  loading?: boolean
  disableClear?: boolean
}>()

defineEmits<{
  (e: 'unselect'): void
}>()

</script>