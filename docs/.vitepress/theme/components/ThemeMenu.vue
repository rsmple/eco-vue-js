<template>
  <WDropdownAdaptive
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.RIGHT_INNER"
    close-on-click-outside
    @close="isOpen = false"
  >
    <template #toggle>
      <button
        class="w-hover-circle-trigger flex cursor-pointer justify-center p-2 text-xl outline-none"
        :aria-expanded="isOpen"
        aria-label="Theme"
        @click="isOpen = !isOpen"
      >
        <div
          class="w-hover-circle relative"
          :class="isOpen ? 'tone-primary text-tone' : 'text-description'"
        >
          <IconPalette class="square-[1.125em]" />
        </div>
      </button>
    </template>

    <template #header>
      <div class="py-2 text-base font-semibold">
        Theme
      </div>
    </template>

    <template #content="{isMobile}">
      <div
        class="text-start font-normal"
        :class="{
          'bg-surface my-2 max-h-[calc(100vh-6rem)] min-w-56 overflow-y-auto overscroll-contain rounded-xl shadow-md border border-solid border-line-raised': !isMobile,
        }"
      >
        <WMenuItem
          v-for="preset in PRESETS"
          :key="preset.id"
          :active="!activeThemeId && !hasCustomTokens && activePreset === preset.id"
          @click="setPreset(preset.id); isOpen = false"
        >
          <ThemeSwatch :config="{preset: preset.id}" />
          {{ preset.name }}
        </WMenuItem>

        <WMenuItem
          v-if="hasCustomTokens && !activeThemeId"
          active
          :href="withBase('/guide/theming')"
        >
          Custom
        </WMenuItem>

        <template v-if="savedThemes.length">
          <div class="my-1 border-t border-line-subtle" />

          <WMenuItem
            v-for="theme in savedThemes"
            :key="theme.id"
            :active="activeThemeId === theme.id"
            @click="selectTheme(theme.id); isOpen = false"
          >
            <ThemeSwatch :config="theme.config" />
            <div>
              {{ theme.name }}
            </div>
          </WMenuItem>
        </template>

        <div class="my-1 border-t border-line-subtle" />

        <WMenuItem :href="withBase('/guide/theming')">
          Customize…
        </WMenuItem>

        <WMenuItem
          :disabled="!Object.keys(themeConfig).length"
          @click="resetTheme(); isOpen = false"
        >
          Reset
        </WMenuItem>

        <WMenuItem
          v-if="savedThemes.length"
          :semantic-type="SemanticType.NEGATIVE"
          @click="confirmDeleteAll"
        >
          Delete all my themes
        </WMenuItem>
      </div>
    </template>
  </WDropdownAdaptive>
</template>

<script lang="ts" setup>
import {withBase} from 'vitepress'
import {computed, ref} from 'vue'

import {HorizontalAlign} from 'eco-vue-js/dist/utils/HorizontalAlign'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WDropdownAdaptive from 'eco-vue-js/dist/components/DropdownMenu/WDropdownAdaptive.vue'
import WMenuItem from 'eco-vue-js/dist/components/MenuItem/WMenuItem.vue'

import ThemeSwatch from './ThemeSwatch.vue'

import {PRESETS, activeThemeId, hasCustomTokens, resetTheme, savedThemes, selectTheme, setPreset, themeConfig} from '../docsTheme'
import IconPalette from '../icons/IconPalette.svg?component'
import {confirmDeleteAllThemes} from '../themeConfirm'

const isOpen = ref(false)

const activePreset = computed(() => themeConfig.value.preset ?? 'default')

const confirmDeleteAll = () => {
  isOpen.value = false
  confirmDeleteAllThemes()
}
</script>
