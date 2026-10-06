<template>
  <WModalStepper
    :loading="sending"
    submit-text="Send invite"
    class="w-modal-wrapper-w-160"
    @close:modal="$emit('close:modal')"
    @submit="send"
    @update:has-changes="$emit('update:has-changes', $event)"
  >
    <WTabsItem
      title="Who to invite"
      name="email"
      :validate="() => email ? undefined : 'Enter an email to invite'"
    >
      <WInput
        v-model="email"
        title="Email"
        type="email"
        autofocus
        class="pt-4"
      />
    </WTabsItem>

    <WTabsItem
      title="Role"
      name="role"
    >
      <WButtonGroup
        v-model="role"
        :list="ROLES"
        title="Role"
        class="pt-4"
      >
        <template #option="{option}">
          {{ option }}
        </template>
      </WButtonGroup>
    </WTabsItem>

    <WTabsItem
      title="Check and send"
      name="summary"
    >
      <p class="pt-4">
        {{ email }} will join as {{ role }}.
      </p>
    </WTabsItem>
  </WModalStepper>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WModalStepper from 'eco-vue-js/dist/components/Modal/WModalStepper.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'

const ROLES = ['Viewer', 'Editor', 'Admin']

const props = defineProps<{
  onInvite: (email: string, role: string) => void
}>()

const emit = defineEmits<{
  (e: 'close:modal'): void
  (e: 'update:has-changes', value: boolean): void
}>()

const email = ref<string>()
const role = ref('Viewer')
const sending = ref(false)

const send = () => {
  sending.value = true

  setTimeout(() => {
    props.onInvite(email.value!, role.value)
    emit('close:modal')
  }, 800)
}
</script>
