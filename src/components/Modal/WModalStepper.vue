<template>
  <WModalWrapper maximized>
    <template #title>
      <slot name="title">
        {{ currentTitle }}
      </slot>
    </template>

    <template #subtitle>
      <WProgress :model-value="progress" />
    </template>

    <WTabsStepper
      ref="tabsStepper"
      :custom-slots="defaultSlots"
      @update:first="first = $event"
      @update:last="last = $event"
      @update:current-title="currentTitle = $event"
      @update:has-changes="$emit('update:has-changes', $event)"
      @update:progress="progress = $event"
    />

    <template #actions>
      <WButton
        v-if="first"
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
        @click="tabsStepperRef?.previous()"
      >
        Back
      </WButton>

      <WButton
        v-if="last"
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
        @click="tabsStepperRef?.next()"
      >
        Next
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import {computed, ref, useSlots, useTemplateRef} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'
import WProgress from '@/components/Progress/WProgress.vue'
import WTabsStepper from '@/components/Tabs/WTabsStepper.vue'

import {SemanticType} from '@/utils/SemanticType'

defineProps<{
  loading?: boolean
  disabled?: boolean
  disabledNext?: boolean
}>()

defineEmits<{
  (e: 'close:modal'): void
  (e: 'submit'): void
  (e: 'update:has-changes', value: boolean): void
}>()

const slots = useSlots()

const tabsStepperRef = useTemplateRef('tabsStepper')

const defaultSlots = computed(() => slots.default?.() ?? [])

const first = ref(true)
const last = ref(false)
const currentTitle = ref<string>()
const progress = ref<number>(0)

const previous = (): void => {
  tabsStepperRef.value?.previous()
}

const next = (): void => {
  tabsStepperRef.value?.next()
}

defineExpose({
  next,
  previous,
})
</script>