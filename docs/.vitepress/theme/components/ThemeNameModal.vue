<template>
  <WModalWrapper>
    <template #title>
      {{ title }}
    </template>

    <WUniform
      ref="form"
      :init-data="initData"
      :api-method="save"
      full-payload
      tag="div"
      class="sm-not:px---inner-margin"
      @success="$emit('close:modal')"
    >
      <template #default="scope">
        <WUniform
          v-bind="scope"
          field="name"
          title="Name"
          :validate="validateName"
          required
        >
          <template #field="scopeField">
            <WInput
              v-bind="scopeField"
              autofocus
              @keypress:enter="scope.submit?.()"
            />
          </template>
        </WUniform>
      </template>
    </WUniform>

    <template #actions>
      <WButton
        outline
        class="w-full"
        @click="$emit('close:modal')"
      >
        Cancel
      </WButton>

      <WButton
        class="w-full"
        @click="form?.submit?.()"
      >
        Save
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import {useTemplateRef} from 'vue'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import {isThemeNameTaken} from '../docsTheme'

const props = defineProps<{
  title: string
  name: string
  /** The theme being renamed, so its own name doesn't count as taken. */
  themeId?: string
  onSave: (name: string) => void
}>()

defineEmits<{
  (e: 'close:modal'): void
}>()

type Model = {name: string}

const form = useTemplateRef('form')

const initData = (): Model => ({name: props.name})

const validateName = (value: unknown) => typeof value === 'string' && isThemeNameTaken(value, props.themeId) ? 'A theme with this name exists' : undefined

const save = (payload: Partial<Model>) => {
  props.onSave(payload.name?.trim() ?? props.name)
}
</script>
