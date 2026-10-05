<template>
  <!--
    The bar is `position: fixed` to the window in an app. The transform makes this frame the box it is fixed to,
    and the variables are the ones an app sets on `body`.
  -->
  <div
    class="
      relative h-96 overflow-hidden rounded-xl border border-solid border-line-subtle transform-[translateZ(0)]
      [--actions-bar-filter-width:16rem] [--header-height:3.5rem] [--right-margin:0px] [--w-actions-bar-width:3.5rem]
    "
  >
    <div class="grid gap-2 p-4 pr-18">
      <span class="font-semibold">Plants</span>
      <span class="text-description text-sm">
        {{ onlyThirsty ? 'Thirsty plants only' : 'All plants' }}{{ light ? `, ${ light } light` : '' }}
      </span>
    </div>

    <WActionsBar
      text-filter="Filters"
      class="bg-surface shadow-md"
    >
      <template #top>
        <WButtonAction
          title="Add plant"
          :icon="markRaw(IconAdd)"
          @click="added++"
        />

        <WButtonAction
          title="Water all"
          :icon="markRaw(IconDrop)"
          :loading="watering"
          @click="water"
        />

        <WButtonAction
          title="Alerts"
          :icon="markRaw(IconNotification)"
          :count="added"
          :active="added > 0"
          @click="added = 0"
        />
      </template>

      <template #footer>
        <WButtonAction
          title="Settings"
          :icon="markRaw(IconSettings)"
          title-text
        />
      </template>
    </WActionsBar>

    <WActionsBarFilter :count="(onlyThirsty ? 1 : 0) + (light ? 1 : 0)">
      <div class="grid gap-4 px-4">
        <WToggle
          v-model="onlyThirsty"
          title="Thirsty only"
        />

        <WCheckbox
          v-for="item in lights"
          :key="item"
          :model-value="light === item"
          :title="item"
          radio
          @update:model-value="light = $event ? item : undefined"
        />
      </div>
    </WActionsBarFilter>
  </div>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import WActionsBar from 'eco-vue-js/dist/components/ActionsBar/WActionsBar.vue'
import WActionsBarFilter from 'eco-vue-js/dist/components/ActionsBar/WActionsBarFilter.vue'
import WButtonAction from 'eco-vue-js/dist/components/Button/WButtonAction.vue'
import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'
import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'
import IconNotification from 'eco-vue-js/dist/assets/icons/IconNotification'
import IconSettings from 'eco-vue-js/dist/assets/icons/IconSettings'

const lights = ['Bright', 'Partial', 'Shade']

const onlyThirsty = ref(false)
const light = ref<string>()
const added = ref(0)
const watering = ref(false)

const water = () => {
  watering.value = true
  setTimeout(() => watering.value = false, 1500)
}
</script>
