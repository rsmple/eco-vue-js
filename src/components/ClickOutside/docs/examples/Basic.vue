<template>
  <div class="grid max-w-md gap-4">
    <WClickOutside
      class="rounded-xl border border-solid p-4 transition-colors"
      :class="active ? 'tone-primary border-tone' : 'border-line-subtle'"
      @click="clickOutside"
    >
      <button
        class="w-full cursor-pointer text-left"
        @click="active = true"
      >
        {{ active ? 'Editing — click anywhere else to finish' : 'Click to edit' }}
      </button>
    </WClickOutside>

    <span class="text-description text-sm">Clicks outside the card: {{ count }}</span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WClickOutside from 'eco-vue-js/dist/components/ClickOutside/WClickOutside.vue'

const active = ref(false)
const count = ref(0)

const clickOutside = () => {
  active.value = false
  count.value++
}
</script>
