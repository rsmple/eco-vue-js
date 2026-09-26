import {QueryClient, VueQueryPlugin} from '@tanstack/vue-query'
import {type Theme, inBrowser} from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue'

import {setQueryClient} from '@/utils/queryClient'

import DocsLayout from './DocsLayout.vue'
import DocsDemo from './components/DocsDemo.vue'
import IconGallery from './components/IconGallery.vue'
import {installKitRouter} from './router'

import './style.css'

const queryClient = new QueryClient({
  defaultOptions: {queries: {retry: false, refetchOnWindowFocus: false}},
})

if (inBrowser) setQueryClient(queryClient)

export default {
  extends: DefaultTheme,
  // VitePress renders the Markdown; the page chrome is the kit's own app shell.
  Layout: DocsLayout,
  enhanceApp({app, router, siteData}) {
    installKitRouter(app, router, siteData.value.base)
    app.use(VueQueryPlugin, {queryClient})
    app.component('CopyOrDownloadAsMarkdownButtons', CopyOrDownloadAsMarkdownButtons)
    app.component('DocsDemo', DocsDemo)
    app.component('IconGallery', IconGallery)
  },
} satisfies Theme
