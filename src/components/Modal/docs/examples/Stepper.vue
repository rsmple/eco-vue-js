<template>
  <div class="flex flex-wrap items-center gap-4">
    <WButton @click="invite">
      Invite a member
    </WButton>

    <span
      v-if="invited"
      class="text-description"
    >
      Invited {{ invited }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import {defineAsyncComponent, markRaw, ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

const InviteModal = defineAsyncComponent(() => import('./parts/InviteModal.vue'))

const invited = ref<string>()

const invite = () => {
  Modal.add(markRaw(InviteModal), {
    onInvite: (email: string, role: string) => invited.value = `${ email } as ${ role }`,
  })
}
</script>
