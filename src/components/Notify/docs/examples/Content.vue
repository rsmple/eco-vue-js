<template>
  <WButton
    :semantic-type="SemanticType.PRIMARY"
    @click="repot"
  >
    Repot the seedlings
  </WButton>
</template>

<script lang="ts" setup>
import {reactive} from 'vue'

import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

import NotifyRepotProgress from './parts/NotifyRepotProgress.vue'

const repot = () => {
  const task = reactive({done: 0, total: 8})

  Notify.process({title: 'Repotting seedlings', component: NotifyRepotProgress, componentProps: {task}})

  const interval = setInterval(() => {
    task.done++

    if (task.done === task.total) clearInterval(interval)
  }, 500)
}
</script>
