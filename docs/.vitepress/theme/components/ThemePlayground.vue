<template>
  <div class="vp-raw grid gap-8">
    <div class="grid gap-3 rounded-xl border border-solid border-line-subtle p-4">
      <div class="flex items-center gap-2 font-semibold">
        <div class="flex gap-2 items-center mr-auto">
          <ThemeSwatch :config="themeConfig" />

          <div class="truncate">
            {{ currentName }}
          </div>
        </div>

        <div class="flex gap-2">
          <template v-if="activeTheme">
            <WButton
              :semantic-type="SemanticType.SECONDARY"
              @click="openRename(activeTheme)"
            >
              <IconEditCircle class="square-[1em]" /> Rename
            </WButton>

            <WButton
              :semantic-type="SemanticType.SECONDARY"
              @click="duplicateTheme(activeTheme.id)"
            >
              <IconCopy class="square-[1em]" /> Duplicate
            </WButton>

            <WButton
              :semantic-type="SemanticType.NEGATIVE"
              outline
              @click="confirmDelete(activeTheme)"
            >
              <IconCancel class="square-[1em]" /> Delete
            </WButton>
          </template>

          <WButton
            v-else
            :semantic-type="SemanticType.PRIMARY"
            @click="openSaveTheme"
          >
            <IconSave class="square-[1em]" /> Save as…
          </WButton>
        </div>
      </div>

      <p class="text-description text-sm">
        <template v-if="activeTheme">
          Saved in this browser. Changes are saved into it as you make them.
        </template>

        <template v-else>
          Not saved. Save it to keep it in this browser and switch to it from the palette menu on any page.
        </template>
      </p>

      <div class="flex flex-wrap gap-2">
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="copyLink.doCopy"
        >
          <IconLink class="square-[1em]" /> {{ copyLink.copied.value ? 'Copied' : 'Share link' }}
        </WButton>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="copyCss.doCopy"
        >
          <IconCodeInline class="square-[1em]" /> {{ copyCss.copied.value ? 'Copied' : 'Copy CSS' }}
        </WButton>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          :disabled="!Object.keys(themeConfig).length"
          @click="resetTheme"
        >
          <IconUndo class="square-[1em]" /> Reset
        </WButton>
      </div>

      <details>
        <summary class="text-description cursor-pointer text-sm font-semibold">
          CSS
        </summary>

        <pre class="mt-3 mb-0 overflow-auto rounded-xl bg-surface-muted p-4 font-mono text-sm">{{ css }}</pre>
      </details>
    </div>

    <div class="grid gap-3">
      <div class="text-description text-sm font-semibold">
        Presets
      </div>

      <div class="flex flex-wrap gap-2">
        <WButton
          v-for="preset in PRESETS"
          :key="preset.id"
          :semantic-type="!activeTheme && !hasCustomTokens && activePreset === preset.id ? SemanticType.PRIMARY : SemanticType.SECONDARY"
          @click="setPreset(preset.id)"
        >
          <ThemeSwatch :config="{preset: preset.id}" />
          {{ preset.name }}
        </WButton>
      </div>

      <p
        v-if="hasCustomTokens && !activeTheme"
        class="text-description text-sm"
      >
        Custom values over {{ findPreset(activePreset)?.name }}. Picking a preset drops them.
      </p>
    </div>

    <div
      v-if="savedThemes.length"
      class="grid gap-3"
    >
      <div class="text-description text-sm font-semibold">
        My themes
      </div>

      <div class="flex flex-wrap gap-2">
        <WButton
          v-for="theme in savedThemes"
          :key="theme.id"
          :semantic-type="activeThemeId === theme.id ? SemanticType.PRIMARY : SemanticType.SECONDARY"
          class="max-w-full grid grid-cols-1"
          @click="selectTheme(theme.id)"
        >
          <ThemeSwatch :config="theme.config" />
          <div class="truncate">
            {{ theme.name }}
          </div>
        </WButton>
      </div>

      <div>
        <WButton
          :semantic-type="SemanticType.NEGATIVE"
          outline
          @click="confirmDeleteAllThemes"
        >
          <IconTrash class="square-[1em]" /> Delete all
        </WButton>
      </div>
    </div>

    <div class="grid gap-3">
      <div class="text-description text-sm font-semibold">
        Randomize theme
      </div>

      <div class="flex flex-wrap gap-y-2 gap-x-8">
        <WButton
          :semantic-type="isRandomTheme ? SemanticType.PRIMARY : SemanticType.SECONDARY"
          @click="setRandomTheme"
        >
          <IconRefresh class="square-[1em]" /> Randomize Theme
        </WButton>

        <WButtonGroup
          :model-value="randomStyle"
          :list="RANDOM_STYLES.map(style => style.id)"
          :semantic-type="SemanticType.SECONDARY"
          no-margin
          @update:model-value="randomStyle = $event"
        >
          <template #option="{option}">
            {{ RANDOM_STYLES.find(style => style.id === option)?.name }}
          </template>
        </WButtonGroup>
      </div>

      <div class="grid max-w-md gap-1">
        <div class="text-sm font-semibold">
          Primary hue
        </div>

        <WSliderRange
          :model-value="randomHues"
          :min="FULL_HUE_RANGE.from"
          :max="FULL_HUE_RANGE.to"
          :step="5"
          :style="hueSliderStyle"
          @update-eager:model-value="randomHuesEager = $event"
          @update:model-value="randomHues = $event"
        >
          <template #right>
            <span class="text-description w-20 self-center text-right text-sm tabular-nums">
              {{ hueRangeText }}
            </span>
          </template>
        </WSliderRange>

        <div class="text-description text-xs">
          Randomize takes the primary from these hues; status tones keep away from it.
        </div>
      </div>
    </div>

    <div class="grid gap-3">
      <div class="text-description text-sm font-semibold">
        Ask an AI assistant
      </div>

      <WInput
        :model-value="description"
        placeholder="Calm fintech: deep teal, soft corners, compact"
        description="Describe the look. The prompt explains the tokens and their contrast limits, includes the theme you have now, and asks for the result as JSON and as a link to this page."
        allow-clear
        @update:model-value="description = $event ?? ''"
      />

      <div class="flex flex-wrap gap-2">
        <WButton
          :semantic-type="SemanticType.PRIMARY"
          tag="a"
          :href="claudeUrl"
          target="_blank"
          rel="noopener"
        >
          Open in Claude
        </WButton>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          tag="a"
          :href="chatGptUrl"
          target="_blank"
          rel="noopener"
        >
          Open in ChatGPT
        </WButton>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="copyPrompt.doCopy"
        >
          {{ copyPrompt.copied.value ? 'Copied' : 'Copy prompt' }}
        </WButton>
      </div>

      <WInput
        :model-value="reply"
        placeholder="{&quot;color-primary&quot;: &quot;oklch(50% 0.09 195)&quot;, …}"
        description="Paste the assistant's JSON, its link or the whole reply, and apply it."
        :error-message="replyError"
        textarea
        allow-clear
        @update:model-value="reply = $event ?? ''"
      />

      <div>
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          :disabled="!reply.trim()"
          @click="applyReply"
        >
          Apply
        </WButton>
      </div>
    </div>

    <WUniform
      ref="form"
      :model-value="formSource"
      :init-data="toFormModel"
      :api-method="applyForm"
      full-payload
      async
    >
      <template #default="scope">
        <div
          v-for="group in groups"
          :key="group.name"
          class="grid gap-3"
        >
          <div class="text-description text-sm font-semibold">
            {{ group.name }}
          </div>

          <ThemePlaygroundFields
            :tokens="group.tokens"
            :base-tokens="baseTokens"
            :scope="scope"
          />
        </div>

        <details
          v-for="group in advancedGroups"
          :key="group.name"
          class="grid gap-3"
        >
          <summary class="text-description cursor-pointer text-sm font-semibold">
            {{ group.name }}
          </summary>

          <p class="text-description my-3 text-sm">
            {{ group.description }}
          </p>

          <ThemePlaygroundFields
            :tokens="group.tokens"
            :base-tokens="baseTokens"
            :scope="scope"
          />
        </details>
      </template>
    </WUniform>
  </div>
