<template>
  <div class="vp-raw p-4">
    <component
      :is="component"
      v-if="component"
    />
    <p v-else-if="name">
      Fixture not found: {{ name }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import {type Component, markRaw, onMounted, ref, shallowRef} from 'vue'

const fixtures = import.meta.glob<{default: Component}>(['./*/*.vue', '!./shared/*.vue'], {eager: true})

const name = ref<string | null>(null)
const component = shallowRef<Component>()

// The query string is only known in the browser, so the fixture renders after hydration.
onMounted(() => {
  name.value = new URLSearchParams(location.search).get('name')

  const fixture = fixtures[`./${ name.value }.vue`]?.default

  if (fixture) component.value = markRaw(fixture)
})
</script>
