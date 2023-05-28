<template>
  <div
    ref="element"
    class="flex rounded-xl overflow-hidden"
  >
    <button
      v-if="allowClear && !disabled"
      class="relative w-ripple w-ripple-hover h-full w-11 p-[0.6875rem] flex justify-center text-description select-none outline-none"
      @mousedown.prevent.stop=""
      @click="$emit('click:clear')"
    >
      <IconCancel class="w-5 h-5" />
    </button>

    <button
      v-if="textSecure"
      :disabled="disabled"
      :class="{
        'cursor-pointer': !disabled,
        'cursor-not-allowed': disabled,
      }"
      class="relative w-ripple w-ripple-hover h-full w-11 p-[0.6875rem] flex justify-center select-none outline-none"
      @click="isSecureVisible ? $emit('hide:secure') : $emit('show:secure')"
    >
      <IconEyeSlash
        v-show="!isSecureVisible"
        class="w-5 h-5 text-description"
      />
      <IconEye
        v-show="isSecureVisible"
        class="w-5 h-5 text-primary-default dark:text-primary-dark"
      />
    </button>

    <div
      v-if="loading"
      class="h-full w-11 flex items-center justify-center text-description cursor-progress"
    >
      <WSpinner class="[--spinner-size:1.5rem]" />
    </div>

    <button
      v-else-if="$slots.default?.()?.length"
      :disabled="disabled"
      :class="{
        'cursor-pointer': !disabled,
        'cursor-not-allowed': disabled,
      }"
      class="h-full w-11 flex items-center justify-center outline-none"
      @click.stop="$emit('click:slot')"
    >
      <slot name="default" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, toRef, watch} from 'vue'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'
import IconEye from '@/assets/icons/sax/IconEye.svg?component'
import IconEyeSlash from '@/assets/icons/sax/IconEyeSlash.svg?component'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import {debounce} from '@/utils/utils'

const props = defineProps<{
  loading?: boolean
  allowClear?: boolean
  disabled?: boolean
  textSecure?: boolean
  isSecureVisible?: boolean
}>()

const emit = defineEmits<{
  (e: 'show:secure', value: MouseEvent): void
  (e: 'hide:secure', value: MouseEvent): void
  (e: 'click:clear'): void
  (e: 'click:slot'): void
  (e: 'update:width', value: number): void
}>()

const element = ref<HTMLDivElement | undefined>()

const emitWidth = debounce((): void => {
  emit('update:width', element.value?.getBoundingClientRect().width ?? 0)
}, 10)

watch(toRef(props, 'loading'), emitWidth)
watch(toRef(props, 'allowClear'), emitWidth)
watch(toRef(props, 'disabled'), emitWidth)
watch(toRef(props, 'textSecure'), emitWidth)

onMounted(() => {
  emitWidth()
})

</script>