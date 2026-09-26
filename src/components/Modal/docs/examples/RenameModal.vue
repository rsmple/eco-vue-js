<template>
  <WModalWrapper>
    <template #title>
      Rename
    </template>

    <WInput
      v-model="value"
      title="Name"
      autofocus
    />

    <template #actions>
      <WButton
        outline
        @click="$emit('close:modal')"
      >
        Cancel
      </WButton>

      <WButton
        :disabled="!value"
        @click="save"
      >
        Save
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'

const props = defineProps<{
  name: string
  onSave: (name: string) => void
}>()

const emit = defineEmits<{
  (e: 'close:modal'): void
}>()

const value = ref<string | undefined>(props.name)

const save = () => {
  if (!value.value) return

  props.onSave(value.value)
  emit('close:modal')
}
</script>