</template>

<script lang="ts" setup>
import {computed, defineAsyncComponent, markRaw, nextTick, ref, shallowRef, toRaw, useTemplateRef, watch} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {useCopy} from 'eco-vue-js/dist/utils/useCopy'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WSliderRange from 'eco-vue-js/dist/components/Slider/WSliderRange.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import IconCancel from 'eco-vue-js/dist/assets/icons/IconCancel'
import IconCodeInline from 'eco-vue-js/dist/assets/icons/IconCodeInline'
import IconCopy from 'eco-vue-js/dist/assets/icons/IconCopy'
import IconEditCircle from 'eco-vue-js/dist/assets/icons/IconEditCircle'
import IconLink from 'eco-vue-js/dist/assets/icons/IconLink'
import IconRefresh from 'eco-vue-js/dist/assets/icons/IconRefresh'
import IconSave from 'eco-vue-js/dist/assets/icons/IconSave'
import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'
import IconUndo from 'eco-vue-js/dist/assets/icons/IconUndo'

import ThemePlaygroundFields from './ThemePlaygroundFields.vue'
import ThemeSwatch from './ThemeSwatch.vue'

import {
  ADVANCED_GROUPS,
  DEFAULT_TOKENS,
  FULL_HUE_RANGE,
  type HueRange,
  PRESETS,
  RANDOM_STYLES,
  type SavedTheme,
  TOKENS,
  type ThemeConfig,
  type ThemeFormModel,
  type ThemeTokens,
  activeTheme,
  activeThemeId,
  deleteTheme,
  duplicateTheme,
  findPreset,
  getHueGradient,
  getHueSwatch,
  getThemeCss,
  getThemeLink,
  getThemePrompt,
  hasCustomTokens,
  isFullHueRange,
  isRandomTheme,
  loadTheme,
  parseThemeReply,
  randomHues,
  randomStyle,
  renameTheme,
  resetTheme,
  savedThemes,
  selectTheme,
  setPreset,
  setRandomTheme,
  setTokens,
  themeConfig,
  themeTokens,
  toFormModel,
} from '../docsTheme'
import {confirmDeleteAllThemes, openSaveTheme} from '../themeConfirm'

