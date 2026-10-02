<template>
  <WModalWrapper>
    <template #title>
      {{ title }}
    </template>

    <WUniform
      ref="form"
      :init-data="initData"
      :api-method="save"
      full-payload
      tag="div"
      class="sm-not:px---inner-margin"
      @success="$emit('close:modal')"
    >
      <template #default="scope">
        <WUniform
          v-bind="scope"
          field="name"
          title="Name"
          :validate="validateName"
          required
        >
          <template #field="scopeField">
            <WInput
              v-bind="scopeField"
              :autofocus="300"
              @update:model-value="name = $event ?? ''"
              @keypress:enter="scope.submit?.()"
            />
          </template>
        </WUniform>
      </template>
    </WUniform>

    <div
      v-if="share"
      class="sm-not:px---inner-margin mt-6 grid grid-cols-2 gap-3 w-button-h-8"
    >
      <div>
        <div class="text-xs text-description mb-2">
          Copy a link to this theme:
        </div>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="copyLink.doCopy"
        >
          {{ copyLink.copied.value ? 'Copied' : 'Copy link' }} <IconLink class="square-[1em]" />
        </WButton>
      </div>

      <div>
        <div class="text-xs text-description mb-2">
          Copy the resulting CSS:
        </div>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="copyCss.doCopy"
        >
          {{ copyCss.copied.value ? 'Copied' : 'Copy CSS' }} <IconCodeInline class="square-[1em]" />
        </WButton>
      </div>

      <p class="text-description col-span-2 text-xs">
        Your themes are available on the <a
          :href="withBase('/guide/theming')"
          target="_blank"
          rel="noopener"
          class="tone-primary text-tone hover:underline"
        >Theming page</a>, with every token to adjust.
      </p>
    </div>

    <template #actions>
      <WButton
        outline
        class="w-full"
        @click="$emit('close:modal')"
      >
        Cancel
      </WButton>

      <WButton
        class="w-full"
        @click="form?.submit?.()"
      >
        Save
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import {withBase} from 'vitepress'
import {ref, useTemplateRef} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {useCopy} from 'eco-vue-js/dist/utils/useCopy'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import IconCodeInline from 'eco-vue-js/dist/assets/icons/IconCodeInline'
import IconLink from 'eco-vue-js/dist/assets/icons/IconLink'

import {getThemeCss, getThemeLink, isThemeNameTaken, themeConfig, themeTokens} from '../docsTheme'

const props = defineProps<{
  title: string
  name: string
  /** The theme being renamed, so its own name doesn't count as taken. */
  themeId?: string
  /** Shows Copy link and Copy CSS for the theme in use, the link carrying the name typed. */
  share?: boolean
  onSave: (name: string) => void
}>()

defineEmits<{
  (e: 'close:modal'): void
}>()

type Model = {name: string}

const form = useTemplateRef('form')

const name = ref(props.name)

const copyLink = useCopy(() => getThemeLink(themeConfig.value, undefined, name.value.trim() || props.name))
const copyCss = useCopy(() => getThemeCss(themeTokens.value))

const initData = (): Model => ({name: props.name})

const validateName = (value: unknown) => typeof value === 'string' && isThemeNameTaken(value, props.themeId) ? 'A theme with this name exists' : undefined

const save = (payload: Partial<Model>) => {
  props.onSave(payload.name?.trim() ?? props.name)
}
</script>
