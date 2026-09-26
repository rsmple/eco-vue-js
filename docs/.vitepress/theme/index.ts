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

const createQueryClient = () => new QueryClient({
  defaultOptions: {queries: {retry: false, refetchOnWindowFocus: false}},
})

// One client in the browser. On the server every page render gets its own, like one per request in an SSR app:
// pages render in one process, so a shared cache would leak data fetched during one render into the next.
const browserQueryClient = inBrowser ? createQueryClient() : undefined

if (browserQueryClient) setQueryClient(browserQueryClient)

export default {
  extends: DefaultTheme,
  // VitePress renders the Markdown; the page chrome is the kit's own app shell.
  Layout: DocsLayout,
  enhanceApp({app, router, siteData}) {
    installKitRouter(app, router, siteData.value.base)
    app.use(VueQueryPlugin, {queryClient: browserQueryClient ?? createQueryClient()})
    app.component('CopyOrDownloadAsMarkdownButtons', CopyOrDownloadAsMarkdownButtons)
    app.component('DocsDemo', DocsDemo)
    app.component('IconGallery', IconGallery)
  },
} satisfies Theme
