<template>
  <div class="vp-raw grid gap-4 rounded-xl border border-line-subtle p-6">
    <div class="flex flex-wrap gap-2">
      <span
        v-for="(tone, hue) in TONES"
        :key="hue"
        :class="tone"
        class="surface-fill rounded-lg px-2 py-1 text-sm font-semibold"
      >
        {{ hue }}
      </span>
    </div>

    <div class="flex flex-wrap gap-2">
      <span
        v-for="(tone, hue) in TONES"
        :key="hue"
        :class="tone"
        class="surface-soft text-tone rounded-lg px-2 py-1 text-sm font-semibold"
      >
        {{ hue }}
      </span>
    </div>

    <div class="from-gradient-start via-gradient-middle to-gradient-end h-3 rounded-full bg-linear-to-r" />
  </div>
</template>

<script lang="ts" setup>
/** The kit's data palette as fills and as soft chips with tone text, and the gradient roles. */
// Written out: Tailwind finds classes by scanning the source, so they can't be built from the hue.
const TONES = {
  red: 'tone-data-red',
  orange: 'tone-data-orange',
  amber: 'tone-data-amber',
  green: 'tone-data-green',
  teal: 'tone-data-teal',
  cyan: 'tone-data-cyan',
  blue: 'tone-data-blue',
  violet: 'tone-data-violet',
  fuchsia: 'tone-data-fuchsia',
  pink: 'tone-data-pink',
  gray: 'tone-data-gray',
}
</script>
