<template>
  <component :is="part.render" />
</template>

<script lang="ts" setup>
import {getCurrentInstance} from 'vue'

import {type OverlayPart, setInstanceProvides} from '../models/overlayRegistry'

const props = defineProps<{
  part: OverlayPart
}>()

if (props.part.provides) setInstanceProvides(getCurrentInstance(), props.part.provides)
</script>
