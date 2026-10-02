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
          @click="setPreset(preset.id)"
        >
          <ThemeSwatch :config="{preset: preset.id}" />
          {{ preset.name }}
        </WMenuItem>

        <WMenuItem
          v-if="hasCustomTokens && !activeThemeId && !isRandomTheme"
          active
          :href="withBase('/guide/theming')"
        >
          Custom
        </WMenuItem>

        <template v-if="savedThemes.length">
          <div class="my-2 border-t border-line-subtle" />

          <div class="text-xs mb-1 text-description font-semibold px-3">
            My themes
          </div>

          <WMenuItem
            v-for="theme in savedThemes"
            :key="theme.id"
            :active="activeThemeId === theme.id"
            @click="selectTheme(theme.id)"
          >
            <ThemeSwatch :config="theme.config" />
            <div>
              {{ theme.name }}
            </div>
          </WMenuItem>
        </template>

        <div class="my-2 border-t border-line-subtle" />

        <div class="text-xs mb-1 text-description font-semibold px-3">
          Random theme
        </div>

        <WMenuItem
          :active="isRandomTheme"
          @click="setRandomTheme"
        >
          <IconRefresh class="square-[1em]" /> Randomize
        </WMenuItem>

        <WButtonGroup
          :model-value="randomStyle"
          :list="RANDOM_STYLES.map(style => style.id)"
          :semantic-type="SemanticType.SECONDARY"
          no-margin
          stretch
          class="w-button-h-8 w-button-rounded-lg mx-2 mt-1"
          @update:model-value="randomStyle = $event"
        >
          <template #option="{option}">
            {{ RANDOM_STYLES.find(style => style.id === option)?.name }}
          </template>
        </WButtonGroup>

        <div class="my-2 border-t border-line-subtle" />

        <WMenuItem
          v-if="!activeThemeId"
          @click="saveTheme"
        >
          Save theme…
        </WMenuItem>

        <WMenuItem @click="copyLink.doCopy">
          <IconLink class="square-[1em]" /> {{ copyLink.copied.value ? 'Copied' : 'Copy theme link' }}
        </WMenuItem>

        <WMenuItem @click="copyCss.doCopy">
          <IconCodeInline class="square-[1em]" /> {{ copyCss.copied.value ? 'Copied' : 'Copy theme CSS' }}
        </WMenuItem>

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
import {useCopy} from 'eco-vue-js/dist/utils/useCopy'

import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WDropdownAdaptive from 'eco-vue-js/dist/components/DropdownMenu/WDropdownAdaptive.vue'
import WMenuItem from 'eco-vue-js/dist/components/MenuItem/WMenuItem.vue'

import IconCodeInline from 'eco-vue-js/dist/assets/icons/IconCodeInline'
import IconLink from 'eco-vue-js/dist/assets/icons/IconLink'
import IconRefresh from 'eco-vue-js/dist/assets/icons/IconRefresh'

import ThemeSwatch from './ThemeSwatch.vue'

import {PRESETS, RANDOM_STYLES, activeTheme, activeThemeId, getThemeCss, getThemeLink, hasCustomTokens, isRandomTheme, randomStyle, resetTheme, savedThemes, selectTheme, setPreset, setRandomTheme, themeConfig, themeTokens} from '../docsTheme'
import IconPalette from '../icons/IconPalette.svg?component'
import {confirmDeleteAllThemes, openSaveTheme} from '../themeConfirm'

const isOpen = ref(false)

const activePreset = computed(() => themeConfig.value.preset ?? 'default')

const copyLink = useCopy(() => getThemeLink(themeConfig.value, undefined, activeTheme.value?.name))
const copyCss = useCopy(() => getThemeCss(themeTokens.value))

const saveTheme = () => {
  isOpen.value = false
  openSaveTheme()
}

const confirmDeleteAll = () => {
  isOpen.value = false
  confirmDeleteAllThemes()
}
</script>
