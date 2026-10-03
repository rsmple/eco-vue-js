<template>
  <div class="grid gap-6">
    <p class="max-w-xl leading-relaxed">
      Each plant links to its
      <WLink
        href="https://en.wikipedia.org/wiki/Monstera_deliciosa"
        text="Monstera deliciosa"
        target="_blank"
        rel="noopener"
      />
      article. The
      <WLink
        href="https://www.rhs.org.uk/plants"
        target="_blank"
        rel="noopener"
        :semantic-type="SemanticType.INFO"
        :icon="markRaw(IconArchiveBook)"
      >
        RHS plant guide
      </WLink>
      explains how to care for it.
    </p>

    <div class="flex items-center gap-2">
      <code class="rounded-lg bg-surface-muted px-2 py-1">{{ token }}</code>

      <WButtonCopy :value="token" />
    </div>

    <div class="flex max-w-md items-center gap-2">
      <WInput
        v-model="search"
        placeholder="Sensor"
        class="flex-1"
        no-margin
      />

      <WButtonInput
        :icon="markRaw(IconRefresh)"
        tooltip-text="Sync sensors"
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

const token = 'gh2_4f9c2e1a7b'
const search = ref<string>()
const syncing = ref(false)

const sync = () => {
  syncing.value = true
  setTimeout(() => syncing.value = false, 1500)
}
</script>
