<template>
  <button
    ref="button"
    class="relative flex rounded-lg p-2 transition-colors"
    :class="isOpen ? 'tone-primary text-tone' : 'text-description hover:text-accent'"
    aria-label="Notifications"
    :aria-expanded="isOpen"
    @click="buttonRef && toggle(buttonRef)"
  >
    <IconNotification
      class="square-5"
      :class="{'animate-pulse': notifyCenterPendingCount !== 0}"
    />

    <WCounter
      v-show="notifyCenterActionCount > 0"
      class="absolute right-0 top-0 text-xs"
      :count="notifyCenterActionCount"
      :trigger="1"
    />
  </button>
</template>

<script lang="ts" setup>
import {useTemplateRef} from 'vue'

import {notifyCenterActionCount, notifyCenterPendingCount, useNotifyCenter} from 'eco-vue-js/dist/utils/NotifyCenter'

import WCounter from 'eco-vue-js/dist/components/Counter/WCounter.vue'

import IconNotification from 'eco-vue-js/dist/assets/icons/IconNotification'

const buttonRef = useTemplateRef('button')

const {isOpen, toggle} = useNotifyCenter()
</script>
