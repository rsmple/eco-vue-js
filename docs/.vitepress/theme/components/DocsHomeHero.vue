<template>
  <section class="docs-home-hero vp-raw relative isolate px-(--inner-margin) pt-12 pb-16 sm:pt-20 lg:pb-24">
    <div
      aria-hidden="true"
      class="docs-home-backdrop pointer-events-none absolute -top-(--header-height) bottom-0 -z-10 w-screen"
    />

    <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,42rem)] xl:gap-16">
      <div class="text-center lg:text-left">
        <a
          v-if="release"
          :href="withBase('/releases')"
          class="
            tone-primary border-tone-line/40 text-description hover:text-accent hover:border-tone-line mb-6 inline-flex items-center gap-2
 rounded-full border px-3 py-1 text-sm font-medium transition-colors
          "
        >
          <span class="tone-positive bg-tone-fill size-2 rounded-full" />
          {{ release.text }} — release notes
        </a>

        <h1 class="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
          <span class="docs-home-name block">EcoVue UI Library</span>
          <span class="block">Vue 3 UI kit on Tailwind v4</span>
        </h1>

        <p class="text-description mx-auto mt-5 max-w-xl text-lg text-pretty sm:text-xl lg:mx-0">
          Components, list and form building blocks, query utilities, icons — plus a shared eslint config.
        </p>

        <div class="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
          <WButton
            :semantic-type="SemanticType.PRIMARY"
            :href="withBase('/guide/getting-started')"
            tag="a"
          >
            Get started
          </WButton>

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            :href="withBase('/components/button')"
            tag="a"
          >
            Components
          </WButton>

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            :href="withBase('/llms.txt')"
            tag="a"
            target="_blank"
          >
            llms.txt
          </WButton>
        </div>

        <div
          class="
            bg-gray-100 dark:bg-gray-850 mt-6 inline-flex items-center gap-3 rounded-xl border border-line-subtle
 py-2 pr-3 pl-4 font-mono text-sm
          "
        >
          <span
            aria-hidden="true"
            class="text-description select-none"
          >$</span>

          <code>{{ INSTALL_COMMAND }}</code>

          <WButtonCopy :value="INSTALL_COMMAND" />
        </div>
      </div>

      <DocsHomeShowcase />
    </div>
  </section>
</template>

<script lang="ts" setup>
import {type DefaultTheme, useData, withBase} from 'vitepress'
import {computed} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WButtonCopy from 'eco-vue-js/dist/components/Button/WButtonCopy.vue'

import DocsHomeShowcase from './DocsHomeShowcase.vue'

const INSTALL_COMMAND = 'npm i eco-vue-js'

const {theme} = useData()

const release = computed(() => ((theme.value.nav ?? []) as DefaultTheme.NavItemWithLink[]).find(item => item.link === '/releases'))
</script>

<style scoped>
.docs-home-backdrop {
  left: calc((var(--left-margin) + var(--nav-bar-width)) * -1);
  background:
    radial-gradient(40rem 28rem at 70% 35%, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 70%),
    radial-gradient(32rem 24rem at 15% 10%, color-mix(in oklab, var(--color-info) 10%, transparent), transparent 70%);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: radial-gradient(color-mix(in oklab, var(--color-gray-400) 35%, transparent) 1px, transparent 1px);
    background-size: 24px 24px;
    mask-image: radial-gradient(ellipse 60% 70% at 60% 40%, black, transparent);
  }
}

.docs-home-name {
  background: linear-gradient(120deg, var(--color-primary-dark), var(--color-primary) 60%, var(--color-info));
  background-clip: text;
  color: transparent;
}

.dark .docs-home-name {
  background-image: linear-gradient(120deg, var(--color-primary), var(--color-info));
}
</style>
