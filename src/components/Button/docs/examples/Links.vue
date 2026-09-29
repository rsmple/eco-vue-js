<template>
  <div class="grid gap-6">
    <p class="max-w-xl leading-relaxed">
      The scanner reports each finding with a
      <WLink
        href="https://cwe.mitre.org/data/definitions/79.html"
        text="CWE-79"
        target="_blank"
        rel="noopener"
      />
      reference. The
      <WLink
        href="https://owasp.org/www-project-top-ten/"
        target="_blank"
        rel="noopener"
        :semantic-type="SemanticType.INFO"
        :icon="markRaw(IconArchiveBook)"
      >
        OWASP guide
      </WLink>
      explains how to fix it.
    </p>

    <div class="flex items-center gap-2">
      <code class="rounded-lg bg-gray-100 px-2 py-1 dark:bg-gray-800">{{ token }}</code>

      <WButtonCopy :value="token" />
    </div>

    <div class="flex max-w-md items-center gap-2">
      <WInput
        v-model="search"
        placeholder="Repository"
        class="flex-1"
        no-margin
      />

      <WButtonInput
        :icon="markRaw(IconRefresh)"
        tooltip-text="Sync repositories"
        :loading="syncing"
        @click="sync"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButtonCopy from 'eco-vue-js/dist/components/Button/WButtonCopy.vue'
import WButtonInput from 'eco-vue-js/dist/components/Button/WButtonInput.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WLink from 'eco-vue-js/dist/components/Link/WLink.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
import IconRefresh from 'eco-vue-js/dist/assets/icons/IconRefresh'

const token = 'wsp_4f9c2e1a7b'
const search = ref<string>()
const syncing = ref(false)

const sync = () => {
  syncing.value = true
  setTimeout(() => syncing.value = false, 1500)
}
</script>
