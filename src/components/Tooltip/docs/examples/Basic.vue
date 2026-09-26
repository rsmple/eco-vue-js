<template>
  <div class="flex flex-wrap items-center gap-6">
    <span class="cursor-help underline decoration-dotted">
      SLA
      <WTooltip text="Service level agreement: fix critical issues within 24 hours." />
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
          <b>Last scan</b>
          <span>12 findings · 3 critical</span>
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
      A title too long to fit in its column
      <WTooltip
        text="A title too long to fit in its column"
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
