<template>
  <div class="flex flex-wrap items-center gap-4">
    <WButton @click="count++">
      Clicked {{ count }} times
    </WButton>

    <WButton outline>
      Outline
    </WButton>

    <WButton tooltip-text="Add item">
      <IconAdd class="square-5" />
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'

const count = ref(0)
</script>
