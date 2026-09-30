<template>
  <div class="vp-raw grid gap-8">
    <div class="grid gap-3">
      <div class="text-description text-sm font-semibold">
        Preset
      </div>

      <div class="flex flex-wrap gap-2">
        <WButton
          v-for="preset in PRESETS"
          :key="preset.id"
          :semantic-type="activePreset === preset.id ? SemanticType.PRIMARY : SemanticType.SECONDARY"
          @click="setPreset(preset.id)"
        >
          {{ preset.name }}
        </WButton>
      </div>

      <p
        v-if="hasCustomTokens"
        class="text-description text-sm"
      >
        Custom values over {{ findPreset(activePreset)?.name }}. Picking a preset drops them.
      </p>
    </div>

    <div
      v-for="group in groups"
      :key="group.name"
      class="grid gap-3"
    >
      <div class="text-description text-sm font-semibold">
        {{ group.name }}
      </div>

      <div class="grid gap-x-4 gap-y-2 sm:grid-cols-2">
        <WInput
          v-for="token in group.tokens"
          :key="token.key"
          :model-value="themeConfig[token.key] ?? ''"
          :title="token.label"
          :description="'description' in token ? token.description : undefined"
          :placeholder="baseTokens[token.key]"
          allow-clear
          @update:model-value="setToken(token.key, $event ?? '')"
        >
          <template
            v-if="token.key.startsWith('color-')"
            #before
          >
            <label
              class="relative mr-2 block size-5 shrink-0 self-center overflow-hidden rounded-full border border-gray-300 dark:border-gray-700"
              :style="{background: themeTokens[token.key] ?? DEFAULT_TOKENS[token.key]}"
            >
              <input
                type="color"
                :value="toHex(themeTokens[token.key] ?? DEFAULT_TOKENS[token.key])"
                :aria-label="`Pick ${ token.label.toLowerCase() }`"
                class="absolute inset-0 cursor-pointer opacity-0"
                @input="setToken(token.key, ($event.target as HTMLInputElement).value)"
              >
            </label>
          </template>
        </WInput>
      </div>
    </div>

    <div class="grid gap-3">
      <div class="flex flex-wrap gap-2">
        <WButton
          :semantic-type="SemanticType.PRIMARY"
          @click="copyLink.doCopy"
        >
          {{ copyLink.copied.value ? 'Copied' : 'Copy link' }}
        </WButton>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="copyCss.doCopy"
        >
          {{ copyCss.copied.value ? 'Copied' : 'Copy CSS' }}
        </WButton>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          :disabled="!Object.keys(themeConfig).length"
          @click="resetTheme"
        >
          Reset
        </WButton>
      </div>

      <pre class="overflow-auto rounded-xl bg-gray-100 p-4 font-mono text-sm dark:bg-gray-850">{{ css }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {useCopy} from 'eco-vue-js/dist/utils/useCopy'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

import {
  DEFAULT_TOKENS,
  PRESETS,
  TOKENS,
  type ThemeTokens,
  findPreset,
  getThemeCss,
  getThemeLink,
  hasCustomTokens,
  resetTheme,
  setPreset,
  setToken,
  themeConfig,
  themeTokens,
} from '../docsTheme'

const groups = [...new Set(TOKENS.map(token => token.group))].map(name => ({name, tokens: TOKENS.filter(token => token.group === name)}))

const activePreset = computed(() => themeConfig.value.preset ?? 'default')

// What an empty field falls back to: the preset's value, or the site's.
const baseTokens = computed(() => ({...DEFAULT_TOKENS, ...findPreset(activePreset.value)?.tokens as ThemeTokens}))

const css = computed(() => getThemeCss(themeTokens.value))

const copyLink = useCopy(() => getThemeLink(themeConfig.value))
const copyCss = useCopy(css)

let canvasContext: CanvasRenderingContext2D | null | undefined

/** The color picker only takes `#rrggbb`: the color is drawn once and read back, whatever syntax it is written in. */
const toHex = (color: string) => {
  canvasContext ??= document.createElement('canvas').getContext('2d', {willReadFrequently: true})

  if (!canvasContext) return '#000000'

  canvasContext.clearRect(0, 0, 1, 1)
  canvasContext.fillStyle = color
  canvasContext.fillRect(0, 0, 1, 1)

  const [r, g, b] = canvasContext.getImageData(0, 0, 1, 1).data

  return '#' + [r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')
}
</script>
