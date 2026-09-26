<template>
  <div class="vp-raw">
    <WInput
      v-model="search"
      type="search"
      placeholder="Search icons…"
      :icon="markRaw(IconSearch)"
      allow-clear
      no-margin
      class="mb-4"
    />

    <p class="mb-4 text-sm text-gray-500">
      {{ filtered.length }} of {{ icons.length }} icons — click to copy the import
    </p>

    <ul class="grid grid-cols-fill-32 gap-2">
      <li
        v-for="icon in filtered"
        :key="icon.name"
      >
        <button
          type="button"
          class="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-transparent p-3 hover:border-gray-300 dark:hover:border-gray-700"
          :title="importLine(icon.name)"
          @click="doCopy(importLine(icon.name))"
        >
          <component
            :is="icon.component"
            class="square-6"
          />
          <span class="max-w-full truncate text-xs text-gray-500">{{ icon.name }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import {type FunctionalComponent, type SVGAttributes, computed, markRaw, ref} from 'vue'

import WInput from '@/components/Input/WInput.vue'

import IconSearch from '@/assets/icons/IconSearch.svg?component'

import {doCopy} from '@/utils/useCopy'

const modules = import.meta.glob<{default: FunctionalComponent<SVGAttributes>}>('../../../../src/assets/icons/Icon*.svg', {eager: true})

const icons = Object.entries(modules)
  .map(([path, module]) => ({
    name: path.slice(path.lastIndexOf('/') + 1, -4),
    component: markRaw(module.default),
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

const search = ref<string | undefined | null>('')

const filtered = computed(() => {
  const query = (search.value ?? '').trim().toLowerCase()

  return query ? icons.filter(icon => icon.name.toLowerCase().includes(query)) : icons
})

const importLine = (name: string) => `import ${ name } from 'eco-vue-js/dist/assets/icons/${ name }'`
</script>
