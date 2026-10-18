<template>
  <div class="vp-raw grid gap-4 md:grid-cols-3">
    <div
      v-for="layout in LAYOUTS"
      :key="layout.id"
      class="grid gap-2"
    >
      <div class="text-sm font-semibold">
        {{ layout.name }}
      </div>

      <div
        class="border-line-subtle grid gap-3 overflow-hidden rounded-xl border border-solid bg-(--w-canvas) bg-(image:--w-canvas-image) p-(--w-chrome-gap) [--inner-margin:0.75rem]"
        :style="getLayoutStyle(layout.id)"
      >
        <div class="bg-chrome text-accent shadow-(--w-chrome-shadow) flex h-9 items-center rounded-(--w-chrome-rounded) border-(length:--w-chrome-border) border-solid border-line-subtle px-3 text-sm font-semibold backdrop-(--w-chrome-backdrop)">
          Greenhouse
        </div>

        <div class="text-accent text-base font-semibold">
          Beds
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="stat in STATS"
            :key="stat.title"
            class="surface-card grid gap-0.5"
          >
            <span class="text-description text-xs">{{ stat.title }}</span>
            <span class="text-accent text-lg font-semibold">{{ stat.value }}</span>
          </div>
        </div>

        <div class="surface-section grid gap-1 text-sm">
          <div
            v-for="bed in BEDS"
            :key="bed.name"
            class="flex justify-between gap-2"
          >
            <span class="text-accent">{{ bed.name }}</span>
            <span class="text-description">{{ bed.plants }} plants</span>
          </div>
        </div>
      </div>

      <div class="text-description text-xs">
        {{ layout.look }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {LAYOUTS, type LayoutId, expandTokens} from '../../themePresets'

const STATS = [
  {title: 'Plants', value: 128},
  {title: 'Dry', value: 2},
]

const BEDS = [
  {name: 'North bed', plants: 34},
  {name: 'South bed', plants: 21},
  {name: 'Greenhouse', plants: 18},
]

/**
 * A layout's tokens on the box instead of the page. The page derives `--w-canvas`, the card base and the subtle line
 * from roles on `:root`; the box sets them from the layout's roles directly.
 */
const getLayoutStyle = (id: LayoutId) => {
  const tokens = Object.fromEntries(expandTokens({layout: id}))
  const mode = (key: string, fallback: string) => `light-dark(${ tokens[key] ?? `var(--${ fallback })` }, ${ tokens[key + '-dark'] ?? `var(--${ fallback }-dark)` })`

  return {
    ...Object.fromEntries(Object.entries(tokens).filter(([key]) => key.startsWith('w-')).map(([key, value]) => [`--${ key }`, value])),
    '--w-canvas': mode('role-canvas', 'role-surface'),
    '--w-card-base': mode('role-card', 'role-surface-subtle'),
    '--w-line-subtle': mode('role-line-subtle', 'role-line-subtle'),
    '--w-page-bleed': '0px',
    '--w-chrome-gap': tokens['w-chrome-gap'] ?? '0.75rem',
  }
}
</script>
