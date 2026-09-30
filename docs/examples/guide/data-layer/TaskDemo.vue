<template>
  <div class="grid gap-6">
    <div class="grid gap-6 md:grid-cols-2">
      <div class="grid content-start gap-1">
        <span class="text-description text-sm">taskModelApi.paginated</span>

        <button
          v-for="task in queryTasks.data.value?.results"
          :key="task.id"
          class="flex items-center gap-2 rounded-lg px-2 py-1 text-left [&_svg]:square-4"
          :class="{'bg-gray-100 dark:bg-gray-800': task.id === selected}"
          @click="selected = task.id"
        >
          <WStatusIcon :has-value="task.done" />
          {{ task.title }}
        </button>

        <WSkeleton
          v-for="index in queryTasks.data.value ? 0 : 4"
          :key="index"
        />
      </div>

      <div class="grid content-start gap-3">
        <span class="text-description text-sm">taskModelApi.item</span>

        <span class="font-semibold">
          <WSkeleton v-if="!queryTask.data.value" />

          <template v-else>
            {{ queryTask.data.value.title }}
          </template>
        </span>

        <WToggle
          :model-value="queryTask.data.value?.done ?? false"
          title="Done"
          :skeleton="!queryTask.data.value"
          @update:model-value="toggle"
        />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <WToggle
        v-model="server.fail"
        title="Requests fail"
      />

      <span
        v-if="error"
        class="text-negative dark:text-negative-dark text-sm"
      >
        {{ error }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'
import WStatusIcon from 'eco-vue-js/dist/components/Status/WStatusIcon.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import {server, taskModelApi} from './api/Task'

const selected = ref(1)
const error = ref<string>()

const queryTasks = taskModelApi.paginated.use({})
const queryTask = taskModelApi.item.use(selected)

const toggle = (done: boolean) => {
  error.value = undefined

  taskModelApi.item.actions.update(selected.value, {done})
    .catch(() => error.value = 'The update failed and was rolled back.')
}
</script>
