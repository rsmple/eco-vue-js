<template>
  <WModalWrapper maximized>
    <template #title>
      <slot name="title">
        {{ currentTitle }}
      </slot>
    </template>

    <template #subtitle>
      <div class="h-1 w-full bg-gray-200 dark:bg-gray-700">
        <div
          class="bg-primary-default dark:bg-primary-dark h-full transition-[width]"
          :style="{
            width: (100 * (current + 1) / tabsLength) + '%',
          }"
        />
      </div>
    </template>

    <WTabs
      ref="tabs"
      :custom-slots="defaultSlots"
      no-header
      @update:current-index="current = $event"
      @update:current-title="currentTitle = $event"
      @update:has-changes="$emit('update:has-changes', $event)"
      @update:tabs-length="tabsLength = $event"
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
        v-if="current === tabsLength - 1"
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
import {computed, ref, useSlots, useTemplateRef, watch} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'
import WTabs from '@/components/Tabs/WTabs.vue'

import {Notify} from '@/utils/Notify'
import {SemanticType} from '@/utils/SemanticType'

defineProps<{
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

const tabsRef = useTemplateRef('tabs')

const defaultSlots = computed(() => slots.default?.() ?? [])

const tabsLength = ref(0)
const current = ref<number>(0)
const currentTitle = ref<string>()

const previous = (): void => {
  emit('previous', current.value)

  tabsRef.value?.previous()
}

const next = (): void => {
  emit('next', current.value)

  const errorMessage = tabsRef.value?.validate(current.value)

  if (errorMessage) {
    Notify.warn({title: 'Form contains invalid values', caption: errorMessage.length < 200 ? errorMessage : undefined})

    return
  }

  tabsRef.value?.next()
}

watch(current, value => {
  emit('update:current', value)
}, {immediate: true})

defineExpose({
  next,
  previous,
})
</script>