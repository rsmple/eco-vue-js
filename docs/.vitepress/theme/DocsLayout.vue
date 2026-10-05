<template>
  <!-- The home page has no nav on wide screens and doesn't keep its space, so the page is centred in the frame. -->
  <div
    class="docs-shell"
    :class="{'[--nav-bar-width:0px]': isHome}"
  >
    <DocsNav v-if="!isHome || isTablet" />

    <WHeaderBar class="pl-[calc(var(--left-margin)+var(--nav-bar-width))] pr-(--right-margin)">
      <template #title>
        <a
          :href="withBase('/')"
          :aria-label="site.title"
          class="flex items-center gap-2.5 no-underline"
        >
          <IconLogo class="size-8 tone-primary text-tone-fill" />

          <span class="leading-none">
            <span class="text-accent text-xl font-semibold tracking-tight sm:text-2xl leading-none">EcoVue</span>
            <span class="text-description mx-4 hidden text-base font-medium tracking-[0.2em] uppercase lg:inline">UI Library</span>
          </span>
        </a>
      </template>

      <template #right>
        <nav class="hidden items-center gap-6 pl-6 text-sm font-medium md:flex">
          <a
            v-for="item in navItems"
            :key="item.link"
            :href="item.isExternal ? item.link : withBase(item.link)"
            :target="item.isExternal ? '_blank' : undefined"
            :rel="item.isExternal ? 'noopener' : undefined"
            class="transition-colors hover:text-accent"
            :class="item.isActive ? 'text-accent' : 'text-description'"
          >
            {{ item.text }}
          </a>
        </nav>

        <div class="flex items-center gap-1 pl-4 sm:gap-2 md:pl-6">
          <button
            class="
              text-description hover:text-accent flex items-center gap-2 rounded-lg p-2 transition-colors
 sm:border sm:border-line-subtle sm:py-1.5 sm:pr-2 sm:pl-3
            "
            aria-label="Search"
            aria-keyshortcuts="Meta+K /"
            @click="isSearchOpen = true"
          >
            <IconSearch class="square-4.5" />

            <span class="hidden text-sm sm:inline">Search</span>

            <kbd class="hidden rounded-md bg-surface-muted px-1.5 font-sans text-xs sm:inline">⌘K</kbd>
          </button>

          <a
            v-for="link in SOCIAL_LINKS"
            :key="link.href"
            :href="link.href"
            :aria-label="link.title"
            target="_blank"
            rel="noopener"
            class="text-description hover:text-accent hidden p-2 transition-colors sm:block"
          >
            <component
              :is="link.icon"
              class="square-5"
            />
          </a>

          <!-- The theme is only known in the browser, so the server can't render the right icon or the chosen preset. -->
          <div class="flex gap-1 sm:gap-2 items-center min-w-22">
            <ClientOnly>
              <DocsNotifyButton />

              <ThemeMenu />

              <WToggleTheme
                :model-value="isDark ? Theme.DARK : Theme.LIGHT"
                no-margin
                class="w-input-h-8"
                @update:model-value="isDark = $event === Theme.DARK"
              />
            </ClientOnly>
          </div>
        </div>
      </template>
    </WHeaderBar>

    <div class="pl-[calc(var(--left-margin)+var(--nav-bar-width))] pr-(--right-margin)">
      <VPContent>
        <template #home-hero-before>
          <DocsHomeHero />
        </template>

        <template #home-hero-after>
          <DocsHomeFeatures />

          <DocsHomeGallery />
        </template>
      </VPContent>

      <DocsHomeFooter v-if="isHome" />
    </div>

    <VPLocalSearchBox
      v-if="isSearchOpen"
      @close="isSearchOpen = false"
    />

    <KitContainers />
  </div>
</template>

<script lang="ts" setup>
import {type DefaultTheme, useData, withBase} from 'vitepress'
import VPContent from 'vitepress/dist/client/theme-default/components/VPContent.vue'
import {layoutInfoInjectionKey, registerWatchers} from 'vitepress/dist/client/theme-default/composables/layout.js'
import {computed, defineAsyncComponent, markRaw, onBeforeUnmount, onMounted, provide, ref} from 'vue'

import {useIsMobile} from 'eco-vue-js/dist/utils/mobile'
import {Theme} from 'eco-vue-js/dist/utils/utils'

import WHeaderBar from 'eco-vue-js/dist/components/HeaderBar/WHeaderBar.vue'
import WToggleTheme from 'eco-vue-js/dist/components/Toggle/WToggleTheme.vue'

import IconSearch from 'eco-vue-js/dist/assets/icons/IconSearch'

import DocsHomeFeatures from './components/DocsHomeFeatures.vue'
import DocsHomeFooter from './components/DocsHomeFooter.vue'
import DocsHomeGallery from './components/DocsHomeGallery.vue'
import DocsHomeHero from './components/DocsHomeHero.vue'
import DocsNav from './components/DocsNav.vue'
import DocsNotifyButton from './components/DocsNotifyButton.vue'
import KitContainers from './components/KitContainers.vue'
import ThemeMenu from './components/ThemeMenu.vue'
import {installDocsTheme} from './docsTheme'
import IconGithub from './icons/IconGithub.svg?component'
import IconNpm from './icons/IconNpm.svg?component'

import IconLogo from '../../public/logo.svg?component'

// Loaded on first open, like VitePress does: the search index and its deps stay out of the page bundle.
const VPLocalSearchBox = defineAsyncComponent(() => import('vitepress/dist/client/theme-default/components/VPLocalSearchBox.vue'))

const SOCIAL_LINKS = [
  {title: 'GitHub', icon: markRaw(IconGithub), href: 'https://github.com/rsmple/eco-vue-js'},
  {title: 'npm', icon: markRaw(IconNpm), href: 'https://www.npmjs.com/package/eco-vue-js'},
]

const {site, theme, page, isDark, frontmatter} = useData()

const isHome = computed(() => frontmatter.value.layout === 'home')

const navItems = computed(() => ((theme.value.nav ?? []) as DefaultTheme.NavItemWithLink[]).map(item => {
  const link = typeof item.link === 'function' ? item.link(page.value) : item.link

  return {
    text: item.text,
    link,
    isExternal: /^https?:/.test(link),
    isActive: !!item.activeMatch && new RegExp(item.activeMatch).test('/' + page.value.relativePath),
  }
}))

// The parts of VitePress's own Layout that its content components rely on: sidebar and outline state, hero slots.
registerWatchers({closeSidebar: () => undefined})
provide(layoutInfoInjectionKey, {heroImageSlotExists: computed(() => false)})

// The home page hides the nav on wide screens; below xl the nav is an overlay behind the menu button anyway.
const {isTablet} = useIsMobile()

const isSearchOpen = ref(false)

const onKeydown = (event: KeyboardEvent) => {
  const isEditable = event.target instanceof HTMLElement && (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))

  if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !isEditable)) {
    event.preventDefault()
    isSearchOpen.value = true
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  installDocsTheme()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
