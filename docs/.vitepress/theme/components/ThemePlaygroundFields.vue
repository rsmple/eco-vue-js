<template>
  <div class="grid gap-x-4 gap-y-2 sm:grid-cols-2">
    <template
      v-for="token in tokens"
      :key="token.key"
    >
      <div
        v-if="token.kind === 'neutral'"
        class="grid content-start gap-2 sm:col-span-2"
      >
        <div class="text-sm font-semibold">
          {{ token.label }}
        </div>

        <div class="flex flex-wrap gap-2">
          <WButton
            v-for="scale in scales"
            :key="scale"
            :semantic-type="(themeTokens.neutral ?? DEFAULT_TOKENS.neutral) === scale ? SemanticType.PRIMARY : SemanticType.SECONDARY"
            @click="setToken(token.key, scale)"
          >
            <span class="mr-2 flex">
              <span
                v-for="step in [2, 5, 8]"
                :key="step"
                class="size-3 first:rounded-l-full last:rounded-r-full"
                :style="{background: `oklch(${ NEUTRAL_SCALES[scale][step] })`}"
              />
            </span>
            {{ scale }}
          </WButton>
        </div>

        <div class="text-description text-xs">
          {{ token.description }}
        </div>
      </div>

      <WInput
        v-else
        :model-value="themeConfig[token.key] ?? ''"
        :title="token.label"
        :description="token.description"
        :placeholder="shorten(baseTokens[token.key])"
        allow-clear
        @update:model-value="setToken(token.key, $event ?? '')"
      >
        <template
          v-if="token.kind === 'color'"
          #before
        >
          <label
            class="
              relative mr-2 block size-5 shrink-0 self-center overflow-hidden rounded-full border border-line
              ml-[calc(var(--w-option-padding)*-0.5+var(--w-input-gap))]
            "
            :style="{background: `var(--${ token.key })`}"
          >
            <input
              type="color"
              :value="pickerValues[token.key]"
              :aria-label="`Pick ${ token.label.toLowerCase() }`"
              class="absolute inset-0 cursor-pointer opacity-0"
              @input="setToken(token.key, ($event.target as HTMLInputElement).value)"
            >
          </label>
        </template>

        <template
          v-if="token.range"
          #bottom
        >
          <WSlider
            :model-value="sliders[token.key].value"
            :min="sliders[token.key].min"
            :max="sliders[token.key].max"
            @update-eager:model-value="setPx(token.key, $event)"
            @update:model-value="setPx(token.key, $event)"
          >
            <template #right>
              <span class="text-description w-10 self-center text-right text-sm tabular-nums">
                {{ sliders[token.key].value }}px
              </span>
            </template>
          </WSlider>
        </template>
      </WInput>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WSlider from 'eco-vue-js/dist/components/Slider/WSlider.vue'

import {DEFAULT_TOKENS, NEUTRAL_SCALES, type TOKENS, type TokenKey, setToken, themeConfig, themeTokens} from '../docsTheme'

const props = defineProps<{
  tokens: typeof TOKENS
  baseTokens: Record<TokenKey, string>
}>()

const scales = Object.keys(NEUTRAL_SCALES) as (keyof typeof NEUTRAL_SCALES)[]

const ROOT_FONT_SIZE = 16

/** Px of a `rem` or `px` value; undefined for anything else, such as `calc()`. */
const parsePx = (value: string | undefined) => {
  const match = /^(-?\d*\.?\d+)(rem|px)$/.exec(value?.trim() ?? '')

  if (!match) return undefined

  return match[2] === 'rem' ? Number(match[1]) * ROOT_FONT_SIZE : Number(match[1])
}

const getPx = (key: TokenKey) => parsePx(themeConfig.value[key]) ?? parsePx(props.baseTokens[key])

/** Sliders work in whole px; the field gets rem, as the kit's sizes are. */
const setPx = (key: TokenKey, px: number) => setToken(key, `${ +(px / ROOT_FONT_SIZE).toFixed(4) }rem`)

/** Where each size slider stands, held within its range: a value set past it shows at the end. Only tokens with a `range` have one. */
const sliders = computed(() => Object.fromEntries(props.tokens.flatMap(token => {
  if (!token.range) return []

  const {min} = token.range
  const max = 'max' in token.range ? token.range.max : Math.floor((getPx(token.range.pillOf) ?? 0) / 2)
  const value = Math.min(Math.max(Math.round(getPx(token.key) ?? min), min), max)

  return [[token.key, {min, max, value}]]
})) as Record<TokenKey, {min: number, max: number, value: number}>)

/** Placeholders name palette colors the way classes do: `gray-300`, not `var(--color-gray-300)`. */
const shorten = (value: string) => value.replace(/var\(--color-([\w-]+)\)/g, '$1')

let probe: HTMLElement | undefined
let canvasContext: CanvasRenderingContext2D | null | undefined

/**
 * The color picker only takes `#rrggbb`: the token is resolved by the browser, whatever it refers to, then drawn once
 * and read back.
 */
const toHex = (key: TokenKey) => {
  if (!probe) {
    probe = document.createElement('div')
    probe.hidden = true
    document.body.appendChild(probe)
  }

  canvasContext ??= document.createElement('canvas').getContext('2d', {willReadFrequently: true})

  if (!canvasContext) return '#000000'

  probe.style.color = `var(--${ key })`
  canvasContext.clearRect(0, 0, 1, 1)
  canvasContext.fillStyle = getComputedStyle(probe).color
  canvasContext.fillRect(0, 0, 1, 1)

  const [r, g, b] = canvasContext.getImageData(0, 0, 1, 1).data

  return '#' + [r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')
}

// Read after the theme's style is updated: it's applied by a pre-flush watcher, before this renders.
const pickerValues = computed(() => {
  void themeTokens.value

  return Object.fromEntries(props.tokens.filter(token => token.kind === 'color').map(token => [token.key, toHex(token.key)])) as Record<TokenKey, string>
})
</script>
