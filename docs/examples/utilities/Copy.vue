<template>
  <div class="flex max-w-md items-end gap-2">
    <WInput
      v-model="code"
      title="Invite code"
      no-margin
      class="flex-1"
    />

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      :aria-label="copied ? 'Copied' : 'Copy'"
      @click="doCopy"
    >
      <component
        :is="iconCopy"
        class="square-5"
      />
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {useCopy} from 'eco-vue-js/dist/utils/useCopy'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

const code = ref<string | undefined>('GREEN-THUMB-2026')

const {copied, iconCopy, doCopy} = useCopy(code)
</script>