const ThemeNameModal = defineAsyncComponent(() => import('./ThemeNameModal.vue'))

const allGroups = [...new Set(TOKENS.map(token => token.group))].map(name => ({name, description: ADVANCED_GROUPS[name], tokens: TOKENS.filter(token => token.group === name)}))

const groups = allGroups.filter(group => !group.description)

const advancedGroups = allGroups.filter(group => group.description)

const activePreset = computed(() => themeConfig.value.preset ?? 'default')

const currentName = computed(() => {
  if (activeTheme.value) return activeTheme.value.name
  if (isRandomTheme.value) return 'Random theme'

  const preset = findPreset(activePreset.value)?.name

  return hasCustomTokens.value ? `Custom over ${ preset }` : preset
})

const form = useTemplateRef('form')

/** The theme the form starts from. It keeps what is typed, invalid values too; only the valid ones reach the theme. */
const formSource = shallowRef<ThemeConfig>(toRaw(themeConfig.value))

let appliedConfig: ThemeConfig | undefined

const applyForm = (model: Partial<ThemeFormModel>) => {
  appliedConfig = setTokens(model as ThemeFormModel)
}

// Another theme opened: the form starts over from it, and the errors of the one before are cleared.
watch(themeConfig, config => {
  if (toRaw(config) === appliedConfig) return

  formSource.value = toRaw(config)
  nextTick(() => form.value?.validate(true))
})

// What an empty field falls back to: the preset's value, or the site's.
const baseTokens = computed(() => ({...DEFAULT_TOKENS, ...findPreset(activePreset.value)?.tokens as ThemeTokens}))

const css = computed(() => getThemeCss(themeTokens.value))

const copyLink = useCopy(() => getThemeLink(themeConfig.value, undefined, activeTheme.value?.name))
const copyCss = useCopy(css)

// The range under the pointer while dragging; the picked one takes over once it ends.
const randomHuesEager = ref<HueRange>()

watch(randomHues, () => randomHuesEager.value = undefined)

const shownHues = computed(() => randomHuesEager.value ?? randomHues.value)

// The track shows every hue faded and the picked ones in full, in the colors the style makes.
const hueSliderStyle = computed(() => ({
  '--w-slider-track': getHueGradient(randomStyle.value, FULL_HUE_RANGE, 0.15),
  '--w-slider-fill': getHueGradient(randomStyle.value, shownHues.value),
  '--w-slider-from': getHueSwatch(randomStyle.value, shownHues.value.from),
  '--w-slider-to': getHueSwatch(randomStyle.value, shownHues.value.to),
}))

const hueRangeText = computed(() => isFullHueRange(shownHues.value) ? 'Any' : `${ shownHues.value.from % 360 }°–${ shownHues.value.to % 360 }°`)

const description = ref('')

const prompt = computed(() => getThemePrompt(description.value, themeConfig.value))

const claudeUrl = computed(() => `https://claude.ai/new?q=${ encodeURIComponent(prompt.value) }`)

const chatGptUrl = computed(() => `https://chatgpt.com/?q=${ encodeURIComponent(prompt.value) }`)

const copyPrompt = useCopy(prompt)

const reply = ref('')

const replyError = ref<string>()

const applyReply = () => {
  const config = parseThemeReply(reply.value)

  if (!config) {
    replyError.value = 'No theme found: expected a JSON object of tokens or a link with ?theme='
    return
  }

  loadTheme(config)
  reply.value = ''
  replyError.value = undefined
}

const openRename = (theme: SavedTheme) => {
  Modal.add(markRaw(ThemeNameModal), {
    title: 'Rename theme',
    name: theme.name,
    themeId: theme.id,
    onSave: (name: string) => renameTheme(theme.id, name),
  })
}

const confirmDelete = (theme: SavedTheme) => {
  Modal.addConfirm({
    title: `Delete “${ theme.name }”?`,
    description: 'The site keeps showing it until you pick another theme, but it is no longer saved.',
    acceptText: 'Delete',
    acceptSemanticType: SemanticType.NEGATIVE,
    onAccept: () => deleteTheme(theme.id),
  })
}
</script>
