<template>
  <div class="vp-raw grid gap-3 rounded-xl border border-solid border-line-subtle p-4">
    <div
      class="
        border-line-subtle bg-surface-subtle mx-auto grid aspect-16/10
        w-full max-w-md grid-rows-[1fr_auto] grid-cols-3 gap-4
        rounded-lg border border-solid p-4
      "
    >
      <button
        v-for="option in options"
        :key="option.value"
        class="h-5 cursor-pointer rounded-md border border-solid"
        :class="[
          option.class,
          notifyPosition === option.value
            ? 'tone-primary bg-tone-fill border-tone-fill'
            : 'border-line-subtle bg-surface-raised hover:border-tone-line tone-primary',
        ]"
        :aria-label="option.label"
        :aria-pressed="notifyPosition === option.value"
        @click="select(option)"
      />
    </div>

    <div class="text-description text-center text-sm">
      Click a spot to move the toasts there.
    </div>

    <code class="justify-self-center text-sm">&lt;WNotify position="{{ notifyPosition }}" /&gt;</code>
  </div>
</template>

<script lang="ts" setup>
import type {NotifyPosition} from 'eco-vue-js/dist/components/Notify/types'
import {Notify} from 'eco-vue-js/dist/utils/Notify'

import {notifyPosition} from '../notifyPosition'

type Option = {value: NotifyPosition, label: string, class: string}

const options: Option[] = [
  {value: 'top-center', label: 'Top center', class: 'col-start-2 row-start-1'},
  {value: 'top-right', label: 'Top right', class: 'col-start-3 row-start-1'},
  {value: 'bottom-center', label: 'Bottom center', class: 'col-start-2 row-start-2'},
  {value: 'bottom-right', label: 'Bottom right', class: 'col-start-3 row-start-2'},
]

const select = (option: Option) => {
  notifyPosition.value = option.value

  Notify.success({title: `Toasts at ${ option.label.toLowerCase() }`, caption: `position="${ option.value }"`})
}
</script>
