<template>
  <div
    ref="element"
    class="flex rounded-xl overflow-hidden bg-default dark:bg-default-dark"
  >
    <button
      v-if="allowClear && !disabled && !readonly"
      class="relative w-ripple w-ripple-hover h-full w-11 p-[0.6875rem] flex justify-center text-description select-none outline-none"
      @mousedown.prevent.stop=""
      @click="$emit('click:clear')"
    >
      <IconCancel class="w-5 h-5" />

      <WTooltip
        text="Clear"
        no-touch
      />
    </button>

    <button
      v-if="allowPaste && !disabled && !readonly"
      class="relative w-ripple w-ripple-hover h-full w-11 p-[0.6875rem] flex justify-center text-description select-none outline-none"
      @mousedown.prevent.stop=""
      @click="$emit('click:paste')"
    >
      <IconPaste class="w-5 h-5" />

      <WTooltip
        text="Paste"
        no-touch
      />
    </button>

    <button
      v-if="textSecure"
      :disabled="disabled || readonly"
      class="relative h-full w-11 p-[0.6875rem] flex justify-center select-none outline-none"
      :class="{
        'cursor-pointer w-ripple w-ripple-hover': !disabled && !readonly,
        'cursor-not-allowed': disabled || readonly,
      }"
      @click="isSecureVisible ? $emit('hide:secure', $event) : $emit('show:secure', $event)"
    >
      <IconEyeSlash
        v-if="!isSecureVisible"
        class="w-5 h-5 text-description"
      />
      <IconEye
        v-else
        class="w-5 h-5 text-primary-default dark:text-primary-dark"
      />

      <WTooltip
        :text="isSecureVisible ? 'Hide' : 'Show'"
        no-touch
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
      @click.stop="$emit('click:slot', $event)"
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
import IconPaste from '@/assets/icons/sax/IconPaste.svg?component'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'
import {debounce} from '@/utils/utils'
import {useTabActiveListener} from '@/components/Tabs/use/useTabActiveListener'

const props = defineProps<{
  loading?: boolean
  allowClear?: boolean
  allowPaste?: boolean
  disabled?: boolean
  readonly?: boolean
  textSecure?: boolean
  isSecureVisible?: boolean
}>()

const emit = defineEmits<{
  (e: 'click:paste'): void
  (e: 'show:secure', value: MouseEvent): void
  (e: 'hide:secure', value: MouseEvent): void
  (e: 'click:clear'): void
  (e: 'click:slot', value: MouseEvent): void
  (e: 'update:width', value: number): void
}>()

const element = ref<HTMLDivElement | undefined>()

const emitWidth = debounce((): void => {
  emit('update:width', element.value?.offsetWidth ?? 0)
}, 10)

watch(toRef(props, 'loading'), emitWidth)
watch(toRef(props, 'allowClear'), emitWidth)
watch(toRef(props, 'disabled'), emitWidth)
watch(toRef(props, 'textSecure'), emitWidth)
watch(toRef(props, 'allowPaste'), emitWidth)

useTabActiveListener(emitWidth)

onMounted(() => {
  emitWidth()
})

</script>