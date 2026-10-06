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

    <WTabs
      ref="tabsStepper"
      :disable-min-height="disableMinHeight"
      stepper
      no-header
      @update:first="first = $event"
      @update:last="last = $event"
      @update:current-title="currentTitle = $event"
      @update:has-changes="$emit('update:has-changes', $event)"
      @update:progress="progress = $event"
    >
      <slot />
    </WTabs>

    <template #actions>
      <WButton
        v-if="first"
        :disabled="loading || disabled"
        :semantic-type="SemanticType.SECONDARY"
        class="w-full"
        @click="$emit('close:modal')"
      >
        {{ getText('close') }}
      </WButton>

      <WButton
        v-else
        :disabled="loading || disabled"
        :semantic-type="SemanticType.SECONDARY"
        class="w-full"
        @click="tabsStepperRef?.previous()"
      >
        {{ getText('back') }}
      </WButton>

      <WButton
        v-if="last"
        :semantic-type="SemanticType.PRIMARY"
        :loading="loading"
        :disabled="disabled || disabledNext"
        class="w-full"
        @click="$emit('submit')"
      >
        {{ submitText ?? getText('submit') }}
      </WButton>

      <WButton
        v-else
        :semantic-type="SemanticType.PRIMARY"
        :loading="loading"
        :disabled="disabled || disabledNext"
        class="w-full"
        @click="tabsStepperRef?.next()"
      >
        {{ getText('next') }}
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
// Deprecated: a WModalWrapper around a stepper WTabs with `stepperControls` does the same, with Cancel, the form's submit and texts from `setTexts`.
import {ref, useTemplateRef} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'
import WProgress from '@/components/Progress/WProgress.vue'
import WTabs from '@/components/Tabs/WTabs.vue'

import {SemanticType} from '@/utils/SemanticType'
import {getText} from '@/utils/texts'

defineProps<{
  /** Shows a spinner in the Next or Submit button and disables Back and Close, e.g. while the form submits. */
  loading?: boolean
  /** Disables all the buttons. */
  disabled?: boolean
  /** Disables the Next or Submit button, e.g. until something is picked on the step. */
  disabledNext?: boolean
  /** Text of the submit button on the last step. Defaults to "Submit". */
  submitText?: string
  /** Lets the modal shrink to the current step's height. By default it keeps the height of the tallest step shown so far. */
  disableMinHeight?: boolean
}>()

defineEmits<{
  /** Close was clicked on the first step. */
  (e: 'close:modal'): void
  /** Submit was clicked on the last step. */
  (e: 'submit'): void
  /** Whether a form inside has unsaved changes, for the modal to ask before closing. */
  (e: 'update:has-changes', value: boolean): void
}>()

defineSlots<{
  /** The steps, as WTabsItem items. Their `validate`, `hasValue` and `requireSave` work as in a stepper WTabs. */
  default?: () => void
  /** Replaces the title, which is the current step's title by default. */
  title?: () => void
}>()

const tabsStepperRef = useTemplateRef('tabsStepper')

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