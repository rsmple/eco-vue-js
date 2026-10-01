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

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="setRandomTheme"
        >
          Random
        </WButton>
      </div>

      <p
        v-if="hasCustomTokens"
        class="text-description text-sm"
      >
        Custom values over {{ findPreset(activePreset)?.name }}. Picking a preset drops them.
      </p>
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
      />
    </details>

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

      <pre class="overflow-auto rounded-xl bg-surface-muted p-4 font-mono text-sm">{{ css }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {useCopy} from 'eco-vue-js/dist/utils/useCopy'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

import ThemePlaygroundFields from './ThemePlaygroundFields.vue'

import {
  ADVANCED_GROUPS,
  DEFAULT_TOKENS,
  PRESETS,
  TOKENS,
  type ThemeTokens,
  findPreset,
  getThemeCss,
  getThemeLink,
  getThemePrompt,
  hasCustomTokens,
  parseThemeReply,
  resetTheme,
  setPreset,
  setRandomTheme,
  themeConfig,
  themeTokens,
} from '../docsTheme'

const allGroups = [...new Set(TOKENS.map(token => token.group))].map(name => ({name, description: ADVANCED_GROUPS[name], tokens: TOKENS.filter(token => token.group === name)}))

const groups = allGroups.filter(group => !group.description)

const advancedGroups = allGroups.filter(group => group.description)

const activePreset = computed(() => themeConfig.value.preset ?? 'default')

// What an empty field falls back to: the preset's value, or the site's.
const baseTokens = computed(() => ({...DEFAULT_TOKENS, ...findPreset(activePreset.value)?.tokens as ThemeTokens}))

const css = computed(() => getThemeCss(themeTokens.value))

const copyLink = useCopy(() => getThemeLink(themeConfig.value))
const copyCss = useCopy(css)

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

  themeConfig.value = config
  reply.value = ''
  replyError.value = undefined
}
</script>
