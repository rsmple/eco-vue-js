<template>
  <div
    class="
      grid relative w-full sm:flex
      sm-not:group-even:bg-gray-50 sm-not:dark:group-even:bg-primary-darkest/25 sm-not:pt-2
    "
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
      
    <WCheckbox
      v-if="allowSelect && !mobile"
      :model-value="selected ?? false"
      :disabled="disabled"
      class="sm:w-list-row-item sm-not:hidden"
      @update:model-value="$emit('update:selected', $event)"
    />

    <slot />

    <WButtonMore 
      v-if="!hideMore"
      class="
        sm-not:absolute sm-not:right-0 sm-not:-mx--inner-margin sm-not:bottom-0 sm-not:items-start
        sm:w-list-row-item
        flex items-center pl-4
      "
      :class="{
        'sm-not:top-5': !moreBottom,
        'sm-not:top-12': moreBottom,
      }"
      :disabled="disabled"
    >
      <WButtonMoreItem
        v-if="allowSelect && mobile"
        :text="selected ? 'Unselect' : 'Select'"
        :icon="selected ? markRaw(IconMinusCircle) : markRaw(IconAddCircle)"
        @click="$emit('update:selected', !selected)"
      />

      <slot name="more" />
    </WButtonMore>
  </div>
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import WButtonMore from '@/components/Button/WButtonMore.vue'
import WButtonMoreItem from '@/components/Button/WButtonMoreItem.vue'
import IconAddCircle from '@/assets/icons/sax/IconAddCircle.svg?component'
import IconMinusCircle from '@/assets/icons/sax/IconMinusCircle.svg?component'

defineProps<{
  disabled?: boolean
  selected?: boolean
  hideMore?: boolean
  mobile?: boolean
  allowSelect?: boolean
  moreBottom?: boolean
}>()

defineEmits<{
  (e: 'update:selected', value: boolean): void
}>()

</script>
