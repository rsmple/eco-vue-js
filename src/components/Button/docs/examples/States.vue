<template>
  <div class="flex flex-wrap items-center gap-4">
    <WButton
      :loading="saving"
      @click="save"
    >
      Save
    </WButton>

    <WButton disabled>
      Disabled
    </WButton>

    <WButton skeleton>
      Skeleton
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

const saving = ref(false)

const save = () => {
  saving.value = true

  setTimeout(() => saving.value = false, 1500)
}
</script>
