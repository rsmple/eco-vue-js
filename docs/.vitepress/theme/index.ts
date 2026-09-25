import {QueryClient, VueQueryPlugin} from '@tanstack/vue-query'
import {type Theme, inBrowser} from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue'
import {h} from 'vue'

import {setQueryClient} from '@/utils/queryClient'

import DocsDemo from './components/DocsDemo.vue'
import IconGallery from './components/IconGallery.vue'
import KitContainers from './components/KitContainers.vue'

import './style.css'

const queryClient = new QueryClient({
  defaultOptions: {queries: {retry: false, refetchOnWindowFocus: false}},
})

if (inBrowser) setQueryClient(queryClient)

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-bottom': () => h(KitContainers),
  }),
  enhanceApp({app}) {
    app.use(VueQueryPlugin, {queryClient})
    app.component('CopyOrDownloadAsMarkdownButtons', CopyOrDownloadAsMarkdownButtons)
    app.component('DocsDemo', DocsDemo)
    app.component('IconGallery', IconGallery)
  },
} satisfies Theme
