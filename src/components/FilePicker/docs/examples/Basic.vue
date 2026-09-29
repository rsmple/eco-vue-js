<template>
  <div class="grid max-w-xl gap-4">
    <WFilePicker
      v-model="files"
      title="Attachments"
      accept="image/*,.pdf"
      multiple
    />

    <WFilePicker
      v-model="avatar"
      title="Avatar"
      :placeholder="current"
      accept="image/*"
      @update:model-value="current = undefined"
      @clear:placeholder="current = undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WFilePicker from 'eco-vue-js/dist/components/FilePicker/WFilePicker.vue'

const files = ref<File[]>([])

// The file that is already saved, shown until a new one is picked or it is removed.
const avatar = ref<File[]>([])
const current = ref<string | undefined>('avatar.png')
</script>
