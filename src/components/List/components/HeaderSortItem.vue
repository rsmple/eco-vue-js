<template>
  <WMenuItem
    :disabled="disabled"
    @click="setOrdering"
  >
    <div class="flex-1 truncate text-base font-normal">
      {{ title }}
    </div>

    <div class="ml-auto flex w-8 items-center justify-between">
      <Transition
        enter-active-class="transition-opacity"
        leave-active-class="transition-opacity"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <IconBack
          v-if="index !== -1"
          class="square-4 transition-transform"
          :class="{
            'rotate-90': ordering[index]?.order === 'ASC',
            '-rotate-90': ordering[index]?.order === 'DESC'
          }"
        />
      </Transition>

      <Transition
        enter-active-class="transition-opacity"
        leave-active-class="transition-opacity"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="index !== -1 && ordering.length > 1"
          class="text-base font-semibold"
        >
          {{ index + 1 }}
        </div>
      </Transition>
    </div>
  </WMenuItem>
</template>

<script lang="ts" setup generic="Data extends DefaultData">
import {toRef} from 'vue'

import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import IconBack from '@/assets/icons/default/IconBack.svg?component'

import {type OrderItem} from '@/utils/order'

import {useOrdering} from '../use/useOrdering'

const props = defineProps<{
  ordering: OrderItem<keyof Data>[]
  field: keyof Data
  title: string
  disabled?: boolean
}>()

const {index, setOrdering} = useOrdering(toRef(props, 'ordering'), toRef(props, 'field'))
</script>
