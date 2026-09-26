<template>
  <div class="docs-shell">
    <DocsNav
      v-if="!isHome || isTablet"
      @update:is-open="isNavOpen = $event"
    />

    <WHeaderBar class="pl-[calc(var(--left-margin)+var(--nav-bar-width))] pr-[calc(var(--right-margin)+var(--actions-bar-width))]">
      <template #title>
        <a
          :href="withBase('/')"
          class="text-accent no-underline"
        >
          {{ site.title }}
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
      </template>
    </WHeaderBar>

    <div class="pl-[calc(var(--left-margin)+var(--nav-bar-width))] pr-[calc(var(--right-margin)+var(--actions-bar-width))]">
      <VPContent />
    </div>

    <Transition
      enter-active-class="transition-[translate]"
      leave-active-class="transition-[translate]"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <WActionsBar v-if="!isMobile || isNavOpen">
        <template #top>
          <WButtonAction
            title="Search"
            :icon="markRaw(IconSearch)"
            @click="isSearchOpen = true"
          />

          <WButtonAction
            v-for="link in SOCIAL_LINKS"
            :key="link.href"
            :title="link.title"
            :icon="link.icon"
            :href="link.href"
            tag="a"
            target="_blank"
            rel="noopener"
          />
        </template>

        <template #footer>
          <!-- The theme is only known in the browser, so the server can't render the right icon. -->
          <ClientOnly>
            <WToggleTheme
              :model-value="isDark ? Theme.DARK : Theme.LIGHT"
              center
              class="mb-4"
              @update:model-value="isDark = $event === Theme.DARK"
            />
          </ClientOnly>
        </template>
      </WActionsBar>
    </Transition>

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

import WActionsBar from 'eco-vue-js/dist/components/ActionsBar/WActionsBar.vue'
import WButtonAction from 'eco-vue-js/dist/components/Button/WButtonAction.vue'
import WHeaderBar from 'eco-vue-js/dist/components/HeaderBar/WHeaderBar.vue'
import WToggleTheme from 'eco-vue-js/dist/components/Toggle/WToggleTheme.vue'

import IconSearch from 'eco-vue-js/dist/assets/icons/IconSearch'

import DocsNav from './components/DocsNav.vue'
import KitContainers from './components/KitContainers.vue'
import IconGithub from './icons/IconGithub.svg?component'
import IconNpm from './icons/IconNpm.svg?component'

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

// The home page hides the nav on wide screens but keeps its space; below xl the nav is an overlay behind the menu button anyway.
const {isMobile, isTablet} = useIsMobile()

const isNavOpen = ref(false)
const isSearchOpen = ref(false)

const onKeydown = (event: KeyboardEvent) => {
  const isEditable = event.target instanceof HTMLElement && (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))

  if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !isEditable)) {
    event.preventDefault()
    isSearchOpen.value = true
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
