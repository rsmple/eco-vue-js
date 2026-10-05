<template>
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
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WLink from 'eco-vue-js/dist/components/Link/WLink.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
</script>
