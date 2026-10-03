<template>
  <WSelect
    :model-value="light"
    :options="options"
    :value-getter="item => item.id"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search)"
    :create-option="createLight"
    title="Light it tolerates"
    placeholder="Add a light level"
    :option-component="OptionLight"
    class="max-w-md"
    @select="light = [...light, $event]"
    @unselect="light = light.filter(item => item !== $event)"
  />

  <p class="text-sm text-description">
    Model: {{ light }}
  </p>
</template>

<script lang="ts" setup>
import {markRaw, reactive, ref} from 'vue'

import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'

import IconCloud from 'eco-vue-js/dist/assets/icons/IconCloud'
import IconCloudSun from 'eco-vue-js/dist/assets/icons/IconCloudSun'
import IconCloudSunPartial from 'eco-vue-js/dist/assets/icons/IconCloudSunPartial'
import IconMoon from 'eco-vue-js/dist/assets/icons/IconMoon'
import IconSun from 'eco-vue-js/dist/assets/icons/IconSun'

import OptionLight, {type Light} from './parts/OptionLight.vue'

const options = reactive<Light[]>([
  {id: 'full-sun', name: 'Full sun', tone: 'tone-data-amber', icon: markRaw(IconSun)},
  {id: 'bright-indirect', name: 'Bright indirect', tone: 'tone-data-orange', icon: markRaw(IconCloudSun)},
  {id: 'part-shade', name: 'Part shade', tone: 'tone-data-teal', icon: markRaw(IconCloudSunPartial)},
  {id: 'shade', name: 'Shade', tone: 'tone-data-cyan', icon: markRaw(IconCloud)},
  {id: 'low-light', name: 'Low light', tone: 'tone-data-violet', icon: markRaw(IconMoon)},
])

const light = ref<string[]>(['bright-indirect', 'part-shade'])

// In an app, a POST that answers with the saved option. Without an icon, the option shows a tag.
const createLight = (search: string): Light => {
  const option = {id: search.toLowerCase().replaceAll(' ', '-'), name: search, tone: 'tone-data-gray'}

  options.push(option)

  return option
}
</script>
