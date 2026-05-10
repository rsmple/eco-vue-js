<template>
  <WMenuItem @click="doCopy">
    <div class="min-w-20 flex-1 text-start">
      Copy as Markdown
    </div>

    <component
      :is="copied ? IconCopySuccess : IconMarkdown"
      class="square-[1.25em]"
    />
  </WMenuItem>
</template>

<script lang="ts" setup generic="Data">
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import IconCopySuccess from '@/assets/icons/IconCopySuccess.svg?component'
import IconMarkdown from '@/assets/icons/IconMarkdown.svg?component'

import {useCopy} from '@/utils/useCopy'

const props = defineProps<{
  item: Data
  index: number
  toMarkdown: (item: Data, index: number) => string
}>()

const {copied, doCopy} = useCopy(() => props.toMarkdown(props.item, props.index))
</script>
