<template>
  <WButton
    :semantic-type="SemanticType.PRIMARY"
    @click="water"
  >
    Water the greenhouse
  </WButton>
</template>

<script lang="ts" setup>
import {Notify, NotifyType} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

const water = () => {
  const id = Notify.process({title: 'Watering 12 plants', caption: 'Greenhouse A'})

  if (id === undefined) return

  setTimeout(() => Notify.update(id, {type: NotifyType.SUCCESS, title: '12 plants watered'}), 3000)
}
</script>
