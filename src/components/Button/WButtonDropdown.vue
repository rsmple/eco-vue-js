<template>
  <WDropdownMenu 
    :is-open="isOpen"
    :max-height="contentMaxHeight ?? 200"
    :max-width="contentMaxWidth ?? 320"
    :horizontal-align="horizontalAlign ?? HorizontalAlign.LEFT_INNER"
    update-align
    :teleport="teleport"
  >
    <template #toggle>
      <div class="flex">
        <component
          :is="item"
          v-for="(item, index) in $slots.button?.()"
          :key="index"
          join
          class="flex-1"
        />

        <WButton
          :semantic-type="semanticType"
          :disabled="disabled"
          join
          @click="isOpen = !isOpen"
        >
          <IconArrow
            class="square-4 transition-transform"
            :class="{'rotate-180': isOpen}"
          />
        </WButton>
      </div>
    </template>

    <template #content>
      <WClickOutside
        class="
          bg-default dark:bg-default-dark w-full rounded-xl max-h-[inherit] shadow-md
          overflow-x-hidden overflow-y-overlay overscroll-contain my-1 dark:border dark:border-solid dark:border-gray-800
        "
        @click="close"
      >
        <slot
          name="content"
          :close="close"
        />
      </WClickOutside>
    </template>
  </WDropdownMenu>
</template>

<script lang="ts" setup>
import {HorizontalAlign, type SemanticType} from '@/main'
import WButton from './WButton.vue'
import IconArrow from '@/assets/icons/default/IconArrow.svg?component'
import {ref} from 'vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'

defineProps<{
  semanticType?: SemanticType
  contentMaxHeight?: number
  contentMaxWidth?: number
  horizontalAlign?: HorizontalAlign
  disabled?: boolean
  teleport?: boolean
}>()

const isOpen = ref(false)

const close = () => {
  isOpen.value = false
}

</script>