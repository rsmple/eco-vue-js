<template>
  <div class="flex flex-wrap items-center gap-6">
    <span class="cursor-help underline decoration-dotted">
      Hardy
      <WTooltip text="Survives winters outdoors down to −15 °C." />
    </span>

    <span class="cursor-help underline decoration-dotted">
      On the right
      <WTooltip
        text="Placed to the right of its element."
        right
      />
    </span>

    <span class="cursor-help underline decoration-dotted">
      Rich content
      <WTooltip>
        <div class="grid gap-1">
          <b>Last watered</b>
          <span>2 days ago · 250 ml</span>
        </div>
      </WTooltip>
    </span>

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      tooltip-text="Buttons take the text as a prop."
    >
      Button
    </WButton>

    <span class="w-40 truncate">
      Monstera deliciosa 'Thai Constellation'
      <WTooltip
        text="Monstera deliciosa 'Thai Constellation'"
        overflow-only
      />
    </span>
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WTooltip from 'eco-vue-js/dist/components/Tooltip/WTooltip.vue'
</script>
