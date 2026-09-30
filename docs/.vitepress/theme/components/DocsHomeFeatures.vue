<template>
  <section class="px-(--inner-margin) pb-20 sm:pb-28">
    <p class="text-accent text-sm font-semibold tracking-[0.2em] uppercase">
      What's inside
    </p>

    <h2 class="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
      Building blocks for data-heavy Vue apps
    </h2>

    <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <a
        v-for="feature in FEATURES"
        :key="feature.title"
        :href="withBase(feature.link)"
        :target="feature.external ? '_blank' : undefined"
        :rel="feature.external ? 'noopener' : undefined"
        class="docs-home-feature group flex flex-col gap-3 rounded-2xl p-6 transition-[border-color,box-shadow,translate] hover:-translate-y-0.5"
      >
        <span class="bg-primary-light dark:bg-primary-darkest text-accent grid size-10 place-items-center rounded-xl">
          <component
            :is="feature.icon"
            class="square-5"
          />
        </span>

        <span class="font-semibold">{{ feature.title }}</span>

        <span class="text-description text-sm leading-relaxed">{{ feature.details }}</span>

        <span class="text-description group-hover:text-accent group-focus-visible:text-accent mt-auto pt-1 text-sm font-medium transition-colors">
          {{ feature.action }} →
        </span>
      </a>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {withBase} from 'vitepress'
import {markRaw} from 'vue'

import IconEditSquare from 'eco-vue-js/dist/assets/icons/IconEditSquare'
import IconElement from 'eco-vue-js/dist/assets/icons/IconElement'
import IconLayer from 'eco-vue-js/dist/assets/icons/IconLayer'
import IconMarkdown from 'eco-vue-js/dist/assets/icons/IconMarkdown'
import IconSettings from 'eco-vue-js/dist/assets/icons/IconSettings'
import IconTable from 'eco-vue-js/dist/assets/icons/IconTable'

const FEATURES = [
  {
    icon: markRaw(IconTable),
    title: 'Lists that page themselves',
    details: 'WList turns a paginated query into a table on desktop and cards on mobile — with sorting, selection, bulk actions and column settings built in.',
    action: 'List',
    link: '/components/list',
  },
  {
    icon: markRaw(IconEditSquare),
    title: 'Forms from one component',
    details: 'Nested WUniform fields validate, save only what changed and auto-save, and every kit control takes a field\'s scope as it is.',
    action: 'Form',
    link: '/components/form',
  },
  {
    icon: markRaw(IconLayer),
    title: 'A data layer on vue-query',
    details: 'Declare a model\'s queries and actions once; every cached copy of an item stays in sync, and list filters live in the URL.',
    action: 'Data layer',
    link: '/guide/data-layer',
  },
  {
    icon: markRaw(IconElement),
    title: 'An app shell included',
    details: 'Header, nav and actions bars described by a few CSS variables that sticky headers, dropdowns and modals all read. This site runs on it.',
    action: 'App shell',
    link: '/guide/app-shell',
  },
  {
    icon: markRaw(IconSettings),
    title: 'Styled with Tailwind v4',
    details: 'The kit ships Tailwind classes, not compiled CSS: one import adds its tokens and variants, and dark mode follows a dark class on the page.',
    action: 'Styles',
    link: '/guide/getting-started#styles',
  },
  {
    icon: markRaw(IconMarkdown),
    title: 'Docs typed from the source',
    details: 'API tables are generated from each component\'s props, emits and slots, and every page is served as Markdown for LLMs in llms.txt.',
    action: 'llms.txt',
    link: '/llms.txt',
    external: true,
  },
]
</script>

<style scoped>
.docs-home-feature {
  border: 1px solid var(--color-gray-200);
  background: var(--color-gray-50);

  &:hover,
  &:focus-visible {
    border-color: color-mix(in oklab, var(--color-primary) 60%, transparent);
    box-shadow: 0 1rem 2rem -1rem color-mix(in oklab, var(--color-primary-dark) 35%, transparent);
  }
}

.dark .docs-home-feature {
  border-color: var(--color-gray-800);
  background: var(--color-gray-850);
}
</style>
