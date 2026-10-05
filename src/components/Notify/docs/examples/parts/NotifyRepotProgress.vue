<template>
  <div
    v-if="compact"
    class="w-16 shrink-0"
  >
    <WProgress
      :model-value="progress"
      class="overflow-hidden rounded-full"
    />
  </div>

  <div
    v-else
    class="grid gap-1"
  >
    <div>{{ task.done }} of {{ task.total }} pots</div>

    <WProgress
      :model-value="progress"
      class="overflow-hidden rounded-full"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed, watch} from 'vue'

import {NotifyType} from 'eco-vue-js/dist/utils/Notify'
import type {NotifyContentEmits} from 'eco-vue-js/dist/utils/Notify'

import WProgress from 'eco-vue-js/dist/components/Progress/WProgress.vue'

const props = defineProps<{
  task: {done: number, total: number}
  /** Shown in a row of a group. */
  compact?: boolean
}>()

const emit = defineEmits<NotifyContentEmits>()

const progress = computed(() => Math.round(props.task.done / props.task.total * 100))

// The toast and the notify center each render the content, so the state lives outside it and every copy reports the same.
watch(() => props.task.done === props.task.total, isDone => {
  if (isDone) emit('update', {type: NotifyType.SUCCESS, title: 'Repotting done'})
}, {immediate: true})
</script>
