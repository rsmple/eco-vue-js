<template>
  <div class="vp-raw grid gap-4 md:grid-cols-3">
    <div
      v-for="layout in LAYOUTS"
      :key="layout.id"
      class="grid gap-2 md:row-span-3 md:grid-rows-subgrid"
    >
      <div class="text-sm font-semibold">
        {{ layout.name }}
      </div>

      <div
        class="surface-root border-line-subtle grid content-start gap-3 overflow-hidden rounded-xl border border-solid bg-(--w-canvas) bg-(image:--w-canvas-image) p-(--w-chrome-gap) [--inner-margin:0.75rem]"
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
import rolesCss from '../../../../package/tailwind-base/css/roles.css?raw'
import surfacesCss from '../../../../package/tailwind-base/css/surfaces.css?raw'
import {LAYOUTS, LAYOUT_TOKENS, type LayoutId, expandTokens} from '../../themePresets'

const STATS = [
  {title: 'Plants', value: 128},
  {title: 'Dry', value: 2},
]

const BEDS = [
  {name: 'North bed', plants: 34},
  {name: 'South bed', plants: 21},
  {name: 'Greenhouse', plants: 18},
]

/** The kit's own value of each variable: its first declaration, the `:root` default rather than a utility's re-map. */
const KIT_VALUES: Record<string, string> = {}

for (const [, key, value] of (rolesCss + surfacesCss).matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)) KIT_VALUES[key] ??= value.trim()

/** Every token some layout sets: the page has them from the layout in use, so each box sets them all. */
const LAYOUT_KEYS = [...new Set(Object.values(LAYOUT_TOKENS).flatMap(tokens => Object.keys(tokens)))]

/**
 * A layout's tokens on the box instead of the page, over the kit's defaults for the ones it leaves, so the box doesn't
 * show the page's layout through them. The page derives `--w-canvas`, the card base and the subtle line from roles on
 * `:root`; the box sets them from the layout's roles directly.
 */
const getLayoutStyle = (id: LayoutId) => {
  const tokens: Record<string, string> = {
    ...Object.fromEntries(LAYOUT_KEYS.map(key => [key, KIT_VALUES[key] ?? 'initial'])),
    ...Object.fromEntries(expandTokens({layout: id})),
  }
  // A role a layout sets, such as card's lifted dark surface, is read from the layout or the kit, not from `:root`.
  const resolve = (value: string): string => {
    const next = value.replace(/var\(--(role-[\w-]+)\)/g, (match, key: string) => LAYOUT_KEYS.includes(key) ? tokens[key] : match)

    return next === value ? value : resolve(next)
  }
  const mode = (role: string) => `light-dark(${ resolve(`var(--${ role })`) }, ${ resolve(`var(--${ role }-dark)`) })`

  return {
    ...Object.fromEntries(Object.entries(tokens).filter(([key]) => key.startsWith('w-')).map(([key, value]) => [`--${ key }`, value])),
    '--w-canvas': mode('role-canvas'),
    '--w-section-base': mode('role-surface'),
    '--w-chrome-base': mode('role-surface'),
    '--w-card-base': mode('role-card'),
    '--w-line-subtle': mode('role-line-subtle'),
    '--w-page-bleed': '0px',
    '--w-chrome-gap': tokens['w-chrome-gap'] === '0px' ? '0.75rem' : tokens['w-chrome-gap'],
  }
}
</script>
