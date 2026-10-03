<template>
  <section class="vp-raw relative isolate px-(--inner-margin) pt-12 pb-16 sm:pt-20 lg:pb-24">
    <div
      aria-hidden="true"
      class="
        pointer-events-none absolute -top-(--header-height) bottom-0 left-[calc((var(--left-margin)+var(--nav-bar-width))*-1)] -z-10 w-screen
        bg-[radial-gradient(40rem_28rem_at_70%_35%,color-mix(in_oklab,var(--color-primary)_22%,transparent),transparent_70%),radial-gradient(32rem_24rem_at_15%_10%,color-mix(in_oklab,var(--color-info)_10%,transparent),transparent_70%)]
        before:absolute before:inset-0 before:bg-[radial-gradient(color-mix(in_oklab,var(--color-track-strong)_35%,transparent)_1px,transparent_1px)] before:bg-size-[24px_24px]
        before:mask-radial-[60%_70%] before:mask-radial-at-[60%_40%] before:mask-radial-from-0% before:mask-radial-to-100%
      "
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

        <h1 class="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl lg:text-[4.5rem] lg:leading-none">
          <span class="from-primary-dark via-primary to-info dark:from-primary block bg-linear-120 via-0% bg-clip-text text-transparent">A single UI kit</span>
          <span class="block">for your entire ecosystem</span>
        </h1>

        <p class="text-description mx-auto mt-5 max-w-xl text-lg text-pretty sm:text-xl lg:mx-0">
          Lists, forms and queries that tame complex data. Themes you shape in minutes. A project setup that's ready on day one — so every Vue 3 app you ship feels like part of one family.
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
            bg-surface-subtle mt-6 inline-flex items-center gap-3 rounded-xl border border-line-subtle
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
