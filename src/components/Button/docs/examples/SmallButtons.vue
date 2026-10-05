<template>
  <div class="grid gap-6">
    <div class="flex items-center gap-2">
      <code class="rounded-lg bg-surface-muted px-2 py-1">{{ token }}</code>

      <WButtonCopy :value="token" />
    </div>

    <div class="flex max-w-md items-center gap-2">
      <WInput
        v-model="search"
        placeholder="Sensor"
        class="flex-1"
        no-margin
      />

      <WButtonInput
        :icon="markRaw(IconRefresh)"
        tooltip-text="Sync sensors"
        :loading="syncing"
        @click="sync"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import WButtonCopy from 'eco-vue-js/dist/components/Button/WButtonCopy.vue'
import WButtonInput from 'eco-vue-js/dist/components/Button/WButtonInput.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

import IconRefresh from 'eco-vue-js/dist/assets/icons/IconRefresh'

const token = 'gh2_4f9c2e1a7b'
const search = ref<string>()
const syncing = ref(false)

const sync = () => {
  syncing.value = true
  setTimeout(() => syncing.value = false, 1500)
}
</script>
