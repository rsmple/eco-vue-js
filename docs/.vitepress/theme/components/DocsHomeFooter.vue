<template>
  <footer class="mx-(--inner-margin) border-t border-line-subtle py-12 text-sm">
    <div class="grid grid-cols-3 gap-10 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
      <div class="col-span-3 grid content-start gap-3 md:col-span-1">
        <a
          :href="withBase('/')"
          class="inline-flex items-center gap-2.5"
        >
          <IconLogo class="size-7 tone-primary text-tone-fill" />

          <span class="text-accent text-lg font-semibold tracking-tight">EcoVue</span>
        </a>

        <p class="text-description max-w-xs leading-relaxed">
          Vue 3 UI kit on Tailwind v4, with a shared eslint config for the apps that use it.
        </p>
      </div>

      <nav
        v-for="column in COLUMNS"
        :key="column.title"
        :aria-label="column.title"
        class="grid content-start gap-2.5"
      >
        <span class="font-semibold">{{ column.title }}</span>

        <a
          v-for="link in column.links"
          :key="link.text"
          :href="isExternal(link.href) ? link.href : withBase(link.href)"
          :target="isExternal(link.href) ? '_blank' : undefined"
          :rel="isExternal(link.href) ? 'noopener' : undefined"
          class="text-description hover:text-accent w-fit transition-colors"
        >
          {{ link.text }}
        </a>
      </nav>
    </div>

    <div class="text-description mt-12 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-line-subtle pt-6">
      <span>Released under the MIT License.</span>

      <span>
        This site's shell is built with the kit —
        <a
          href="https://github.com/rsmple/eco-vue-js/blob/main/docs/.vitepress/theme/DocsLayout.vue"
          target="_blank"
          rel="noopener"
          class="hover:text-accent underline underline-offset-2 transition-colors"
        >see the layout</a>
      </span>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import {withBase} from 'vitepress'

import IconLogo from '../../../public/logo.svg?component'

const isExternal = (href: string) => /^https?:/.test(href)

const COLUMNS = [
  {
    title: 'Docs',
    links: [
      {text: 'Getting started', href: '/guide/getting-started'},
      {text: 'Components', href: '/components/button'},
      {text: 'Recipes', href: '/recipes/list-with-fields'},
      {text: 'Releases', href: '/releases'},
    ],
  },
  {
    title: 'For LLMs',
    links: [
      {text: 'llms.txt', href: '/llms.txt'},
      {text: 'llms-full.txt', href: '/llms-full.txt'},
    ],
  },
  {
    title: 'Project',
    links: [
      {text: 'GitHub', href: 'https://github.com/rsmple/eco-vue-js'},
      {text: 'npm', href: 'https://www.npmjs.com/package/eco-vue-js'},
      {text: 'Issues', href: 'https://github.com/rsmple/eco-vue-js/issues'},
    ],
  },
]
</script>
