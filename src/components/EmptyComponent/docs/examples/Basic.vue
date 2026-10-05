<template>
  <div class="grid max-w-60 gap-4">
    <WToggle
      v-model="scroll"
      title="Scroll long names on hover"
    />

    <div class="grid gap-2">
      <div
        v-for="name in names"
        :key="name"
        class="group/overflow grid rounded-lg bg-surface-muted px-3 py-2"
      >
        <component :is="scroll ? WTextOverflow : WEmptyComponent">
          <span
            class="whitespace-nowrap"
            :class="{truncate: !scroll}"
          >{{ name }}</span>
        </component>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WEmptyComponent from 'eco-vue-js/dist/components/EmptyComponent/WEmptyComponent.vue'
import WTextOverflow from 'eco-vue-js/dist/components/TextOverflow/WTextOverflow.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const names = [
  'Basil',
  'Monstera deliciosa \'Thai Constellation\'',
  'Ficus lyrata, fiddle-leaf fig from the north greenhouse',
]

const scroll = ref(true)
</script>
