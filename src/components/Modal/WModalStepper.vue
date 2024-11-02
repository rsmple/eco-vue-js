<template>
  <WModalWrapper maximized>
    <template #title>
      <slot name="title">
        {{ names?.[current] }}
      </slot>
    </template>

    <template #subtitle>
      <div class="bg-gray-200 dark:bg-gray-700 h-1 w-full">
        <div
          class="bg-primary-default dark:bg-primary-dark h-full transition-[width]"
          :style="{
            width: (100 * (current + 1) / defaultSlots.length) + '%',
          }"
        />
      </div>
    </template>

    <WTabs
      ref="tabs"
      :slots="defaultSlots"
      @update:current="current = $event"
      @update:has-changes="$emit('update:has-changes', $event)"
    />

    <template #actions>
      <WButton
        v-if="current === 0"
        :disabled="loading || disabled"
        :semantic-type="SemanticType.SECONDARY"
        class="w-full"
        @click="$emit('close:modal')"
      >
        Close
      </WButton>

      <WButton
        v-else
        :disabled="loading || disabled"
        :semantic-type="SemanticType.SECONDARY"
        class="w-full"
        @click="previous"
      >
        Back
      </WButton>

      <WButton
        v-if="current === defaultSlots.length - 1"
        :semantic-type="SemanticType.PRIMARY"
        :loading="loading"
        :disabled="disabled || disabledNext"
        class="w-full"
        @click="$emit('submit')"
      >
        Submit
      </WButton>

      <WButton
        v-else
        :semantic-type="SemanticType.PRIMARY"
        :loading="loading"
        :disabled="disabled || disabledNext"
        class="w-full"
        @click="next"
      >
        Next
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import {computed, ref, useSlots, watch} from 'vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'
import WButton from '@/components/Button/WButton.vue'
import {SemanticType} from '@/utils/SemanticType'
import WTabs from '@/components/Tabs/WTabs.vue'
import {Notify} from '@/utils/Notify'

defineProps<{
  names?: string[]
  loading?: boolean
  disabled?: boolean
  disabledNext?: boolean
}>()

const emit = defineEmits<{
  (e: 'close:modal'): void
  (e: 'submit'): void
  (e: 'next', current: number): void
  (e: 'previous', current: number): void
  (e: 'update:current', value: number): void
  (e: 'update:has-changes', value: boolean): void
}>()

const slots = useSlots()

const tabs = ref<ComponentInstance<typeof WTabs> | undefined>()

const defaultSlots = computed(() => slots.default?.().filter(item => typeof item.type !== 'symbol') ?? [])

const current = ref<number>(0)

const previous = (): void => {
  emit('previous', current.value)

  tabs.value?.previous()
}

const next = (): void => {
  emit('next', current.value)

  const errorMessage = tabs.value?.validate(current.value)

  if (errorMessage) {
    Notify.warn({title: 'Form contains invalid values', caption: errorMessage.length < 200 ? errorMessage : undefined})

    return
  }

  tabs.value?.next()
}

watch(current, value => {
  emit('update:current', value)
}, {immediate: true})

defineExpose({
  next,
  previous,
})

</script>